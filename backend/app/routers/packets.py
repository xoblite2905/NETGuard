# backend/app/routers/packets.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from elasticsearch import Elasticsearch
from .. import schemas
from ..config import settings # Import your app settings

router = APIRouter()

# Dependency to get an Elasticsearch client
def get_es_client():
    try:
        es_client = Elasticsearch(settings.ELASTICSEARCH_URI)
        yield es_client
    finally:
        es_client.close()

@router.get("", response_model=List[schemas.PacketSchema])
def get_all_packets(es: Elasticsearch = Depends(get_es_client), limit: int = 100):
    """
    Retrieves the most recent captured packets from Elasticsearch.
    """
    try:
        # Elasticsearch query to get the latest packets
        # The '@timestamp' field is automatically created by tshark -T ek
        search_body = {
            "size": limit,
            "sort": [
                { "@timestamp": { "order": "desc" }}
            ],
            "query": {
                "match_all": {}
            }
        }
        
        response = es.search(index="netguard-packets", body=search_body)
        
        # The actual documents are in the 'hits' field of the response
        packets = [hit['_source'] for hit in response['hits']['hits']]

        # The 'response_model' will validate that the data from Elasticsearch
        # matches your PacketSchema. Make sure your schema matches the data
        # being indexed in packet_capture.py.
        return packets

    except Exception as e:
        # Log the actual error for debugging
        print(f"An unexpected error occurred while querying Elasticsearch: {e}") 
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected server error occurred while querying Elasticsearch: {str(e)}"
        )


# Note: The protocol-distribution endpoint below still queries PostgreSQL.
# If you want that to work, you would also need a service that aggregates
# and stores that data in PostgreSQL, or change it to use an Elasticsearch aggregation query.
# For now, we are just fixing the main /api/packets endpoint.

from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import dependencies, models

@router.get("/protocol-distribution", response_model=List[schemas.ProtocolDistribution])
def get_protocol_distribution(db: Session = Depends(dependencies.get_db)):
    """
    Calculates the distribution of network traffic volume (in bytes)
    for each protocol (TCP, UDP, ICMP, etc.) from the PostgreSQL database.
    WARNING: This will return empty results as packet data is not stored in PostgreSQL.
    """
    try:
        protocol_bytes = (
            db.query(
                models.NetworkPacket.protocol,
                func.sum(models.NetworkPacket.length).label("count")
            )
            .group_by(models.NetworkPacket.protocol)
            .order_by(func.sum(models.NetworkPacket.length).desc())
            .all()
        )
        return [{"protocol": protocol, "count": count} for protocol, count in protocol_bytes]

    except Exception as e:
        print(f"An unexpected error occurred while fetching protocol distribution: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")