# app/routers/zeek.py
from fastapi import APIRouter
from typing import List, Dict, Any

from ..state import app_state

router = APIRouter()

@router.get("/connections", response_model=List[Dict[str, Any]])
async def get_zeek_connections():
    """
    Returns the most recent connection logs captured by Zeek.
    This data is held in memory and is useful for real-time visibility.
    """
    
    # Acquire the lock to safely read the deque
    with app_state.zeek_lock:
        # A deque is already thread-safe for appends, but creating a list
        # from it should be locked to prevent any iteration issues.
        # We return the logs in reverse so the newest appear first.
        return list(reversed(app_state.zeek_conn_logs))
