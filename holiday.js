// holiday.js - Dendrite Edition

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inject Styles
    injectHolidayStyles();

    // 2. Check State
    const savedState = localStorage.getItem('holiday-skin');
    const today = new Date();
    const isDecember = today.getMonth() === 11; 

    const shouldBeOn = savedState === 'enabled' || (isDecember && savedState !== 'disabled');

    if (shouldBeOn) { 
        enableHolidayMode();
    }

    // 3. Create Floating Toggle Button
    const btn = document.createElement('button');
    btn.id = 'holiday-toggle-btn';
    
    // --- BUTTON STYLES ---
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#d42426', 
        color: 'white',
        fontSize: '28px',
        cursor: 'pointer',
        zIndex: '10000',
        boxShadow: '0 4px 15px rgba(212, 36, 38, 0.4)',
        transition: 'all 0.3s ease'
    });
    
    btn.onmouseenter = () => btn.style.transform = "scale(1.1) rotate(10deg)";
    btn.onmouseleave = () => btn.style.transform = "scale(1) rotate(0deg)";

    btn.onclick = toggleHolidayMode;
    document.body.appendChild(btn);
    
    updateButtonUI(shouldBeOn);
});

let snowInterval;

function toggleHolidayMode() {
    const body = document.body;
    if (body.classList.contains('holiday-mode')) {
        disableHolidayMode();
    } else {
        enableHolidayMode();
    }
}

function enableHolidayMode() {
    document.body.classList.add('holiday-mode');
    localStorage.setItem('holiday-skin', 'enabled');
    
    startSnow();      
    addDecorations(); 
    
    updateButtonUI(true); 
}

function disableHolidayMode() {
    document.body.classList.remove('holiday-mode');
    localStorage.setItem('holiday-skin', 'disabled');
    
    stopSnow();
    removeDecorations(); 
    
    updateButtonUI(false); 
}

function updateButtonUI(isActive) {
    const btn = document.getElementById('holiday-toggle-btn');
    if (!btn) return;

    if (isActive) {
        btn.innerHTML = '✕'; 
        btn.title = "Turn Off Holiday Mode";
        btn.style.backgroundColor = "#165b33"; 
        btn.style.boxShadow = '0 4px 15px rgba(22, 91, 51, 0.4)';
    } else {
        btn.innerHTML = '🎁';
        btn.title = "Turn On Holiday Mode";
        btn.style.backgroundColor = "#d42426"; 
        btn.style.boxShadow = '0 4px 15px rgba(212, 36, 38, 0.4)';
    }
}

// --- DENDRITE SNOWFLAKES (Crisp & Detailed) ---
function startSnow() {
    if (snowInterval) return;
    
    const container = document.createElement('div');
    container.id = 'snow-container';
    document.body.appendChild(container);

    snowInterval = setInterval(() => {
        const flake = document.createElement('div');
        flake.classList.add('snowflake');
        
        // 1. Pick a Dendrite Shape
        const shapes = ['❅', '❆']; 
        flake.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];
        
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.opacity = Math.random() * 0.6 + 0.4; // Higher opacity for crispness
        
        // 2. Randomize Size (Small Range: 10px - 16px)
        const size = Math.random() * 6 + 10 + 'px';
        flake.style.fontSize = size;
        
        // 3. Fall Speed
        flake.style.animationDuration = Math.random() * 5 + 5 + 's'; 
        
        container.appendChild(flake);

        setTimeout(() => { flake.remove(); }, 10000); 
    }, 250); // Slightly slower creation rate for cleaner look
}

function stopSnow() {
    clearInterval(snowInterval);
    snowInterval = null;
    const container = document.getElementById('snow-container');
    if (container) container.remove();
}

// --- MODERN GRADIENT DECORATION ---
function addDecorations() {
    if (document.getElementById('xmas-modern-border')) return;

    const border = document.createElement('div');
    border.id = 'xmas-modern-border';
    document.body.appendChild(border);
}

function removeDecorations() {
    const border = document.getElementById('xmas-modern-border');
    if (border) border.remove();
}

// --- INJECT CSS ---
function injectHolidayStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 1. Snowflake Animation */
        .snowflake {
            position: fixed; top: -20px; color: white; 
            pointer-events: none; z-index: 9998;
            text-shadow: 0 0 3px rgba(255,255,255,0.4);
            animation: snowfall linear infinite, spinAndSway ease-in-out infinite;
        }
        
        /* 2. Fall Down */
        @keyframes snowfall { to { top: 110vh; } }

        /* 3. Sway + Gentle Spin for Dendrites */
        @keyframes spinAndSway {
            0% { transform: translateX(0) rotate(0deg); }
            50% { transform: translateX(20px) rotate(180deg); }
            100% { transform: translateX(0) rotate(360deg); }
        }

        /* 4. Modern Neon Gradient Border */
        #xmas-modern-border {
            position: fixed; top: 0; left: 0; width: 100%; height: 4px;
            z-index: 9999; pointer-events: none;
            background: linear-gradient(90deg, #d42426, #ffbf00, #165b33, #d42426);
            background-size: 300% 100%;
            animation: modern-gradient 4s linear infinite;
            box-shadow: 0 0 10px rgba(212, 36, 38, 0.5);
        }
        
        @keyframes modern-gradient {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }

        /* 5. Ambient Vignette */
        body.holiday-mode::before {
            content: "";
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            z-index: 9997; pointer-events: none;
            box-shadow: inset 0 0 80px rgba(212, 36, 38, 0.08);
        }
    `;
    document.head.appendChild(style);
}