import { 
    getUniversities, 
    saveUniversity, 
    removeSavedUniversity, 
    getSavedUniversities,
    auth,
    db, 
    onAuthStateChanged
} from './auth-service.js';
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { seedData } from './data-seeder.js';

let allUniversities = [];
let savedUniversityIds = [];
let currentUser = null;
let currentMode = 'local'; // 'local' or 'web'

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

// DOM Elements
const universitiesList = document.getElementById('universitiesList');
const loadingMessage = document.getElementById('loadingMessage');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const searchTabs = document.querySelectorAll('.search-tab');

// Filters
const locationFilter = document.getElementById('locationFilter');
const facultyFilter = document.getElementById('facultyFilter');
const tuitionRange = document.getElementById('tuitionRange');
const maxTuitionValue = document.getElementById('maxTuitionValue');
const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');
const sortSelect = document.getElementById('sortSelect');

// --- Format Currency ---
function formatCurrency(amount) {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0
    }).format(amount);
}

// --- Event Listeners ---

// 1. APPLY FILTERS BUTTON
if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
        filterAndDisplayUniversities();
    });
}

// 2. RESET FILTERS BUTTON
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
        // Reset Search Input
        searchInput.value = '';

        // Reset Sort
        if(sortSelect) sortSelect.value = 'name';

        // Reset Faculty
        if(facultyFilter) facultyFilter.value = '';

        // Reset Locations (Uncheck all)
        document.querySelectorAll('input[name="location"]').forEach(cb => {
            cb.checked = false;
        });

        // Reset Type (Check all - usually default is all included)
        document.querySelectorAll('input[name="type"]').forEach(cb => {
            cb.checked = true; 
        });

        // Reset Tuition Range
        if(tuitionRange) {
            tuitionRange.value = 300000; // Default Max
            if(maxTuitionValue) maxTuitionValue.textContent = formatCurrency(300000);
        }

        // Re-run filter
        filterAndDisplayUniversities();
    });
}

// 3. TUITION SLIDER (Update text while dragging)
if (tuitionRange && maxTuitionValue) {
    tuitionRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        maxTuitionValue.textContent = formatCurrency(val);
    });
}

// Clear Search Button
clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    if (currentMode === 'local') filterAndDisplayUniversities();
});

// Search functionality with Debounce
searchInput.addEventListener('input', debounce(() => {
    if (currentMode === 'local') {
        filterAndDisplayUniversities();
    } else {
        performWebSearch();
    }
}, 800));

// Tab Switching (Local vs Web)
searchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        searchTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;
        
        universitiesList.innerHTML = ''; // Clear current results
        searchInput.value = ''; 
        
        const dashboardGrid = document.querySelector('.dashboard-grid');
        const filtersSidebar = document.querySelector('.filters-sidebar');

        if (currentMode === 'local') {
            if(filtersSidebar) filtersSidebar.style.display = 'block';
            if(dashboardGrid) dashboardGrid.style.gridTemplateColumns = '280px 1fr'; 
            loadUniversities();
        } else {
            if(filtersSidebar) filtersSidebar.style.display = 'none';
            if(dashboardGrid) dashboardGrid.style.gridTemplateColumns = '1fr'; 
            resultsCount.textContent = "Enter a search term to find global universities.";
            noResults.style.display = 'none';
        }
    });
});

document.getElementById('tryWebSearchBtn')?.addEventListener('click', () => {
    document.querySelector('[data-mode="web"]').click();
});

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// --- 1. LOCAL SEARCH LOGIC ---
async function loadUniversities() {
    loadingMessage.style.display = 'block';
    universitiesList.innerHTML = '';
    resultsCount.textContent = 'Loading...';

    // Ensure local data is seeded/loaded
    await seedData();

    const result = await getUniversities();
    if (result.success) {
        allUniversities = result.data;
        filterAndDisplayUniversities();
    } else {
        loadingMessage.innerHTML = `<div style="color: red;">Error: ${result.error}</div>`;
    }
}

