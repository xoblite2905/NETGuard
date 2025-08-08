// src/components/tables/LivePacketTable.js

import React from 'react';
import { useData } from '../../context/DataContext';

const LivePacketTable = () => {
    const { packets } = useData();
    const formatTimestamp = (iso) => iso ? new Date(iso).toLocaleTimeString() : 'LIVE';

    return (
        <div className="h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex-shrink-0">
                Live Network Packets
            </h2>
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase dark:text-gray-300 sticky top-0 bg-light-bg dark:bg-dark-bg">
                    <tr>
                        <th scope="col" className="px-4 py-3">Time</th>
                        <th scope="col" className="px-6 py-3">Source IP</th>
                        <th scope="col" className="px-4 py-3">Src Port</th>
                        <th scope="col" className="px-6 py-3">Destination IP</th>
                        <th scope="col" className="px-4 py-3">Dest Port</th>
                        <th scope="col" className="px-4 py-3">Protocol</th>
                        <th scope="col" className="px-4 py-3">Length</th>
                        <th scope="g_iScope" className="px-6 py-3">Info</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {packets && packets.length > 0 ? (
                        packets.map((p, i) => (
                            <tr key={`${i}-${p.id || p.timestamp}`} className="hover:bg-black/5 dark:hover:bg-white/5">
                                <td className="px-4 py-3 font-mono text-xs">{formatTimestamp(p.timestamp)}</td>

                                {/* 
                                    THE FIX: Replaced 'text-white' with theme-aware classes.
                                    - In light mode, it will now use 'text-light-text' (a dark color).
                                    - In dark mode, it remains white for high contrast.
                                */}
                                <td className="px-6 py-3 font-semibold text-light-text dark:text-white">{p.source_ip || ''}</td>
                                
                                <td className="px-4 py-3">{p.source_port}</td>
                                
                                {/* Applying the same fix to the Destination IP */}
                                <td className="px-6 py-3 font-semibold text-light-text dark:text-white">{p.destination_ip || ''}</td>
                                
                                <td className="px-4 py-3">{p.destination_port}</td>
                                <td className="px-4 py-3 text-center">{p.protocol || '?'}</td>
                                <td className="px-4 py-3">{p.length} B</td>
                                <td className="px-6 py-3 truncate max-w-xs" title={p.info || ''}>{p.info || (p.protocol && !p.source_port ? 'Live Protocol Update' : '')}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center py-16 text-gray-400">Loading packet data...</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
export default LivePacketTable;