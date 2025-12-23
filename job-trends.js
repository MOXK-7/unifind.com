// job-trends.js

/* --- 1. ENRICHED DATASET (Now with Skills & Education) --- */
const jobTrendsData = [
    {
        id: 1,
        title: "AI Engineer",
        industry: "tech",
        icon: "fa-brain",
        growth: "+42%",
        salary: "$120k - $180k",
        activeListings: 14502,
        description: "Designing neural networks and LLMs. The most sought-after role of the decade.",
        education: "Master's Req.",
        competition: "High",
        skills: ["Python", "PyTorch", "TensorFlow", "NLP"]
    },
    {
        id: 2,
        title: "Cybersecurity Analyst",
        industry: "tech",
        icon: "fa-shield-halved",
        growth: "+32%",
        salary: "$95k - $145k",
        activeListings: 8200,
        description: "Protecting corporate data infrastructure from increasingly sophisticated cyber threats.",
        education: "Bachelor's",
        competition: "Medium",
        skills: ["Network Security", "Ethical Hacking", "SIEM"]
    },
    {
        id: 3,
        title: "Sustainable Energy Tech",
        industry: "engineering",
        icon: "fa-solar-panel",
        growth: "+55%",
        salary: "$60k - $90k",
        activeListings: 5300,
        description: "Installation and maintenance of green energy systems (Solar/Wind) across regions.",
        education: "Associate/Trade",
        competition: "Low",
        skills: ["Electrical Systems", "Installation", "Safety Ops"]
    },
    {
        id: 4,
        title: "Telehealth Nurse",
        industry: "health",
        icon: "fa-user-nurse",
        growth: "+28%",
        salary: "$75k - $110k",
        activeListings: 12100,
        description: "Providing remote patient care, triage, and monitoring via digital platforms.",
        education: "Bachelor's (BSN)",
        competition: "Medium",
        skills: ["Patient Care", "Digital Health Tools", "Communication"]
    },
    {
        id: 5,
        title: "Fintech Product Owner",
        industry: "finance",
        icon: "fa-coins",
        growth: "+22%",
        salary: "$110k - $160k",
        activeListings: 3400,
        description: "Leading the development of next-gen banking, crypto, and payment applications.",
        education: "Bachelor's",
        competition: "High",
        skills: ["Agile", "Product Mgmt", "Blockchain Basics"]
    },
    {
        id: 6,
        title: "Data Scientist",
        industry: "tech",
        icon: "fa-database",
        growth: "+35%",
        salary: "$100k - $150k",
        activeListings: 9800,
        description: "Turning raw big data into actionable business insights using statistical models.",
        education: "Master's Pref.",
        competition: "High",
        skills: ["SQL", "R/Python", "Statistics", "Tableau"]
    },
    {
        id: 7,
        title: "Robotics Engineer",
        industry: "engineering",
        icon: "fa-robot",
        growth: "+19%",
        salary: "$90k - $130k",
        activeListings: 2100,
        description: "Designing autonomous machines for manufacturing and logistics automation.",
        education: "Bachelor's/Master's",
        competition: "Medium",
        skills: ["C++", "ROS", "Mechanics", "Automation"]
    }
];

// DOM Elements
const trendsGrid = document.getElementById('trendsGrid');
const tabs = document.querySelectorAll('.cat-tab');

/* --- 2. RENDER FUNCTIONS (Using Classes, No Inline Styles) --- */
function renderTrends(category = 'all') {
    trendsGrid.innerHTML = '';
    
    const filtered = category === 'all' 
        ? jobTrendsData 
        : jobTrendsData.filter(item => item.industry === category);

    filtered.forEach(job => {
        const card = document.createElement('div');
        card.className = 'trend-card';
        
        // Generate Skills HTML
        const skillsHtml = job.skills.map(skill => `<span class="skill-chip">${skill}</span>`).join('');
        
        // Clean template that relies on CSS classes for dark mode
        card.innerHTML = `
            <div class="trend-header">
                <div class="trend-icon">
                    <i class="fa-solid ${job.icon}"></i>
                </div>
                <div class="growth-badge">
                    <i class="fa-solid fa-arrow-trend-up"></i> ${job.growth}
                </div>
            </div>
            
            <h3 class="trend-title">${job.title}</h3>
            <div class="salary-badge">${job.salary}</div>
            
            <p class="trend-desc">${job.description}</p>
            
            <div class="skills-container">
                ${skillsHtml}
            </div>

            <div class="insights-row">
                <div class="insight-item" title="Education Required">
                    <i class="fa-solid fa-graduation-cap"></i> ${job.education}
                </div>
                <div class="insight-item" title="Competition Level">
                    <i class="fa-solid fa-users-line"></i> ${job.competition} Comp.
                </div>
            </div>
            
            <div class="live-indicator">
                <div class="live-dot-wrap">
                    <div class="live-dot active"></div>
                    <span>Live</span>
                </div>
                <div><strong id="listing-count-${job.id}">${job.activeListings.toLocaleString()}</strong> listings</div>
            </div>
        `;
        trendsGrid.appendChild(card);
    });
}

/* --- 3. LIVE SIMULATOR --- */
function startLiveUpdates() {
    setInterval(() => {
        jobTrendsData.forEach(job => {
            const change = Math.floor(Math.random() * 10) - 4; // Range: -4 to +5
            job.activeListings += change;
            
            const counterEl = document.getElementById(`listing-count-${job.id}`);
            if (counterEl) {
                counterEl.textContent = job.activeListings.toLocaleString();
                counterEl.style.color = change > 0 ? '#137333' : '#d93025';
                setTimeout(() => {
                    counterEl.style.color = ''; 
                }, 500);
            }
        });
    }, 3000); 
}

/* --- 4. CHART.JS CONFIGURATION --- */
function initCharts() {
    // 1. Bar Chart: Industry Growth
    const ctx1 = document.getElementById('industryChart').getContext('2d');
    new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['AI & Tech', 'Green Energy', 'Healthcare', 'Fintech', 'Creative'],
            datasets: [{
                label: 'Projected Growth (%)',
                data: [42, 55, 28, 22, 15],
                backgroundColor: ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9c27b0'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // 2. Doughnut Chart: Work Mode
    const ctx2 = document.getElementById('remoteChart').getContext('2d');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Remote', 'Hybrid', 'On-Site'],
            datasets: [{
                data: [35, 45, 20],
                backgroundColor: ['#1a73e8', '#fbbc04', '#dadce0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

/* --- 5. INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    renderTrends('all');
    initCharts();
    startLiveUpdates(); 
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTrends(tab.dataset.cat);
        });
    });
});