# backend/app/services/alert_service.py
import os
import json
from elasticsearch import Elasticsearch

# Read the ES_HOST from the environment variables in your docker-compose file
es_host = os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")
es_client = Elasticsearch(es_host)

def get_latest_alerts(size=20):
    """
    Fetches the latest alerts from Elasticsearch and parses the nested JSON.
    """
    try:
        response = es_client.search(
            index="filebeat-*",
            body={
              "size": size,
              "sort": [{"@timestamp": {"order": "desc"}}]
            }
        )

        clean_alerts = []
        for hit in response["hits"]["hits"]:
            # This is where we unlock the data
            raw_source = hit.get("_source", {})
            message_str = raw_source.get("message")
            
            if message_str:
                try:
                    # Parse the JSON string inside the "message" field
                    alert_data = json.loads(message_str)
                    clean_alerts.append(alert_data)
                except json.JSONDecodeError:
                    # Handle cases where the message is not valid JSON
                    clean_alerts.append({"raw_message": message_str})

        return clean_alerts
        
    except Exception as e:
        print(f"Error connecting to or querying Elasticsearch: {e}")
        return []