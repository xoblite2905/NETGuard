// src/theme/chartColors.js

/**
 * A centralized, professional color palette for the dashboard.
 * The dark mode palette is derived from your primary accent colors
 * to create a vibrant, modern, and unified look.
 */

// Key accent colors from your theme
const accentPrimary = '#EE7200'; // Main orange
const accentSecondary = '#FE5000'; // Brighter orange
const accentRed = '#F43F5E';      // Vibrant red for critical items
const darkTextSecondary = '#A998BC'; // Muted text for labels

export const chartColors = {
  light: {
    // These are the original colors for light mode from your files
    textColor: '#475569',
    gridColor: '#E5E7EB',
    alerts: '#C51383', // Original light mode alert color
    protocolDistribution: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'], // Original light mode palette
  },
  dark: {
    // A modern, cohesive palette for dark mode
    textColor: darkTextSecondary,
    gridColor: 'rgba(174, 160, 248, 0.15)',
    alerts: accentPrimary, // Use the primary accent to draw attention
    // A vibrant and professional palette for distribution charts
    protocolDistribution: [
        accentPrimary,      // Main theme color
        '#8B5CF6',          // Complementary violet
        '#38BDF8',          // Striking sky blue
        accentRed,           // Critical/warning color
        '#22C55E'           // Positive/success color
    ],
  }
};