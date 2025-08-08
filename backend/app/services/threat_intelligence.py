# backend/app/services/threat_intelligence.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas
from geoip2.database import Reader
from geoip2.errors import AddressNotFoundError
import os

# Assume you will place the GeoLite2 database in your project's database folder
GEOIP_DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'GeoLite2-Country.mmdb')

# It's efficient to load the reader once at startup.
try:
    geoip_reader = Reader(GEOIP_DB_PATH)
except FileNotFoundError:
    geoip_reader = None

def get_country_from_ip(ip: str):
    if not geoip_reader or not ip or ip == '127.0.0.1': # Avoid looking up localhost
        return "Unknown"
    try:
        response = geoip_reader.country(ip)
        return response.country.iso_code
    except AddressNotFoundError:
        return "Local" # IPs like 192.168.x.x won't be found, so we label them 'Local'
    except Exception:
        return "Unknown"

def get_threat_intel_summary(db: Session):
    """Calculates and returns a summary of threat intelligence data."""
    try:
        total_alerts = db.query(func.count(models.SecurityAlert.id)).scalar()
        high_severity_alerts = db.query(func.count(models.SecurityAlert.id)).filter(models.SecurityAlert.severity == 1).scalar()
        unique_attackers = db.query(func.count(func.distinct(models.SecurityAlert.source_ip))).scalar()

        attacker_ips = db.query(models.SecurityAlert.source_ip).distinct().limit(100).all()
        country_counts = {}
        for ip, in attacker_ips:
            country = get_country_from_ip(ip)
            country_counts[country] = country_counts.get(country, 0) + 1
            
        countries = [{"country": name, "count": count} for name, count in country_counts.items()]
        countries = sorted(countries, key=lambda x: x['count'], reverse=True)

        # Correctly populate the schema with the queried data
        return schemas.ThreatIntelSummarySchema(
            total_alerts=total_alerts or 0,
            high_severity_alerts=high_severity_alerts or 0,
            unique_attackers=unique_attackers or 0,
            countries=countries
        )
    except Exception as e:
        print(f"Error generating threat intel summary: {e}")
        # Return a valid default state to prevent the API from crashing
        return schemas.ThreatIntelSummarySchema(total_alerts=0, high_severity_alerts=0, unique_attackers=0, countries=[])
