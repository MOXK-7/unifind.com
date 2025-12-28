import { 
    auth, 
    onAuthStateChanged, 
    getUserData, 
    getSavedUniversities, 
    getUserComparisons,
    logout 
} from './auth-service.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Update UI Buttons to match current theme
    const currentTheme = localStorage.getItem('theme') || 'system';
    updateThemeButtons(currentTheme);

    // 2. Initialize Data
    initSettingsPage();
});

// Make this available globally so theme.js can call it if needed
window.updateThemeButtons = function(activeTheme) {
    const buttons = {
        'light': document.getElementById('btn-light'),
        'dark': document.getElementById('btn-dark'),
        'system': document.getElementById('btn-system')
    };

    // Reset all
    Object.values(buttons).forEach(btn => {
        if(btn) btn.className = 'theme-btn'; // Base class
    });

    // Set active
    if (buttons[activeTheme]) {
        buttons[activeTheme].className = 'theme-btn active';
    }
}

async function initSettingsPage() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadUserProfile();
            await loadSidebarStats(); 
            
            // Load water reminder setting
            loadWaterReminderSetting();
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            window.location.href = 'index.html';
        }
    });
}

// Load and setup water reminder toggle
function loadWaterReminderSetting() {
    const toggle = document.getElementById('waterReminderToggle');
    const advancedSettings = document.getElementById('reminderAdvancedSettings');
    const intervalInput = document.getElementById('reminderInterval');
    const durationInput = document.getElementById('reminderDuration');
    const delayInput = document.getElementById('firstReminderDelay');
    const testBtn = document.getElementById('testReminderBtn');
    const saveBtn = document.getElementById('saveReminderBtn');
    
    if (!toggle) return;
    
    // Track if settings have changed
    let hasUnsavedChanges = false;
    
    // Load saved settings
    const savedEnabled = localStorage.getItem('waterReminderEnabled');
    const isEnabled = savedEnabled === null ? true : savedEnabled === 'true';
    toggle.checked = isEnabled;
    
    // Load custom settings with defaults
    const savedInterval = localStorage.getItem('waterReminderInterval');
    const savedDuration = localStorage.getItem('waterReminderDuration');
    const savedDelay = localStorage.getItem('waterReminderDelay');
    
    if (intervalInput) intervalInput.value = savedInterval || '30';
    if (durationInput) durationInput.value = savedDuration || '7';
    if (delayInput) delayInput.value = savedDelay || '2';
    
    // Show/hide advanced settings based on toggle state
    if (advancedSettings) {
        advancedSettings.style.display = isEnabled ? 'block' : 'none';
    }
    
    // Update save button state
    function updateSaveButtonState() {
        if (saveBtn) {
            if (hasUnsavedChanges) {
                saveBtn.style.background = '#e67e22';
                saveBtn.innerHTML = '<i class="fa-solid fa-exclamation-circle"></i> Save Changes';
            } else {
                saveBtn.style.background = '#27ae60';
                saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
            }
        }
    }
    
    // Toggle change handler
    toggle.addEventListener('change', function() {
        const newState = this.checked;
        localStorage.setItem('waterReminderEnabled', newState.toString());
        
        // Show/hide advanced settings
        if (advancedSettings) {
            advancedSettings.style.display = newState ? 'block' : 'none';
        }
        
        showStatusMessage(
            newState ? "💧 Water reminders enabled!" : "🌵 Water reminders disabled", 
            newState
        );
        
        if (newState) {
            // Apply current settings and reinitialize
            applyReminderSettings();
        } else {
            // Cleanup
            const toast = document.getElementById('cactus-toast');
            if (toast && toast.classList.contains('show')) {
                toast.classList.remove('show');
            }
            if (typeof window.cleanupWaterService === 'function') {
                window.cleanupWaterService();
            }
        }
    });
    
    // Input change handlers - mark as unsaved
    if (intervalInput) {
        intervalInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 5) value = 5;
            if (value > 120) value = 120;
            this.value = value;
            hasUnsavedChanges = true;
            updateSaveButtonState();
        });
    }
    
    if (durationInput) {
        durationInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 3) value = 3;
            if (value > 15) value = 15;
            this.value = value;
            hasUnsavedChanges = true;
            updateSaveButtonState();
        });
    }
    
    if (delayInput) {
        delayInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 1) value = 1;
            if (value > 10) value = 10;
            this.value = value;
            hasUnsavedChanges = true;
            updateSaveButtonState();
        });
    }
    
    // Save button handler
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // Save all settings
            const interval = intervalInput ? intervalInput.value : '30';
            const duration = durationInput ? durationInput.value : '7';
            const delay = delayInput ? delayInput.value : '2';
            
            localStorage.setItem('waterReminderInterval', interval);
            localStorage.setItem('waterReminderDuration', duration);
            localStorage.setItem('waterReminderDelay', delay);
            
            // Apply settings
            applyReminderSettings();
            
            // Reset unsaved changes flag
            hasUnsavedChanges = false;
            updateSaveButtonState();
            
            showStatusMessage('✅ Settings saved and applied!', true);
        });
    }
    
    // Test button handler
    if (testBtn) {
        testBtn.addEventListener('click', function() {
            if (typeof window.showWaterReminder === 'function') {
                window.showWaterReminder();
                showStatusMessage('🧪 Test reminder triggered!', true);
            } else {
                showStatusMessage('⚠️ Water reminder service not loaded', false);
            }
        });
    }
}

