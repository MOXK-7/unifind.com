// profile.js
import { 
    auth, 
    onAuthStateChanged, 
    getUserData, 
    getSavedUniversities,
    removeSavedUniversity,
    getUserComparisons,
    logout
} from './auth-service.js';

let currentUser = null;
let userData = null;
let savedUniversities = [];
let userComparisons = [];

// Initialize profile page
async function initProfile() {
    // Check auth state
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadUserData();
            await loadSavedUniversities();
            await loadUserComparisons();
            setupEventListeners();
            initializeTabs();
        } else {
            window.location.href = 'login.html';
        }
    });
}

// Load user data
async function loadUserData() {
    const result = await getUserData(currentUser.uid);
    if (result.success) {
        userData = result.data;
        updateProfileDisplay();
    } else {
        showMessage('Error loading profile data: ' + result.error, 'error');
    }
}

// Update profile display
function updateProfileDisplay() {
    // Update sidebar
    document.getElementById('profileImage').src = userData.profileImage || 'images/user.png';
    document.getElementById('userName').textContent = userData.fullName;
    document.getElementById('userEducation').textContent = userData.educationLevel;
    document.getElementById('userEmail').textContent = userData.email;
    
    // Update counts
    document.getElementById('savedCount').textContent = savedUniversities.length;
    document.getElementById('comparisonsCount').textContent = userComparisons.length;
    
    // Update avatar in navbar
    const navAvatar = document.getElementById('navAvatar');
    if (navAvatar) {
        navAvatar.src = userData.profileImage || 'images/user.png';
    }
}

// Load saved universities
async function loadSavedUniversities() {
    const result = await getSavedUniversities(currentUser.uid);
    const savedList = document.getElementById('savedUniversitiesList');
    
    if (result.success) {
        savedUniversities = result.data;
        
        if (savedUniversities.length > 0) {
            savedList.innerHTML = savedUniversities.map(uni => `
                <div class="saved-item" data-id="${uni.id}">
                    <div class="saved-info">
                        <img src="${uni.logo}" alt="${uni.name}" onerror="this.src='https://via.placeholder.com/50?text=UNI'">
                        <div>
                            <h4>${uni.name}</h4>
                            <span style="color:var(--text-grey); font-size:0.9rem;">
                                <i class="fa-solid fa-map-marker-alt"></i> ${uni.location}, Egypt
                            </span>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                <span class="tag" style="background:${uni.type === 'Public' ? '#e6f4ea' : '#e8f0fe'}; color:${uni.type === 'Public' ? '#137333' : 'var(--primary-blue)'}; font-size:0.8rem;">
                                    ${uni.type}
                                </span>
                                <span class="tag secondary" style="font-size:0.8rem;">
                                    ${uni.language}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; align-items: center;">
                        <span style="color: var(--text-grey); font-size: 0.9rem;">
                            ${formatCurrency(uni.tuition)}/year
                        </span>
                        <button class="btn-primary view-details" data-id="${uni.id}">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        <button class="btn-danger-light remove-saved" data-id="${uni.id}" title="Remove from saved">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            savedList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-bookmark"></i>
                    <h3>No saved universities</h3>
                    <p>Start saving universities from the search page to see them here</p>
                    <button class="btn-primary" onclick="window.location.href='dashboard.html'" style="margin-top: 1rem;">
                        <i class="fa-solid fa-search"></i> Browse Universities
                    </button>
                </div>
            `;
        }
    } else {
        savedList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <h3>Error loading saved universities</h3>
                <p>${result.error}</p>
            </div>
        `;
    }
}

// Load user comparisons
async function loadUserComparisons() {
    const result = await getUserComparisons(currentUser.uid);
    const comparisonsList = document.getElementById('comparisonsList');
    
    if (result.success) {
        userComparisons = result.data;
        
        if (userComparisons.length > 0) {
            comparisonsList.innerHTML = userComparisons.map(comp => `
                <div class="comparison-card">
                    <div class="comparison-header">
                        <h3>${comp.name}</h3>
                        <span class="comparison-date">${new Date(comp.createdAt?.toDate()).toLocaleDateString()}</span>
                    </div>
                    <div class="comparison-universities">
                        ${comp.universities?.map(uni => `
                            <div class="comparison-uni">
                                <img src="${uni.logo}" alt="${uni.name}" onerror="this.src='https://via.placeholder.com/30?text=UNI'">
                                <span>${uni.name}</span>
                            </div>
                        `).join('') || 'No universities in this comparison'}
                    </div>
                    <div class="comparison-actions">
                        <button class="btn-primary view-comparison" data-id="${comp.id}">
                            <i class="fa-solid fa-chart-bar"></i> View Comparison
                        </button>
                        <button class="btn-outline delete-comparison" data-id="${comp.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            comparisonsList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-exchange-alt"></i>
                    <h3>No comparisons yet</h3>
                    <p>Create your first comparison to analyze universities side-by-side</p>
                    <button class="btn-primary" onclick="window.location.href='compare.html'" style="margin-top: 1rem;">
                        <i class="fa-solid fa-plus"></i> Create Comparison
                    </button>
                </div>
            `;
        }
    }
}

// Initialize tabs
function initializeTabs() {
    const tabItems = document.querySelectorAll('.profile-menu li[data-tab]');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabItems.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected tab content
            const tabName = tab.dataset.tab;
            const targetTab = document.getElementById(tabName + 'Tab');
            if(targetTab) targetTab.style.display = 'block';
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Remove saved university
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.remove-saved')) {
            const button = e.target.closest('.remove-saved');
            const universityId = button.dataset.id;
            await removeSavedUniversity(currentUser.uid, universityId);
            await loadSavedUniversities();
            await loadUserData(); // Update counts
            showMessage('University removed from saved list', 'success');
        }
        
        // View details
        if (e.target.closest('.view-details')) {
            const button = e.target.closest('.view-details');
            const universityId = button.dataset.id;
            viewUniversityDetails(universityId);
        }
        
        // View comparison
        if (e.target.closest('.view-comparison')) {
            const button = e.target.closest('.view-comparison');
            const comparisonId = button.dataset.id;
            viewComparison(comparisonId);
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            window.location.href = 'login.html';
        }
    });
    
    // Sort saved universities
    document.getElementById('sortSaved').addEventListener('change', sortSavedUniversities);
}

// Sort saved universities
function sortSavedUniversities() {
    const sortBy = document.getElementById('sortSaved').value;
    
    switch(sortBy) {
        case 'name':
            savedUniversities.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'location':
            savedUniversities.sort((a, b) => a.location.localeCompare(b.location));
            break;
        case 'date':
            // Assuming we have dates, for now sort by name
            savedUniversities.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    loadSavedUniversities(); // This will re-render with sorted data
}

// View university details
function viewUniversityDetails(universityId) {
    window.location.href = `dashboard.html?highlight=${universityId}`;
}

// View comparison
function viewComparison(comparisonId) {
    window.location.href = `compare.html?comparison=${comparisonId}`;
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0
    }).format(amount);
}

function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfile);






