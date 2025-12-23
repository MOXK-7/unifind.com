/**
 * ☪️ RAMADAN.JS - All Features Working
 * - Shooting Stars: Bright & Visible
 * - Neon Border: Glowing
 * - Cursor: Golden Stardust (RESTORED)
 * - No Audio
 */

document.addEventListener('DOMContentLoaded', () => {
    injectRamadanStyles();

    const savedState = localStorage.getItem('ramadan-skin');
    const shouldBeOn = savedState === 'enabled';

    if (shouldBeOn) enableRamadanMode();
    createToggleButton(shouldBeOn);
});

// --- STATE MANAGEMENT ---
function toggleRamadanMode() {
    const body = document.body;
    if (body.classList.contains('ramadan-mode')) {
        disableRamadanMode();
    } else {
        enableRamadanMode();
    }
}

function enableRamadanMode() {
    document.body.classList.add('ramadan-mode');
    localStorage.setItem('ramadan-skin', 'enabled');
    
    // VISUALS ON
    createNeonBorder(); 
    createGoldenParticles();
    createHangingLantern();
    createMoonBackground();
    startShootingStars(); 
    enableCursorTrail(); // <--- RESTORED
    showGreetingModal();
    
    updateButtonState(true);
}

function disableRamadanMode() {
    document.body.classList.remove('ramadan-mode');
    localStorage.setItem('ramadan-skin', 'disabled');
    
    // VISUALS OFF
    removeNeonBorder();
    removeGoldenParticles();
    removeHangingLantern();
    removeMoonBackground();
    stopShootingStars();
    disableCursorTrail(); // <--- RESTORED
    
    updateButtonState(false);
}

// --- CONTROLS ---
function createToggleButton(isActive) {
    const fab = document.createElement('button');
    fab.id = 'ramadan-fab';
    fab.onclick = toggleRamadanMode;
    document.body.appendChild(fab);
    updateButtonState(isActive);
}

function updateButtonState(isActive) {
    const fab = document.getElementById('ramadan-fab');
    if (!fab) return;

    if (isActive) {
        fab.innerHTML = '✕';
        fab.classList.add('active');
    } else {
        fab.innerHTML = '☪';
        fab.classList.remove('active');
    }
}

// --- 1. CURSOR TRAIL (RESTORED) ---
let cursorHandler;
function enableCursorTrail() {
    if (cursorHandler) return;
    cursorHandler = (e) => {
        // Limit dust creation to every few pixels for performance
        if (Math.random() > 0.5) return; 

        const dust = document.createElement('div');
        dust.className = 'stardust';
        dust.style.left = e.clientX + 'px';
        dust.style.top = e.clientY + 'px';
        
        const size = Math.random() * 4 + 2 + 'px'; // Random size 2-6px
        dust.style.width = size; 
        dust.style.height = size;
        
        document.body.appendChild(dust);
        
        setTimeout(() => dust.remove(), 800); // Remove after animation
    };
    document.addEventListener('mousemove', cursorHandler);
}

function disableCursorTrail() {
    if (cursorHandler) {
        document.removeEventListener('mousemove', cursorHandler);
        cursorHandler = null;
    }
}

// --- 2. SHOOTING STARS ---
let starInterval;
function startShootingStars() {
    if (starInterval) return;

    const container = document.createElement('div');
    container.id = 'ramadan-star-layer';
    document.body.appendChild(container);

    starInterval = setInterval(() => {
        const star = document.createElement('div');
        star.className = 'star-comet';
        
        // Random Position
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * (window.innerHeight / 2); 
        
        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        
        const scale = Math.random() * 0.5 + 0.8;
        star.style.transform = `scale(${scale}) rotate(-45deg)`;
        
        container.appendChild(star);
        setTimeout(() => star.remove(), 1500);

    }, 800);
}

function stopShootingStars() {
    clearInterval(starInterval);
    starInterval = null;
    const el = document.getElementById('ramadan-star-layer');
    if (el) el.remove();
}

// --- 3. OTHER VISUALS ---
function createNeonBorder() {
    if (document.getElementById('ramadan-neon')) return;
    const border = document.createElement('div');
    border.id = 'ramadan-neon';
    document.body.prepend(border);
}
function removeNeonBorder() {
    const el = document.getElementById('ramadan-neon');
    if (el) el.remove();
}

function createMoonBackground() {
    if (document.getElementById('ramadan-moon')) return;
    const bg = document.createElement('div');
    bg.id = 'ramadan-moon';
    bg.innerHTML = `<div class="crescent-moon"></div>`;
    document.body.prepend(bg);
}
function removeMoonBackground() {
    const el = document.getElementById('ramadan-moon');
    if (el) el.remove();
}

