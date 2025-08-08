// src/components/tables/HostDiscoveryTable.js
import React from 'react';
// The Card components are no longer needed here since App.js now wraps this in a Card.
// import Card, { CardTitle, CardContent } from '../common/Card'; 

const getStatusColor = (status) => (status === 'up' ? 'bg-green-500' : 'bg-red-500');

const HostDiscoveryTable = ({ hosts }) => {
    return (
        // The wrapping Card and CardContent have been removed to avoid a nested card style.
        <> 
            <h2 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex-shrink-0">
                Asset Intel: Host Discovery
            </h2>
            <div className="h-full overflow-y-auto flex-grow min-h-0">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    {/* ---V- THEME CHANGE IS HERE -V--- */}
                    {/* The specific background colors have been removed to allow the parent Card color to show. */}
                    <thead className="text-xs text-gray-700 uppercase dark:text-gray-300 sticky top-0">
                    {/* ---^- END OF THEME CHANGE -^--- */}
                        <tr>
                            <th scope="col" className="px-6 py-3">Hostname</th>
                            <th scope="col" className="px-6 py-3">IP Address</th>
                            <th scope="col" className="px-6 py-3">OS</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {hosts && hosts.length > 0 ? (
                            hosts.map((host) => (
                                /* ---V- THEME CHANGE IS HERE -V--- */
                                /* Removed background colors and updated the hover effect for the new theme. */
                                <tr key={host.id || host.ip_address} className="hover:bg-black/5 dark:hover:bg-white/5">
                                {/* ---^- END OF THEME CHANGE -^--- */}
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{host.hostname || 'N/A'}</td>
                                    <td className="px-6 py-4">{host.ip_address}</td>
                                    <td className="px-6 py-4 text-xs italic">{host.os_name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(host.status)} mr-2`}></span>
                                            <span className="capitalize">{host.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-400">
                                    Awaiting host scan results from backend...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};
export default HostDiscoveryTable;