function filterAndDisplayUniversities() {
    loadingMessage.style.display = 'none';
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // --- Get Filter Values (Safe Check) ---
    const maxPrice = tuitionRange ? parseInt(tuitionRange.value) : 1000000;
    const sortValue = sortSelect ? sortSelect.value : 'name';
    const selectedFaculty = (facultyFilter && facultyFilter.value) ? facultyFilter.value : "";

    // Checkboxes for Type
    const checkedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked'))
        .map(cb => cb.value.toLowerCase());

    // Checkboxes for Location
    const locationCheckboxes = document.querySelectorAll('input[name="location"]:checked');
    const selectedLocations = Array.from(locationCheckboxes).map(cb => cb.value.toLowerCase());

    // --- Filtering Logic ---
    let filtered = allUniversities.filter(uni => {
        const uName = (uni.name || '').toLowerCase();
        const uLoc = (uni.location || '').toLowerCase();
        const uType = (uni.type || 'general').toLowerCase();
        const uPrice = parseInt(uni.tuition) || 0;
        const uFaculties = uni.faculties || [];

        // 1. Text Search
        const matchesSearch = !searchTerm || uName.includes(searchTerm) || uLoc.includes(searchTerm);

        // 2. Location (Multi-Select)
        // If NO locations are checked, show ALL locations. If some are checked, show only those.
        let matchesLocation = true;
        if (selectedLocations.length > 0) {
            matchesLocation = selectedLocations.some(loc => uLoc.includes(loc));
        }

        // 3. Type
        const matchesType = checkedTypes.length === 0 || checkedTypes.some(typeVal => uType.includes(typeVal));

        // 4. Price
        const matchesPrice = uPrice <= maxPrice;

        // 5. Faculty
        const matchesFaculty = !selectedFaculty || uFaculties.some(f => f.toLowerCase().includes(selectedFaculty.toLowerCase()));

        return matchesSearch && matchesLocation && matchesType && matchesPrice && matchesFaculty;
    });

    // --- Sorting Logic ---
    filtered.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        const priceA = parseInt(a.tuition) || 0;
        const priceB = parseInt(b.tuition) || 0;

        if (sortValue === 'name') return nameA.localeCompare(nameB);
        if (sortValue === 'nameDesc') return nameB.localeCompare(nameA);
        if (sortValue === 'tuition') return priceA - priceB;
        if (sortValue === 'tuitionDesc') return priceB - priceA;
        return 0;
    });

    displayUniversities(filtered);
}

// --- 2. WEB SEARCH LOGIC (FIXED WITH PROXY) ---
async function performWebSearch() {
    const queryStr = searchInput.value.trim();
    if (queryStr.length < 3) {
        resultsCount.textContent = "Please enter at least 3 characters to search the web.";
        universitiesList.innerHTML = '';
        return;
    }

    loadingMessage.style.display = 'block';
    noResults.style.display = 'none';
    universitiesList.innerHTML = '';
    resultsCount.textContent = `Searching global database for "${queryStr}"...`;

    try {
        // PROXY FIX: Use allorigins.win to bypass CORS
        const apiUrl = `http://universities.hipolabs.com/search?name=${encodeURIComponent(queryStr)}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Network Error");
        
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents); // The actual data is inside .contents
        
        loadingMessage.style.display = 'none';
        
        if (!data || data.length === 0) {
            resultsCount.textContent = `No results found for "${queryStr}"`;
            noResults.style.display = 'block';
            return;
        }

        resultsCount.textContent = `Found ${data.length} global results`;
        displayWebResults(data);

    } catch (error) {
        console.error("Web Search Error:", error);
        loadingMessage.style.display = 'none';
        resultsCount.textContent = "Connection Error. Please try again.";
    }
}

function displayWebResults(results) {
    const html = results.map((uni) => {
        const domain = uni.domains[0] || 'example.com';
        // DuckDuckGo Icon Service
        const logoUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
        const website = uni.web_pages[0] || '#';
        const uniDataSafe = encodeURIComponent(JSON.stringify(uni));

        return `
            <div class="uni-card web-result-card" style="border-left: 4px solid #fbbc04; padding: 1.5rem; display: flex; gap: 1rem;">
                <img src="${logoUrl}" class="uni-logo" style="width: 60px; height: 60px; object-fit: contain;" onerror="this.src='https://via.placeholder.com/60?text=WEB'">
                <div class="uni-content" style="flex: 1;">
                    <h2>${uni.name}</h2>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">
                        <i class="fa-solid fa-map-marker-alt"></i> ${uni.country}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <a href="${website}" target="_blank" style="color: var(--primary-blue); text-decoration: underline;">
                            Visit Website
                        </a>
                    </div>
                    <div class="compare-check" onclick="window.saveExternalUniversity(this, '${uniDataSafe}')" style="cursor: pointer; color: #5f6368; font-weight: 500;">
                        <i class="fa-solid fa-plus-circle"></i> Save to UniFind
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    universitiesList.innerHTML = html;
}

// --- 3. SAVE LOGIC (Web -> Firebase) ---
window.saveExternalUniversity = async function(btn, uniDataEncoded) {
    if (!currentUser) {
        alert("Please login to save universities.");
        window.location.href = 'login.html';
        return;
    }

    const uniData = JSON.parse(decodeURIComponent(uniDataEncoded));
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        const q = query(collection(db, "universities"), where("name", "==", uniData.name));
        const querySnapshot = await getDocs(q);

        let finalID;

        if (!querySnapshot.empty) {
            finalID = querySnapshot.docs[0].id;
        } else {
            const newUniData = {
                name: uniData.name,
                location: uniData.country || "Global",
                type: "Public",
                language: "English",
                tuition: 0,
                description: `Imported from web search. Website: ${uniData.web_pages[0]}`,
                logo: `https://icons.duckduckgo.com/ip3/${uniData.domains[0]}.ico`,
                website: uniData.web_pages[0],
                createdAt: new Date()
            };
            
            const docRef = await addDoc(collection(db, "universities"), newUniData);
            finalID = docRef.id;
            allUniversities.push({ id: finalID, ...newUniData });
        }

        await saveUniversity(currentUser.uid, finalID);
        
        btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Saved';
        btn.style.color = 'var(--primary-blue)';
        btn.onclick = null;
        savedUniversityIds.push(finalID);

    } catch (error) {
        console.error("Error saving:", error);
        btn.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> Error';
    }
};

