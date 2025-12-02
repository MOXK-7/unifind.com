// compare.js
import { 
    auth, 
    onAuthStateChanged, 
    getSavedUniversities
} from './auth-service.js';

let currentUser = null;
let savedUniversities = [];
let selectedUniversities = new Set(); 

async function initCompare() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadSavedUniversities();
        } else {
            window.location.href = 'login.html';
        }
    });
}

async function loadSavedUniversities() {
    const result = await getSavedUniversities(currentUser.uid);
    if (result.success) {
        savedUniversities = result.data;
        if (selectedUniversities.size === 0) {
            savedUniversities.slice(0, 3).forEach(uni => selectedUniversities.add(uni.id));
        }
        renderCompareGrid();
    }
}

function getCareerSuggestions(uni) {
    const text = (uni.name + ' ' + uni.description + ' ' + uni.type).toLowerCase();
    let careers = [];

    if (text.includes('german') || text.includes('technology') || text.includes('engineering') || text.includes('guc')) {
        careers.push('Software Engineer', 'Civil Engineer', 'Robotics Specialist', 'Project Manager');
    }
    if (text.includes('business') || text.includes('finance') || text.includes('management') || text.includes('economics') || text.includes('auc') || text.includes('bue')) {
        careers.push('Financial Analyst', 'Marketing Manager', 'Entrepreneur', 'HR Consultant');
    }
    if (text.includes('medical') || text.includes('pharm') || text.includes('dental') || text.includes('science') || text.includes('misr')) {
        careers.push('Clinical Researcher', 'Pharmacist', 'Lab Specialist', 'Hospital Admin');
    }
    if (text.includes('arts') || text.includes('media') || text.includes('design') || text.includes('mass comm')) {
        careers.push('Graphic Designer', 'Content Creator', 'Art Director', 'Public Relations');
    }
    if (text.includes('cairo') || text.includes('ain shams') || text.includes('public')) {
        careers.push('Civil Servant', 'Academic Researcher', 'Public Sector Specialist');
    }

    if (careers.length === 0) {
        careers.push('Business Analyst', 'Researcher', 'Operations Manager');
    }
    return [...new Set(careers)].slice(0, 4).join(', ');
}

function inferSystem(uni) {
    if (uni.system && uni.system.length > 3) return uni.system;
    const text = (uni.name + ' ' + (uni.description || '')).toLowerCase();
    
    if (text.includes('american') || text.includes('auc')) return 'American Credit Hour';
    if (text.includes('british') || text.includes('bue')) return 'British Credit Hour';
    if (text.includes('german') || text.includes('guc') || text.includes('giu')) return 'German Credit Hour';
    if (text.includes('canadian')) return 'Canadian Credit Hour';
    if (text.includes('japan')) return 'Japanese Credit Hour';
    if (uni.type === 'Private' || uni.type === 'International') return 'Credit Hour System';
    if (uni.type === 'Public' || uni.type === 'National') return 'Two Semesters / Credit Hour';
    return 'Credit Hour System';
}

function formatCurrency(amount) {
    if (!amount) return 'Contact Uni';
    return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0
    }).format(amount);
}