// Apply reminder settings - this will trigger reinitialize
function applyReminderSettings() {
    const interval = localStorage.getItem('waterReminderInterval') || '30';
    const duration = localStorage.getItem('waterReminderDuration') || '7';
    const delay = localStorage.getItem('waterReminderDelay') || '2';
    
    // Trigger a custom event that water-reminder.js can listen to
    window.dispatchEvent(new CustomEvent('waterReminderSettingsChanged', {
        detail: {
            interval: parseInt(interval),
            duration: parseInt(duration) * 1000,
            delay: parseInt(delay) * 1000
        }
    }));
    
    // If water service is running, reinitialize it
    if (typeof window.initWaterService === 'function') {
        const isEnabled = localStorage.getItem('waterReminderEnabled');
        if (isEnabled === 'true') {
            window.initWaterService();
        }
    }
}

// Show status message
function showStatusMessage(message, isSuccess = true) {
    // Remove existing status message if any
    const existingMessage = document.getElementById('settingsStatusMessage');
    if (existingMessage) existingMessage.remove();
    
    // Create new message element
    const statusDiv = document.createElement('div');
    statusDiv.id = 'settingsStatusMessage';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${isSuccess ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    document.body.appendChild(statusDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (statusDiv.parentNode) statusDiv.remove();
            }, 300);
        }
    }, 3000);
}

// Add CSS for animations (if not already added)
if (!document.getElementById('settings-animations')) {
    const style = document.createElement('style');
    style.id = 'settings-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// --- PROFILE LOADING LOGIC ---
async function loadUserProfile() {
    try {
        const result = await getUserData(currentUser.uid);
        
        if (result.success && result.data) {
            const data = result.data;

            const userImg = data.profileImage || 'images/user.png';
            const profileImgEl = document.getElementById('profileImage');
            if (profileImgEl) profileImgEl.src = userImg;

            const navAvatar = document.getElementById('navAvatar');
            if (navAvatar) navAvatar.src = userImg;

            setText('userName', data.fullName || 'User');
            setText('userEducation', data.educationLevel || 'Student');
            setText('userEmail', data.email || currentUser.email);
            
            setVal('firstName', data.firstName || '');
            setVal('lastName', data.lastName || '');
            setVal('email', data.email || currentUser.email);
            setVal('educationLevel', data.educationLevel || 'Undergraduate');
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function loadSidebarStats() {
    try {
        const savedRes = await getSavedUniversities(currentUser.uid);
        if (savedRes.success) setText('savedCount', savedRes.data.length);
    } catch (e) {}

    try {
        const compRes = await getUserComparisons(currentUser.uid);
        if (compRes.success) setText('comparisonsCount', compRes.data.length);
    } catch (e) {}
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}