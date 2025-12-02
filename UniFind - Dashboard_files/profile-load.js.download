// import { auth, onAuthStateChanged, getUserData } from './auth-service.js';

// /**
//  * profile-load.js
//  * * Drop this file into any HTML page to automatically handle the 
//  * User Profile / Login button in the navigation bar.
//  * * Requirements:
//  * 1. Your HTML must have a container with id="navAuth" inside the navbar.
//  * Example: <div class="nav-right" id="navAuth"></div>
//  * 2. This script must be loaded as a module: 
//  * <script type="module" src="profile-load.js"></script>
//  */

// async function initProfileNav() {
//     // 1. Find the container in the DOM
//     const navAuth = document.getElementById('navAuth');
    
//     // If the element doesn't exist on this page, stop running
//     if (!navAuth) return;

//     // 2. Listen for authentication state changes
//     onAuthStateChanged(auth, async (user) => {
//         if (user) {
//             // --- User is Logged In ---
            
//             // A. Immediate render using Auth Object (Fastest)
//             // Use the photoURL from the Google/Firebase Auth object
//             let photoURL = user.photoURL || 'images/user.png';
//             let displayName = user.displayName || 'Profile';

//             // Render immediately so the user sees something
//             renderNav(navAuth, photoURL, displayName, true);

//             // B. Database Sync (Optional but recommended)
//             // Fetch latest data from Firestore to ensure image is up-to-date
//             // (e.g., if they just changed it in Settings)
//             try {
//                 const result = await getUserData(user.uid);
//                 if (result.success && result.data) {
//                     const dbImage = result.data.profileImage;
//                     // If Firestore has a different image than Auth, update the UI
//                     if (dbImage && dbImage !== photoURL) {
//                         renderNav(navAuth, dbImage, result.data.fullName, true);
//                     }
//                 }
//             } catch (error) {
//                 console.warn("Minor error syncing profile nav:", error);
//             }

//         } else {
//             // --- User is Logged Out ---
//             renderNav(navAuth, null, null, false);
//         }
//     });
// }

// /**
//  * Renders the HTML for the navigation item
//  */
// function renderNav(container, imageSrc, name, isLoggedIn) {
//     if (isLoggedIn) {
//         container.innerHTML = `
//             <div  class="user-avatar" title="${name}">
//                 <img src="${imageSrc}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">
//             </div>
//         `;
//     // if (isLoggedIn) {
//     //     container.innerHTML = `
//     //         <a href="#" class="user-avatar" title="${name}">
//     //             <img src="${imageSrc}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">
//     //         </a>
//     //     `;
//     } else {
//         container.innerHTML = `
//             <a href="login.html" class="btn-outline">Login</a>
//         `;
//     }
// }

// // Automatically run when the page loads
// document.addEventListener('DOMContentLoaded', initProfileNav);









import { auth, onAuthStateChanged, getUserData } from './auth-service.js';

async function initProfileNav() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;

    // Global listener to close dropdown when clicking outside
    // We add this once when the script loads
    window.addEventListener('click', (e) => {
        const dropdown = navAuth.querySelector('.dropdown-content');
        if (dropdown && dropdown.classList.contains('show')) {
            // If the click was NOT inside the profile container, close the menu
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

            // 1. Render immediately
            renderNav(navAuth, photoURL, displayName, true);

            // 2. Database Sync (Optional)
            try {
                const result = await getUserData(user.uid);
                if (result.success && result.data && result.data.profileImage) {
                    if (result.data.profileImage !== photoURL) {
                        const imgTag = navAuth.querySelector('img');
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
        // Inject HTML
        container.innerHTML = `
            <div class="profile-dropdown">
                <div class="user-avatar" style="cursor: pointer;">
                    <img src="${imageSrc}" alt="${name}">
                </div>
                <div class="dropdown-content">
                    <a href="profile.html">My Profile</a>
                    <hr>

                    <a href="dashboard.html">Dashboard</a>
                    <hr>

                    <a href="#" id="logoutBtn" style="color: #d93025;">Logout</a>
                </div>
            </div>
        `;

        // 1. Add CLICK Toggle Logic
        const avatarBtn = container.querySelector('.user-avatar');
        const dropdown = container.querySelector('.dropdown-content');

        avatarBtn.addEventListener('click', (e) => {
            // Prevent this click from immediately triggering the window close listener
            e.stopPropagation(); 
            // Toggle the 'show' class
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