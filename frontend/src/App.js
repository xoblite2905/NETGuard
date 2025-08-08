// src/App.js

import React from 'react';
// IMPORT 1: Add the necessary components from react-router-dom
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';

import Card, { CardContent } from './components/common/Card';
import Header from './components/common/Header';
import AlertsTrendChart from './components/charts/AlertsTrendChart';
import OSDistributionChart from './components/charts/OSDistributionChart';
import LivePacketTable from './components/tables/LivePacketTable';
import ThreatOriginsChart from './components/charts/RiskSourceChart';
import HostDiscoveryTable from './components/tables/HostDiscoveryTable';
import LiveThroughputChart from './components/charts/LiveThroughputChart';
import ProtocolAnomalyChart from './components/charts/ProtocolAnomalyChart';
import ServiceDistributionChart from './components/charts/ServiceDistributionChart';
import VulnerabilityTable from './components/tables/VulnerabilityTable';
import TrafficOverTimeProtocolChart from './components/charts/TrafficOverTimeProtocolChart';
import ProtocolDistributionChart from './components/charts/ProtocolDistributionChart';

// IMPORT 2: Your existing Welcome Page
import WelcomePage from './pages/WelcomePage';
// ===============================================================
// IMPORT 3: Import the new Authentication Page
// ===============================================================
import AuthPage from './pages/AuthPage';


// ===============================================================
// NO LOSS OF DATA: Your original components are preserved here
// ===============================================================

const LinearProgressBar = ({ score, label = "Health Score" }) => {
  const { chartColors } = useTheme();
  const scoreColor = score > 80 ? chartColors.status.good : score > 60 ? chartColors.status.medium : chartColors.status.bad;
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-800 dark:text-white">{label}</span>
        <span className="text-sm font-bold" style={{ color: scoreColor }}>{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
        <div
          className="h-4 rounded-full"
          style={{ width: `${score}%`, backgroundColor: scoreColor }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

// Your full Dashboard component, preserved exactly as it was.
function Dashboard() {
  const { hosts, vulnerabilities, alerts, threatOrigins } = useData();
  const TOP_ROW_HEIGHT = 'h-80';
  const MIDDLE_ROW_HEIGHT = 'h-72';
  const LARGE_TABLE_HEIGHT = 'h-80';

  return (
    <main className="pt-4 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card className={TOP_ROW_HEIGHT}>
          <CardContent className="flex flex-col h-full p-4 space-y-6">
            <div><LinearProgressBar score={92} /></div>
            <div className="flex flex-col flex-grow min-h-0">
              <div className="flex-grow relative">
                <div className="absolute inset-0"><AlertsTrendChart data={alerts} minimal={true} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={TOP_ROW_HEIGHT}> <OSDistributionChart data={hosts} /> </Card>
        <Card className={TOP_ROW_HEIGHT}> <TrafficOverTimeProtocolChart /> </Card>
        <Card className={TOP_ROW_HEIGHT}> <ServiceDistributionChart /> </Card>
        <Card className={TOP_ROW_HEIGHT}> <ThreatOriginsChart data={threatOrigins} /> </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className={MIDDLE_ROW_HEIGHT}> <LiveThroughputChart /> </Card>
        <Card className={MIDDLE_ROW_HEIGHT}> <ProtocolAnomalyChart /> </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className={LARGE_TABLE_HEIGHT}> <VulnerabilityTable vulnerabilities={vulnerabilities} /> </Card>
        <Card className={LARGE_TABLE_HEIGHT}> <HostDiscoveryTable hosts={hosts} /> </Card>
      </div>
      <Card className={LARGE_TABLE_HEIGHT}> <LivePacketTable /> </Card>
    </main>
  );
}


// ===============================================================
// PROFESSIONAL RESTRUCTURE: Your preserved layout component
// ===============================================================

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg font-sans">
            <Header />
            <Dashboard />
        </div>
    );
};

// Your App component is now a clean, professional router controller.
function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* ROUTE 1: The root path "/" now renders your complete Dashboard */}
            <Route path="/" element={<DashboardLayout />} />
            
            {/* ROUTE 2: The "/welcome" path now renders your beautiful Welcome Page */}
            <Route path="/welcome" element={<WelcomePage />} />
            
            {/* =============================================================== */}
            {/* ROUTE 3: The new "/login" path for user authentication */}
            {/* =============================================================== */}
            <Route path="/login" element={<AuthPage />} />

          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;