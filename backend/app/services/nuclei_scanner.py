# backend/app/services/nuclei_scanner.py
import subprocess
import json
import os
import tempfile
from sqlalchemy.orm import Session
from sqlalchemy.dialects.mysql import insert
from elasticsearch import Elasticsearch, helpers
from .. import models

ELASTICSEARCH_URI = os.environ.get("ELASTICSEARCH_URI", "http://127.0.0.1:9200")
ES_INDEX = "nuclei_findings"

class NucleiScanner:
    def __init__(self, db: Session):
        self.db = db
        self.es = Elasticsearch([ELASTICSEARCH_URI])
        if not self.es.indices.exists(index=ES_INDEX):
            self.es.indices.create(index=ES_INDEX)

    def _parse_and_prepare(self, output_file: str):
        findings = []
        with open(output_file, 'r') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    finding = {
                        "template_id": data.get("template-id"),
                        "host": data.get("host"),
                        "name": data.get("info", {}).get("name"),
                        "severity": data.get("info", {}).get("severity"),
                        "description": data.get("info", {}).get("description"),
                        "extracted_results": "\n".join(data.get("extracted-results", [])),
                        "matched_at": data.get("matched-at"),
                    }
                    findings.append(finding)
                except json.JSONDecodeError:
                    print(f"Warning: Could not decode JSON line: {line.strip()}")
        return findings

    def _save_to_mysql(self, findings: list):
        if not findings:
            return
        
        insert_stmt = insert(models.NucleiFinding).values(findings)
        # Assuming you want to add new findings and ignore duplicates from the same scan
        # For more complex logic (e.g., updates), this would change.
        # This IGNORE variant is specific to MySQL and requires a unique index to work properly.
        # For simplicity here, we insert all. You can add unique constraints later.
        self.db.execute(insert_stmt)
        self.db.commit()

    def _save_to_elasticsearch(self, findings: list):
        if not findings:
            return

        actions = [
            {
                "_index": ES_INDEX,
                "_source": item,
            }
            for item in findings
        ]
        helpers.bulk(self.es, actions)
    
    def run_scan(self, target: str):
        # Create a temporary file to store JSON output
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=".json") as tmp_file:
            output_file_path = tmp_file.name
        
        # Build and run the Nuclei command
        command = [
            "nuclei",
            "-target", target,
            "-json",              # Output in JSON format
            "-o", output_file_path # Write to our temp file
        ]
        
        print(f"Running Nuclei scan: {' '.join(command)}")
        # We don't need real-time output, just run and wait for it to complete
        subprocess.run(command, capture_output=True, text=True)

        # Process the results
        parsed_findings = self._parse_and_prepare(output_file_path)
        print(f"Scan complete. Found {len(parsed_findings)} potential findings.")
        
        # Save to databases
        if parsed_findings:
            self._save_to_mysql(parsed_findings)
            self._save_to_elasticsearch(parsed_findings)
        
        # Clean up the temporary file
        os.unlink(output_file_path)
        
        return parsed_findings