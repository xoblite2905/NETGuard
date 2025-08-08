// src/components/tables/DataTable.js
import React from 'react';

// Helper function to get a nested property from an object (e.g., 'host.ip_address')
const getNestedProperty = (obj, path) => {
    if (!path) return 'N/A';
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const DataTable = ({ data, columns, headers }) => {
    const tableHeaders = headers || columns;

    return (
        // Added title to the Vulnerability table
        <>
            <h2 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex-shrink-0">
                Vulnerabilities
            </h2>
            <div className="h-full overflow-y-auto flex-grow min-h-0">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    {/* ---V- THEME CHANGE IS HERE -V--- */}
                    <thead className="text-xs text-gray-700 uppercase dark:text-gray-300 sticky top-0">
                    {/* ---^- END OF THEME CHANGE -^--- */}
                        <tr>
                            {tableHeaders.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data && data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                /* ---V- THEME CHANGE IS HERE -V--- */
                                <tr key={row.id || rowIndex} className="hover:bg-black/5 dark:hover:bg-white/5">
                                {/* ---^- END OF THEME CHANGE -^--- */}
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4">
                                            {getNestedProperty(row, col) || 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                                    No data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};
export default DataTable;
