// src/components/charts/TrafficOverTimeProtocolChart.js

import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

// NEW: Mock data with more protocols to demonstrate the new color scheme.
// This allows us to see the design without changing your backend data source.
const mockDataWithMoreProtocols = [
  { protocol: 'TCP', count: 420 },
  { protocol: 'UDP', count: 280 },
  { protocol: 'HTTP', count: 150 },
  { protocol: 'ICMP', count: 95 },
  { protocol: 'DNS', count: 80 },
  { protocol: 'SSH', count: 45 },
  { protocol: 'FTP', count: 30 },
];


const TrafficOverTimeProtocolChart = () => {
    const { isDarkMode, chartColors } = useTheme();
    // const { protocolDistribution } = useData(); // TODO: UNCOMMENT this line to use your real data later.

    // For now, we use our mock data to design the component.
    // TODO: REMOVE this line when you switch back to your real data.
    const protocolDistribution = mockDataWithMoreProtocols; 

    // Data transformation logic remains the same
    const totalBytes = protocolDistribution.reduce((acc, item) => acc + item.count, 0);
    const series = totalBytes > 0 ? protocolDistribution.map(item => Math.round((item.count / totalBytes) * 100)) : [];
    const labels = protocolDistribution.map(item => item.protocol.toUpperCase());

    const options = {
        chart: { type: 'radialBar' },
        plotOptions: {
            radialBar: {
                offsetY: -15,
                hollow: { margin: 5, size: '60%', background: 'transparent' },
                track: { background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
                dataLabels: {
                    name: { show: false },
                    value: { show: false },
                },
            },
        },
        labels: labels,
        // The chart now uses our beautiful new palette from the theme context.
        colors: chartColors.protocolDistribution,
        legend: {
            show: true,
            position: 'bottom',
            fontFamily: 'inherit',
            fontSize: '12px',
            // Uses the centralized text color for the legend.
            labels: { colors: chartColors.textColor },
            markers: { width: 8, height: 8, radius: 4 },
            itemMargin: { horizontal: 8, vertical: 2 },
        },
        stroke: { lineCap: 'round' },
        tooltip: {
            enabled: true,
            theme: isDarkMode ? 'dark' : 'light',
            y: { formatter: (val) => `${val}% of traffic` }
        }
    };

    return (
        <div className="h-full flex flex-col justify-start">
            <h3 className="text-md font-semibold text-center text-gray-800 dark:text-gray-200 mb-2">
                Traffic by Protocol
            </h3>
            {series.length > 0 ? (
                <div className="flex-grow">
                     <Chart options={options} series={series} type="radialBar" height="100%" />
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Waiting for protocol data...</p>
                </div>
            )}
        </div>
    );
};

export default TrafficOverTimeProtocolChart;