// src/components/common/Card.js
import React from 'react';

const Card = ({ children, className }) => {
    return (
        <div
            className={`
                // ---V- THEME CHANGE IS HERE -V---
                // The hard-coded dark:bg-gray-800/50 is replaced with our new theme color.
                bg-light-card dark:bg-dark-card
                // ---^- END OF THEME CHANGE -^---
                p-4 sm:p-6 
                rounded-xl 
                shadow-md 
                border-gray-200 dark:border-gray-700/60
                flex flex-col
                transition-all duration-300
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export const CardTitle = ({ children }) => (
    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex-shrink-0">
        {children}
    </h2>
);

export const CardContent = ({ children, className }) => (
    <div className={`
            flex-grow 
            h-full 
            min-h-0 
            overflow-hidden
            ${className}
        `}
    >
        {children}
    </div>
);

export default Card;
