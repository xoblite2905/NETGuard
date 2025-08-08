// src/context/DataContext.js
// --- FINAL WORKING VERSION ---
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { API_BASE_URL } from '../api/config';

const DataContext = createContext(null);
const MAX_PACKETS_IN_LIST = 100;
const POLLING_INTERVAL = 15000;

export const DataProvider = ({ children }) => {
    const { lastJsonMessage, isConnected } = useWebSocket();
    const [packets, setPackets] = useState([]);
    const [hosts, setHosts] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [threatOrigins, setThreatOrigins] = useState([]);
    const [connections, setConnections] = useState([]);
    
    // --- 1. ADD a new state for the protocol data ---
    const [protocolDistribution, setProtocolDistribution] = useState([]);

    const fetchAndSet = async (endpoint, setter, name) => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!res.ok) throw new Error(`${name} fetch failed with status: ${res.status}`);
            const data = await res.json();
            setter(data);
            console.log(`✅ Fetched data for: ${name}`);
        } catch (error) {
            console.warn(`Could not load data for ${name}. This is recoverable. Error: ${error.message}`);
        }
    };

    useEffect(() => {
        const pollData = () => {
            console.log("--- Polling for updated data... ---");
            fetchAndSet("/api/hosts/", setHosts, "Hosts");
            fetchAndSet("/api/security/alerts", setAlerts, "Alerts");
            fetchAndSet("/api/threat-intel/origins", setThreatOrigins, "Threats");
            fetchAndSet("/api/zeek/connections", setConnections, "Connections");
            // --- 2. ADD the fetch call for our new chart ---
            fetchAndSet("/api/packets/protocol-distribution", setProtocolDistribution, "ProtocolDistribution");
        }
        
        pollData();
        const interval = setInterval(pollData, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, []); 
    
    useEffect(() => {
        fetchAndSet("/api/packets?limit=50", setPackets, "Packets");
    }, []);

    useEffect(() => {
        if (lastJsonMessage && lastJsonMessage.type === 'packet_data') {
            const newPacket = lastJsonMessage.data;
            setPackets(p => [newPacket, ...p].slice(0, MAX_PACKETS_IN_LIST));
        }
    }, [lastJsonMessage]);
    
    const derivedVulnerabilities = useMemo(() => {
        return hosts.flatMap(host => host.vulnerabilities || []);
    }, [hosts]);

    const protocolTrafficTimeline = useMemo(() => {
        if (!connections || connections.length === 0) return [];
        
        const BUCKET_INTERVAL_MS = 15 * 1000; 

        const buckets = connections.reduce((acc, conn) => {
            const timestamp = new Date(conn.ts * 1000).getTime();
            const bucketStart = Math.floor(timestamp / BUCKET_INTERVAL_MS) * BUCKET_INTERVAL_MS;

            if (!acc[bucketStart]) {
                acc[bucketStart] = { time: bucketStart };
            }

            const protocol = (conn.proto || 'unknown').toUpperCase();
            const totalBytes = (conn.orig_bytes || 0) + (conn.resp_bytes || 0);

            acc[bucketStart][protocol] = (acc[bucketStart][protocol] || 0) + totalBytes;
            
            return acc;
        }, {});
        
        return Object.values(buckets).sort((a, b) => a.time - b.time);

    }, [connections]);

    const value = { 
        packets, 
        hosts, 
        vulnerabilities: derivedVulnerabilities, 
        alerts, 
        threatOrigins, 
        protocolTrafficTimeline,
        isConnected,
        // --- 3. PROVIDE the new data to the application ---
        protocolDistribution 
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);