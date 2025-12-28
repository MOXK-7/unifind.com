/**
 * water-reminder.js
 * A fun toast notification to remind students to hydrate.
 * Fully customizable by user through settings
 */

// Store timeout and interval references
let hideTimeout = null;
let reminderInterval = null;

// --- MESSAGES ---
const hydrationMessages = [
    { icon: "💧", title: "Hydration Check!", text: "You are not a cactus.<br>Drink some water." },
    { icon: "🧠", title: "Brain Power Boost", text: "Your brain is 75% water.<br>Keep it moist!" },
    { icon: "⚡", title: "Focus Fuel", text: "Struggling to focus?<br>A sip of water might help." },
    { icon: "✨", title: "Glow Up", text: "Water is the best skincare.<br>Drink up!" },
    { icon: "💪", title: "Energy Boost", text: "Feeling tired?<br>Water can help wake you up!" },
    { icon: "🎯", title: "Stay Sharp", text: "Dehydration kills focus.<br>Take a sip!" }
];

// Get user settings from localStorage
function getSettings() {
    return {
        enabled: localStorage.getItem('waterReminderEnabled') !== 'false',
        interval: parseInt(localStorage.getItem('waterReminderInterval') || '30'),
        duration: parseInt(localStorage.getItem('waterReminderDuration') || '7') * 1000,
        delay: parseInt(localStorage.getItem('waterReminderDelay') || '2') * 1000
    };
}

// Check if water reminders are enabled
function isWaterReminderEnabled() {
    return getSettings().enabled;
}

