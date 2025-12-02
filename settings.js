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
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            window.location.href = 'index.html';
        }
    });
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