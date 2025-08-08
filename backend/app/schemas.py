# backend/app/schemas.py

from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class OrmConfig(BaseModel):
    class Config:
        orm_mode = True

# --- Schemas required for Authentication ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserSchema(OrmConfig):
    id: int
    email: str

class UserCreateSchema(BaseModel):
    email: str
    password: str

# --- Schemas for Dashboard Data ---

class PortSchema(OrmConfig):
    id: int
    port_number: int
    protocol: str
    service_name: Optional[str] = None

class VulnerabilitySchema(OrmConfig):
    id: int
    host_ip: str
    port: Optional[int]
    service: Optional[str]
    cve: Optional[str] = None
    description: str
    severity: Optional[str]
    source: str 

class HostSchema(OrmConfig):
    id: int
    ip_address: str
    hostname: Optional[str] = None
    mac_address: Optional[str] = None
    vendor: Optional[str] = None
    os_name: Optional[str] = None
    status: str
    last_seen: datetime
    ports: List[PortSchema] = []
    vulnerabilities: List[VulnerabilitySchema] = []
    country_code: Optional[str] = None
    country_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# ### --- THIS IS THE FIX --- ###
# The PacketSchema has been updated to match the fields from Elasticsearch
# It no longer uses OrmConfig because it's not mapping to a database model.
class PacketSchema(BaseModel):
    timestamp: datetime = Field(..., alias='@timestamp')
    source_ip: str
    destination_ip: str
    source_mac: Optional[str] = None
    destination_mac: Optional[str] = None
    protocol: str
    length: int
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    ttl: Optional[int] = None
    # Flags are not sent in the current tshark format, so we can omit this field
    # or keep it as Optional[str] = None if it might be added later. Omitting is cleaner.
    
    class Config:
        # This tells Pydantic to read from a field named '@timestamp'
        # when populating the 'timestamp' attribute.
        populate_by_name = True 
        from_attributes = True


class SecurityAlertSchema(OrmConfig):
    id: int
    timestamp: datetime
    signature: str
    severity: str
    source_ip: str
    dest_ip: str = Field(..., alias='destination_ip')
    protocol: str

class ThreatIntelSummarySchema(BaseModel):
    source: str
    count: int

class ProtocolDistribution(BaseModel):
    protocol: str
    count: int
    class Config:
        orm_mode = True