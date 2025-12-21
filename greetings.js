import { auth, onAuthStateChanged, getUserData } from './auth-service.js';

// Fun random messages for "Smart Mode"
const smartMessages = [
    "Feeling Good, ",
    "Hello there, ",
    "Great to see you, ",
    "Ready to learn, ",
    "Hope you have a wonderful day, ",
    "Welcome back, ",
    "Glad you're here, "
];

// 1. Exported Function to Update Display
export async function updateGreetingDisplay(user) {
    const headingElements = document.querySelectorAll('#dynamicText, .dynamic-text');
    if (headingElements.length === 0) return;

    // Check setting from LocalStorage
    const isSmartEnabled = localStorage.getItem('smartGreetings') === 'true';

    // If Smart Greetings are OFF, hide everything immediately
    if (!isSmartEnabled) {
        headingElements.forEach(el => el.style.display = 'none');
        return;
    }

    // If Smart Greetings are ON, allow display
    let displayName = "Student"; 

    if (user) {
        if (user.displayName) {
            displayName = user.displayName.split(' ')[0];
        }

        // Fetch fresh data from Firestore
        getUserData(user.uid).then(dbResult => {
            if (dbResult.success && dbResult.data.fullName) {
                const freshName = dbResult.data.fullName.split(' ')[0];
                if (freshName !== displayName) {
                    applyTextToElements(headingElements, freshName);
                }
            }
        });
    }

    applyTextToElements(headingElements, displayName);
}

function applyTextToElements(elements, name) {
    elements.forEach(el => {
        // 'block' works with the absolute positioning we added in profile-load.js
        el.style.display = 'block'; 
        
        const randomMsg = smartMessages[Math.floor(Math.random() * smartMessages.length)];
        el.textContent = `${randomMsg}${name}!`;
    });
}

// 2. Initialize Toggle (Runs on Settings Page)
export function initializeToggleSwitch() {
    const toggleSwitch = document.getElementById('smartGreetingsToggle');
    if (!toggleSwitch) return;

    const isSmartEnabled = localStorage.getItem('smartGreetings') === 'true';
    toggleSwitch.checked = isSmartEnabled;

    toggleSwitch.addEventListener('change', function() {
        localStorage.setItem('smartGreetings', this.checked);
        if (auth.currentUser) {
            updateGreetingDisplay(auth.currentUser);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeToggleSwitch(); 
});