// Inject CSS styles dynamically
function injectWaterStyles() {
    // Prevent duplicate injection
    if (document.getElementById('cactus-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cactus-styles';
    style.innerHTML = `
        /* Toast Container */
        #cactus-toast {
            visibility: hidden;
            min-width: 300px;
            max-width: 350px;
            background-color: var(--bg-card, #fff);
            color: var(--text-dark, #333);
            text-align: left;
            border-radius: 12px;
            padding: 16px;
            position: fixed;
            z-index: 999;
            top: 90px;
            right: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            border-left: 6px solid #3498db;
            display: flex;
            align-items: center;
            gap: 15px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        /* Visible State */
        #cactus-toast.show {
            visibility: visible;
            transform: translateX(0);
            opacity: 1;
        }

        /* Icon Styling - NO ANIMATION */
        .cactus-icon {
            font-size: 2.5rem;
            flex-shrink: 0;
            line-height: 1;
            font-style: normal;
        }

        /* Text Styling */
        .cactus-content {
            flex: 1;
        }

        .cactus-content h4 {
            margin: 0 0 4px 0;
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-dark, #2980b9);
        }

        .cactus-content p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-secondary, #666);
            line-height: 1.4;
        }

        /* Close Button */
        .cactus-close {
            margin-left: auto;
            cursor: pointer;
            color: var(--text-grey, #999);
            font-size: 1.5rem;
            line-height: 1;
            padding: 0 4px;
            transition: color 0.2s;
            flex-shrink: 0;
            background: none;
            border: none;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }
        
        .cactus-close:hover {
            color: var(--text-dark, #333);
        }

        /* Responsive */
        @media (max-width: 768px) {
            #cactus-toast {
                top: 70px;
                right: 15px;
                left: 15px;
                min-width: auto;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(style);
}

// Create HTML Structure
function createToastHTML() {
    // Prevent duplicate toast
    if (document.getElementById('cactus-toast')) return;
    
    const toastDiv = document.createElement('div');
    toastDiv.id = 'cactus-toast';
    
    toastDiv.innerHTML = `
        <span class="cactus-icon">💧</span>
        <div class="cactus-content">
            <h4 id="water-title">Hydration Check!</h4>
            <p id="water-text">You are not a cactus.<br>Drink some water.</p>
        </div>
        <button class="cactus-close" aria-label="Close reminder">×</button>
    `;
    
    document.body.appendChild(toastDiv);
    
    // Attach close event listener
    const closeBtn = toastDiv.querySelector('.cactus-close');
    closeBtn.addEventListener('click', closeWaterToast);
}

// Show toast with random message
export function showWaterReminder() {
    if (!isWaterReminderEnabled()) return;
    
    const toast = document.getElementById("cactus-toast");
    if (!toast) return;
    
    const settings = getSettings();
    
    // Clear any existing timeout
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }
    
    // Get random message
    const msg = hydrationMessages[Math.floor(Math.random() * hydrationMessages.length)];
    
    // Update icon and text
    const iconEl = toast.querySelector('.cactus-icon');
    if (iconEl) iconEl.textContent = msg.icon;
    
    const titleEl = document.getElementById("water-title");
    if (titleEl) titleEl.textContent = msg.title;
    
    const textEl = document.getElementById("water-text");
    if (textEl) textEl.innerHTML = msg.text;
    
    // Show toast
    toast.classList.add("show");
    
    // Hide after duration (from settings)
    hideTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, settings.duration);
}

// Close toast manually
function closeWaterToast() {
    const toast = document.getElementById("cactus-toast");
    if (toast) {
        toast.classList.remove("show");
    }
    
    // Clear the auto-hide timeout
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }
}

// Cleanup interval only
function cleanupInterval() {
    if (reminderInterval) {
        clearInterval(reminderInterval);
        reminderInterval = null;
    }
}

// Start reminder interval
function startReminderInterval() {
    // Clean up existing interval first
    cleanupInterval();
    
    // Only start if enabled
    if (!isWaterReminderEnabled()) return;
    
    const settings = getSettings();
    
    // Set up interval for reminders (interval in minutes)
    reminderInterval = setInterval(() => {
        showWaterReminder();
    }, settings.interval * 60 * 1000);
    
    console.log(`💧 Reminder interval set to ${settings.interval} minutes`);
}

// Cleanup function
export function cleanupWaterService() {
    cleanupInterval();
    
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }
    
    // Remove toast and styles
    const toast = document.getElementById('cactus-toast');
    if (toast) toast.remove();
    
    const styles = document.getElementById('cactus-styles');
    if (styles) styles.remove();
    
    console.log("💧 Hydration Service Stopped");
}

// Initialize
export function initWaterService() {
    // Clean up any existing instance
    cleanupWaterService();
    
    // Check if water reminder is enabled
    if (!isWaterReminderEnabled()) {
        console.log("💧 Hydration Service Disabled");
        return;
    }
    
    const settings = getSettings();
    
    injectWaterStyles();
    createToastHTML();
    
    console.log("💧 Hydration Service Started");
    console.log(`   - Interval: ${settings.interval} minutes`);
    console.log(`   - Duration: ${settings.duration / 1000} seconds`);
    console.log(`   - First delay: ${settings.delay / 1000} seconds`);
    
    // Show first reminder on entrance (after user-defined delay)
    setTimeout(() => {
        showWaterReminder();
    }, settings.delay);
    
    // Set up interval for subsequent reminders
    startReminderInterval();
    
    // Make functions available globally
    window.closeWaterToast = closeWaterToast;
    window.showWaterReminder = showWaterReminder;
    window.cleanupWaterService = cleanupWaterService;
    window.initWaterService = initWaterService;
}

// Listen for settings changes from settings page
window.addEventListener('waterReminderSettingsChanged', () => {
    if (isWaterReminderEnabled()) {
        console.log("💧 Settings changed, reinitializing...");
        initWaterService();
    }
});

// Listen for storage changes (when settings change in another tab)
window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('waterReminder')) {
        if (isWaterReminderEnabled()) {
            console.log("💧 Settings changed in another tab, reinitializing...");
            initWaterService();
        } else {
            cleanupWaterService();
        }
    }
});

// Auto-initialize if script is loaded in browser context
if (typeof window !== 'undefined') {
    // Initialize after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWaterService);
    } else {
        // DOM already loaded, initialize immediately
        initWaterService();
    }
}