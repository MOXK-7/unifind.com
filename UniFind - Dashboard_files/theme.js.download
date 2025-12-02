// theme.js - Handles Theme Logic Globally

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme on Load
    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);
});

// Global function to be called by Settings Page
window.setTheme = function(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    
    // If we are on the settings page, update the button styles visually
    if (typeof updateThemeButtons === 'function') {
        updateThemeButtons(theme);
    }
};

function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
        
        // Listen for system changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (localStorage.getItem('theme') === 'system') {
                root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    } else {
        root.setAttribute('data-theme', theme);
    }
}