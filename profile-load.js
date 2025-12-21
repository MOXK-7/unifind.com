import { auth, onAuthStateChanged, getUserData } from './auth-service.js';
import { updateGreetingDisplay } from './greetings.js';

async function initProfileNav() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;

    // Global listener to close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        const dropdown = navAuth.querySelector('.dropdown-content');
        if (dropdown && dropdown.classList.contains('show')) {
            if (!navAuth.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // --- User is Logged In ---
            let photoURL = user.photoURL || 'images/user.png';
            let displayName = user.displayName || 'Profile';

            // 1. Render Navbar Items
            renderNav(navAuth, photoURL, displayName, true);

            // 2. Trigger Greeting Logic (Decides to Show or Hide based on Settings)
            updateGreetingDisplay(user);

            // 3. Database Sync (Optional)
            try {
                const result = await getUserData(user.uid);
                if (result.success && result.data && result.data.profileImage) {
                    if (result.data.profileImage !== photoURL) {
                        const imgTag = navAuth.querySelector('img.profile-img-tag');
                        if (imgTag) imgTag.src = result.data.profileImage;
                    }
                }
            } catch (error) {
                console.warn("Minor error syncing profile nav:", error);
            }

        } else {
            // --- User is Logged Out ---
            renderNav(navAuth, null, null, false);
        }
    });
}

function renderNav(container, imageSrc, name, isLoggedIn) {
    if (isLoggedIn) {
        // STYLE EXPLANATION:
        // position: relative -> on the parent allows us to position children absolutely relative to IT.
        // #dynamicText styles:
        //   position: absolute -> Removes it from layout flow (stops pages from moving).
        //   right: 100% -> Pushes it completely to the left of the avatar.
        //   margin-right: 15px -> Adds a gap between text and avatar.
        //   white-space: nowrap -> Ensures the name doesn't break into two lines.
        
        container.innerHTML = `
            <div style="position: relative; display: flex; align-items: center;">
                <span id="dynamicText" style="
                    position: absolute; 
                    right: 100%; 
                    top: 50%; 
                    transform: translateY(-50%); 
                    margin-right: 15px; 
                    white-space: nowrap; 
                    font-weight: 600; 
                    font-size: 1rem; 
                    display: none; 
                    color: var(--text-dark);
                    pointer-events: none;
                "></span>
                
                <div class="profile-dropdown">
                    <div class="user-avatar" style="cursor: pointer;">
                        <img src="${imageSrc}" alt="${name}" class="profile-img-tag">
                    </div>
                    <div class="dropdown-content">
                        <a href="profile.html">My Profile</a>
                        <hr>
                        <a href="dashboard.html">Dashboard</a>
                        <hr>
                        <a href="#" id="logoutBtn" style="color: #d93025;">Logout</a>
                    </div>
                </div>
            </div>
        `;

        // Text Color Fix: Dashboard navbar is usually dark/blue, so text should be white there.
        if(window.location.pathname.includes('dashboard.html')) {
            const dt = container.querySelector('#dynamicText');
            if(dt) dt.style.color = '#ffffff';
        }

        // 1. Add CLICK Toggle Logic
        const avatarBtn = container.querySelector('.user-avatar');
        const dropdown = container.querySelector('.dropdown-content');

        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            dropdown.classList.toggle('show');
        });

        // 2. Add Logout Logic
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await auth.signOut();
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error("Logout failed", error);
                }
            });
        }

    } else {
        container.innerHTML = `
            <a href="login.html" class="btn-primary">Login</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initProfileNav);