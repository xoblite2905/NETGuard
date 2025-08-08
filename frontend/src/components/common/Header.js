// src/components/common/Header.js

import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react'; // Shield is no longer needed
import { useTheme } from '../../context/ThemeContext';

// Import your logos
import logoDark from '../../assets/logo.png'; // Path to your dark mode logo
import logoLight from '../../assets/logo2.png'; // Path to your light mode logo

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

const Header = () => {
    const { chartColors, isDarkMode, theme } = useTheme(); // Get the theme string
    const navItems = ['Overview', 'Threat Intel', 'Endpoints', 'Packet Stream', 'Reports'];
    const [activeItem, setActiveItem] = useState('Overview');

    const activeBorderColor = isDarkMode ? chartColors.highlight : '#5C6CEC';

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-light-bg/90 dark:bg-dark-bg/80 backdrop-blur-lg shadow-sm mb-6">
            <div className="flex items-center gap-8">
                {/* --- LOGO START --- */}
                {/* The logo now switches based on the theme */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <img
                      // Conditionally set the src based on the theme
                      src={theme === 'dark' ? logoDark : logoLight}
                      alt="Cybreon Logo"
                      // h-8 ensures the height is 32px, matching the old icon size
                      className="h-8 w-auto transition-transform duration-300 group-hover:scale-110"
                    />
                    <h1 className="text-2xl font-bold tracking-tight text-light-text dark:text-dark-text">Cybreon</h1>
                </div>
                {/* --- LOGO END --- */}

                <nav className="hidden lg:flex items-center gap-2">
                    {navItems.map((item) => (
                        <a
                            key={item}
                            href="#"
                            onClick={() => setActiveItem(item)}
                            className={`relative px-4 py-2 text-sm font-medium transition-colors outline-none
                                ${ activeItem === item
                                ? 'text-light-text dark:text-dark-text'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5 rounded-md'
                            }`}
                        >
                            {item}
                            {activeItem === item && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: activeBorderColor }}></span>
                            )}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
            </div>
        </header>
    );
};

export default Header;