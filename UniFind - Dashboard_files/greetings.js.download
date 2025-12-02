import { auth, onAuthStateChanged, getUserData } from './auth-service.js';

// Fun random messages for "Smart Mode"
const smartMessages = [
    "Feeling Good, ",
    "Hello there, ",
    "Great to see you, ",
    "Ready to learn, ",
    "Hope you have a wonderful day, ",
    "Welcome backs, ",
    "Glad you're here, "
];

// 1. Main Function to Update Display (Runs on Dashboard)
async function updateGreetingDisplay() {
    // Look for the greeting element (usually on dashboard.html)
    const headingElements = document.querySelectorAll('#dynamicText, .dynamic-text');
    if (headingElements.length === 0) return;

    // Check setting from LocalStorage (Default to FALSE/OFF)
    const isSmartEnabled = localStorage.getItem('smartGreetings') === 'true';

    onAuthStateChanged(auth, async (user) => {
        let displayName = "Student"; // Fallback name

        if (user) {
            // FIX: Fetch fresh data from Firestore (Database) to get the newest name
            const dbResult = await getUserData(user.uid);
            
            if (dbResult.success && dbResult.data.fullName) {
                // Use the name from the database (This is the one you just edited)
                displayName = dbResult.data.fullName.split(' ')[0];
            } 
            else if (user.displayName) {
                // Fallback to the Auth name if database fetch fails
                displayName = user.displayName.split(' ')[0]; 
            }
        }

        headingElements.forEach(el => {
            if (isSmartEnabled) {
                // Smart Mode: Random Message + Name
                const randomMsg = smartMessages[Math.floor(Math.random() * smartMessages.length)];
                el.textContent = `${randomMsg}${displayName}!`;
            } else {
                // Default Mode: Standard Welcome
                el.textContent = `Welcome, ${displayName}`;
            }
        });
    });
}

// 2. Initialize Toggle (Runs on Settings Page)
function initializeToggleSwitch() {
    // Matches the ID in your settings.html
    const toggleSwitch = document.getElementById('smartGreetingsToggle');
    
    // If we aren't on the settings page, this element won't exist, so we stop.
    if (!toggleSwitch) return;

    // Load saved state from LocalStorage
    const isSmartEnabled = localStorage.getItem('smartGreetings') === 'true';
    toggleSwitch.checked = isSmartEnabled;

    // Listen for changes
    toggleSwitch.addEventListener('change', function() {
        // Save new state
        localStorage.setItem('smartGreetings', this.checked);
        
        // Update text immediately if we are on a page that shows the greeting
        updateGreetingDisplay(); 
    });
}

// 3. Run on Load
document.addEventListener('DOMContentLoaded', () => {
    initializeToggleSwitch(); // Sets up the switch if on settings.html
    updateGreetingDisplay();  // Updates the text if on dashboard.html
});

// Update when tab becomes visible (refreshes the random message if you switch tabs)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateGreetingDisplay();
});