// --- Standard Display ---
function displayUniversities(universities) {
    if (universities.length === 0) {
        universitiesList.innerHTML = '';
        noResults.style.display = 'block';
        resultsCount.textContent = 'No local results found';
        return;
    }

    noResults.style.display = 'none';
    resultsCount.textContent = `Showing ${universities.length} universities`;

    const universitiesHTML = universities.map(uni => `
        <div class="uni-card" data-id="${uni.id}">
            <img src="${uni.logo}" class="uni-logo" alt="${uni.name}" onerror="this.src='https://via.placeholder.com/80?text=UNI'">
            <div class="uni-content">
                <h2>${uni.name}</h2>
                <div class="location"><i class="fa-solid fa-map-marker-alt"></i> ${uni.location}</div>
                <div class="tags">
                    <span class="tag" style="${(uni.type || '').toLowerCase().includes('public') ? 'background:#e6f4ea; color:#137333;' : 'background:#e8f0fe; color:var(--primary-blue);'}">
                        ${uni.type || 'General'}
                    </span>
                    <span class="tag secondary">${formatCurrency(uni.tuition)}/year</span>
                </div>
                <div class="card-actions">
                    <div class="compare-check" onclick="window.toggleSaveUniversity('${uni.id}', this)" style="cursor: pointer;">
                        <i class="fa-solid ${savedUniversityIds.includes(uni.id) ? 'fa-check-circle' : 'fa-plus-circle'}"></i>
                        ${savedUniversityIds.includes(uni.id) ? 'Saved' : 'Save'}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    universitiesList.innerHTML = universitiesHTML;
}

window.toggleSaveUniversity = async function(universityId, button) {
    if (!currentUser) {
        alert('Please login to save universities');
        return;
    }
    const isSaved = savedUniversityIds.includes(universityId);
    
    if (isSaved) {
        const result = await removeSavedUniversity(currentUser.uid, universityId);
        if (result.success) {
            savedUniversityIds = savedUniversityIds.filter(id => id !== universityId);
            button.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Save';
            button.style.color = '#5f6368';
        }
    } else {
        const result = await saveUniversity(currentUser.uid, universityId);
        if (result.success) {
            savedUniversityIds.push(universityId);
            button.innerHTML = '<i class="fa-solid fa-check-circle"></i> Saved';
            button.style.color = 'var(--primary-blue)';
        }
    }
}

async function initDashboard() {
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        // Let profile-load.js handle the nav image
        if (user) {
            const result = await getSavedUniversities(user.uid);
            if (result.success) savedUniversityIds = result.data.map(u => u.id);
        }
        loadUniversities(); 
    });
}

document.addEventListener('DOMContentLoaded', initDashboard);