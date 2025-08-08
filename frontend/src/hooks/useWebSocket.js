// src/hooks/useWebSocket.js
// --- FULL CODE - NO LONGER SENDS A TOKEN ---

import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = () => { // It no longer needs to accept a token
    const [lastJsonMessage, setLastJsonMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const websocketRef = useRef(null);

    const connect = useCallback(() => {
        // Construct the URL directly to the backend, with no token.
        const wsUrl = `ws://127.0.0.1:8080/api/ws/ws`;
        
        console.log("Attempting to connect to WebSocket (No Auth):", wsUrl);
        websocketRef.current = new WebSocket(wsUrl);

        websocketRef.current.onopen = () => { console.log("✅ WebSocket Connected"); setIsConnected(true); };
        websocketRef.current.onclose = () => { console.log("🔌 WebSocket Disconnected"); setIsConnected(false); };
        websocketRef.current.onerror = (error) => { console.error("❌ WebSocket Error:", error); };
        websocketRef.current.onmessage = (event) => {
            try {
                setLastJsonMessage(JSON.parse(event.data));
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };
    }, []); // Dependency array is now empty

    useEffect(() => {
        connect();
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, [connect]);

    return { lastJsonMessage, isConnected };
};
