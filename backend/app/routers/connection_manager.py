# app/routers/connection_manager.py
# (FINAL, WORKING VERSION)
from fastapi import WebSocket
import logging
import asyncio

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Manages active WebSocket connections and provides a simple way to broadcast
    messages to all connected clients.
    """
    def __init__(self):
        # A list to hold all active WebSocket connections
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accepts a new WebSocket connection and adds it to our list."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Removes a WebSocket connection from our list when a client disconnects."""
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """
        Broadcasts a text message to all currently connected WebSocket clients.
        
        This is an 'async' function, making it directly compatible with the
        'asyncio.run()' call from our background log-parsing thread.
        """
        # We don't want a single disconnected client to stop the broadcast to others,
        # so we iterate safely.
        
        disconnected_clients = []
        for connection in self.active_connections:
            try:
                # The 'await' is crucial. It sends the message.
                await connection.send_text(message)
            except Exception as e:
                # This typically happens if a client closed their browser tab.
                # We can't send a message to a closed connection.
                logger.warning(f"Failed to send message to a client (will disconnect): {e}")
                disconnected_clients.append(connection)

        # Clean up any connections that broke during the broadcast.
        for client in disconnected_clients:
            self.active_connections.remove(client)


# Create a single, global instance of the manager that will be imported
# and used by the rest of the application.
manager = ConnectionManager()