function createHangingLantern() {
    if (document.getElementById('ramadan-lantern')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'ramadan-lantern';
    wrapper.innerHTML = `
        <div class="lantern-string"></div>
        <div class="lantern-body">
            <div class="lantern-top"></div>
            <div class="lantern-glass"></div>
            <div class="lantern-bottom"></div>
        </div>
    `;
    document.body.appendChild(wrapper);
}
function removeHangingLantern() {
    const el = document.getElementById('ramadan-lantern');
    if (el) el.remove();
}

let particleInterval;
function createGoldenParticles() {
    if (particleInterval) return;
    const container = document.createElement('div');
    container.id = 'ramadan-particles';
    document.body.appendChild(container);

    particleInterval = setInterval(() => {
        const p = document.createElement('div');
        p.className = 'gold-particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.width = (Math.random() * 3 + 2) + 'px';
        p.style.height = p.style.width;
        p.style.animationDuration = (Math.random() * 10 + 10) + 's';
        container.appendChild(p);
        setTimeout(() => p.remove(), 20000);
    }, 400);
}
function removeGoldenParticles() {
    clearInterval(particleInterval);
    particleInterval = null;
    const el = document.getElementById('ramadan-particles');
    if (el) el.remove();
}

function showGreetingModal() {
    if (sessionStorage.getItem('ramadan-greeted')) return;
    const modal = document.createElement('div');
    modal.id = 'ramadan-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h1 class="fade-in-text">Ramadan Kareem</h1>
            <p style="color:#fff;">May this month bring peace.</p>
            <div style="font-size:3rem; margin:20px 0;">☪️</div>
            <button onclick="document.getElementById('ramadan-modal').remove()">Continue</button>
        </div>
    `;
    document.body.appendChild(modal);
    sessionStorage.setItem('ramadan-greeted', 'true');
    setTimeout(() => { if(modal) modal.remove(); }, 3500);
}

// --- CSS ---
function injectRamadanStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --r-gold: #d4af37; --r-blue: #0f172a; }
        body.ramadan-mode { --primary-color: var(--r-blue) !important; --primary-blue: var(--r-blue) !important; }

        /* BUTTON */
        #ramadan-fab {
            position: fixed; bottom: 100px; right: 20px;
            width: 56px; height: 56px; border-radius: 50%;
            border: none; cursor: pointer; z-index: 10000;
            background: var(--r-gold); color: white;
            font-size: 24px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.5);
            transition: 0.3s;
        }
        #ramadan-fab.active { background: #334155; }

        /* NEON BORDER */
        #ramadan-neon {
            position: fixed; top: 0; left: 0; width: 100%; height: 4px; z-index: 10001;
            background: linear-gradient(90deg, #00d2ff, #ffd700, #9d00ff, #00d2ff);
            background-size: 400% 100%;
            animation: neonFlow 5s linear infinite;
            box-shadow: 0 0 15px rgba(0, 210, 255, 0.8);
        }
        @keyframes neonFlow { 0% {background-position: 0% 50%;} 100% {background-position: 100% 50%;} }

        /* SHOOTING STARS */
        #ramadan-star-layer {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 9999; overflow: hidden;
        }
        .star-comet {
            position: absolute;
            width: 150px; height: 2px;
            background: linear-gradient(90deg, #fff, transparent);
            filter: drop-shadow(0 0 5px #fff);
            opacity: 0;
            animation: cometMove 1.5s ease-out forwards;
        }
        .star-comet::before {
            content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
            width: 4px; height: 4px; background: #fff;
            border-radius: 50%; box-shadow: 0 0 10px #fff, 0 0 20px #ffd700;
        }
        @keyframes cometMove {
            0% { transform: translate(0, 0) rotate(-45deg); opacity: 1; }
            100% { transform: translate(-500px, 500px) rotate(-45deg); opacity: 0; }
        }

        /* STARDUST CURSOR */
        .stardust {
            position: fixed; pointer-events: none; z-index: 10001;
            background: var(--r-gold); border-radius: 50%;
            box-shadow: 0 0 6px var(--r-gold);
            animation: dustFade 0.8s forwards;
        }
        @keyframes dustFade {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0) translateY(20px); }
        }

        /* OTHER ASSETS */
        #ramadan-lantern { position: fixed; top: 0; right: 5%; z-index: 9998; animation: gentleSwing 4s ease-in-out infinite; transform-origin: top center; }
        .lantern-string { width: 2px; height: 100px; background: var(--r-gold); margin: 0 auto; }
        .lantern-top { width: 24px; height: 12px; background: var(--r-gold); margin: 0 auto; border-radius: 4px 4px 0 0; }
        .lantern-glass { width: 40px; height: 50px; background: rgba(255, 215, 0, 0.1); border: 2px solid var(--r-gold); margin: 0 auto; border-radius: 8px; box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); position: relative; }
        .lantern-glass::after { content: ''; position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 8px; height: 16px; background: #fff; border-radius: 50%; box-shadow: 0 0 15px #ff9800; animation: flicker 2s infinite alternate; }
        .lantern-bottom { width: 18px; height: 8px; background: var(--r-gold); margin: 0 auto; border-radius: 0 0 4px 4px; }

        #ramadan-moon { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; background-image: radial-gradient(circle at 10% 20%, rgba(21, 30, 60, 0.95), rgba(15, 23, 42, 1)); }
        .crescent-moon { position: absolute; top: 25%; left: 5%; width: 150px; height: 150px; border-radius: 50%; box-shadow: -20px 0 0 0 var(--r-gold); opacity: 0.15; transform: rotate(-30deg); }
        .gold-particle { position: fixed; bottom: -10px; background: var(--r-gold); border-radius: 50%; pointer-events: none; z-index: 9997; box-shadow: 0 0 4px var(--r-gold); animation: riseUp linear forwards; }
        
        #ramadan-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 11000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .modal-content { background: #1e293b; padding: 40px; border-radius: 20px; text-align: center; border: 2px solid var(--r-gold); box-shadow: 0 0 30px rgba(212, 175, 55, 0.3); }
        .modal-content button { background: var(--r-gold); border: none; padding: 10px 25px; color: #1e293b; font-weight: bold; cursor: pointer; border-radius: 50px; }

        @keyframes riseUp { to { transform: translateY(-110vh); opacity: 0; } }
        @keyframes gentleSwing { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes flicker { 0% { opacity: 0.8; transform: translateX(-50%) scale(1); } 100% { opacity: 1; transform: translateX(-50%) scale(1.1); } }
    `;
    document.head.appendChild(style);
}