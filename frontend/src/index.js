// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <DataProvider> {/* <-- WRAP THE APP */}
        <App />
      </DataProvider>
    </ThemeProvider>
  </React.StrictMode>
);