function renderCompareGrid() {
    const grid = document.getElementById('compareGrid');
    const emptyState = document.getElementById('emptyState');
    const selectedUnisArray = savedUniversities.filter(u => selectedUniversities.has(u.id));

    if (savedUniversities.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    let columns = '220px ' + '1fr '.repeat(selectedUnisArray.length);
    if (selectedUnisArray.length < 3) columns += ' 220px'; 
    grid.style.gridTemplateColumns = columns;

    // --- 1. HEADER ROW ---
    let html = `
        <div class="compare-header-cell">
            <h3 style="color: #000; font-size: 1.1rem; margin-bottom: 10px;">Comparison</h3>
            <div class="uni-selector">
                ${renderUniversitySelector()}
            </div>
        </div>
    `;

    selectedUnisArray.forEach(uni => {
        let webLogo = null;
        if (uni.website) {
            try {
                let urlStr = uni.website.startsWith('http') ? uni.website : 'https://' + uni.website;
                const hostname = new URL(urlStr).hostname;
                webLogo = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
            } catch (e) { }
        }
        const placeholder = 'https://via.placeholder.com/80?text=UNI';
        let primarySrc = uni.logo && uni.logo.trim() !== '' ? uni.logo : (webLogo || placeholder);
        const fallbackLogic = `if(this.src !== '${webLogo}' && '${webLogo}' !== 'null'){ this.src = '${webLogo}'; } else { this.src = '${placeholder}'; }`;

        html += `
            <div class="compare-card">
                <button onclick="window.deselectUni('${uni.id}')" 
                        style="position: absolute; top: 10px; left: 10px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: transform 0.2s;" 
                        title="Remove from comparison"
                        onmouseover="this.style.transform='scale(1.1)'" 
                        onmouseout="this.style.transform='scale(1)'">
                    <i class="fa-solid fa-times" style="font-size: 0.9rem;"></i>
                </button>

                <img src="${primarySrc}" class="compare-logo" alt="${uni.name}" onerror="${fallbackLogic}">
                     
                <h3 style="color: #000; font-weight: 800;">${uni.name}</h3>
                <span class="location" style="color: #444; font-weight: 500;"><i class="fa-solid fa-map-marker-alt"></i> ${uni.location}</span>
                <br>
                <a href="${uni.website}" target="_blank" class="visit-link">Visit Website</a>
            </div>
        `;
    });

    if (selectedUnisArray.length < 3) {
        html += `
            <div class="compare-card add-slot" onclick="document.querySelector('.uni-selector').classList.add('highlight')" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; border: 2px dashed #bbb; background: #fafafa;">
                <i class="fa-solid fa-plus-circle fa-2x" style="color:#666; margin-bottom:10px;"></i>
                <p style="color: #333; font-weight: 600;">Add University</p>
            </div>
        `;
    }

    // --- 2. DATA ROWS ---
    const rows = [
        { label: 'Uni Type', key: 'type', icon: 'fa-building' },
        { label: 'Avg Tuition', key: 'tuition', icon: 'fa-money-bill-wave', format: formatCurrency },
        { label: 'Language', key: 'language', icon: 'fa-language' },
        { label: 'System', key: 'system', icon: 'fa-book', isComputed: true },
        { label: 'Career Prospects', key: 'careers', icon: 'fa-briefcase', isComputed: true, style: 'color: #1a73e8; font-weight: 700;' },
        { label: 'Description', key: 'description', icon: 'fa-info-circle', style: 'font-size:0.9rem; line-height: 1.5; color: #202124;' }
    ];

    rows.forEach(row => {
        html += `<div class="data-label"><i class="fa-solid ${row.icon}" style="color:#555;"></i> ${row.label}</div>`;
        selectedUnisArray.forEach(uni => {
            let val;
            if (row.key === 'careers') val = getCareerSuggestions(uni);
            else if (row.key === 'system') val = inferSystem(uni);
            else val = uni[row.key] || '-';

            if (row.format) val = row.format(val);
            const style = row.style ? `style="${row.style}"` : 'style="color: #202124;"';
            
            if (row.key === 'type') {
                const isPublic = (val || '').toLowerCase().includes('public');
                const color = isPublic ? '#0d5e2a' : '#0b57d0'; 
                const bg = isPublic ? '#dcedc8' : '#d2e3fc';
                val = `<span style="font-weight:700; color:${color}; background:${bg}; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem;">${val}</span>`;
            }

            html += `<div class="data-value" ${style}>${val}</div>`;
        });
        if (selectedUnisArray.length < 3) html += `<div class="data-value empty"></div>`;
    });

    grid.innerHTML = html;
}

function renderUniversitySelector() {
    let listHtml = `<p style="margin-bottom:10px; font-size:0.85rem; color:#202124; font-weight:800; text-transform:uppercase;">Saved Universities</p>`;
    if (savedUniversities.length === 0) return `<p style="font-size:0.9rem; color:#555;">No saved universities.</p>`;

    savedUniversities.forEach(uni => {
        const isChecked = selectedUniversities.has(uni.id) ? 'checked' : '';
        const isDisabled = (!selectedUniversities.has(uni.id) && selectedUniversities.size >= 3) ? 'disabled' : '';
        
        listHtml += `
            <label class="selector-option ${isDisabled ? 'disabled' : ''}" style="display:flex; align-items:center; gap:8px; padding:8px 0; cursor:${isDisabled ? 'not-allowed' : 'pointer'}; opacity: ${isDisabled ? '0.6' : '1'};">
                <input type="checkbox" onchange="window.toggleUniSelection('${uni.id}')" ${isChecked} ${isDisabled} style="accent-color: var(--primary-blue); transform: scale(1.1);">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; font-size: 0.95rem; color: #202124; font-weight: 500;">${uni.name}</span>
            </label>
        `;
    });
    return listHtml;
}

window.toggleUniSelection = (id) => {
    if (selectedUniversities.has(id)) { selectedUniversities.delete(id); } 
    else { if (selectedUniversities.size >= 3) return; selectedUniversities.add(id); }
    renderCompareGrid();
}
window.deselectUni = (id) => { selectedUniversities.delete(id); renderCompareGrid(); }
document.addEventListener('DOMContentLoaded', initCompare);