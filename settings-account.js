// settings.js
import { 
    auth, 
    onAuthStateChanged, 
    getUserData, 
    updateUserData,
    updateUserProfile, 
    profileImages,     
    logout,
    deleteUserAccount 
} from './auth-service.js';

let currentUser = null;
let userData = null;
let selectedImage = '';

// Initialize settings page
async function initSettings() {
    // Check auth state
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadUserData();
            // This line was not running before because of the crash above
            setupEventListeners(); 
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
        updateSettingsDisplay();
    } else {
        alert('Error loading settings: ' + result.error);
    }
}

// Update settings display
function updateSettingsDisplay() {
    // Sidebar info
    if(document.getElementById('sidebarName')) 
        document.getElementById('sidebarName').textContent = userData.fullName;
    
    if(document.getElementById('sidebarEducation')) 
        document.getElementById('sidebarEducation').textContent = userData.educationLevel;
    
    if(document.getElementById('sidebarImage')) 
        document.getElementById('sidebarImage').src = userData.profileImage || 'images/user.png';
    
    // Check if navAvatar exists before accessing it
    const navAvatar = document.getElementById('navAvatar');
    if (navAvatar) {
        navAvatar.src = userData.profileImage || 'images/user.png';
    }

    // Personal information Form
    const nameParts = userData.fullName.split(' ');
    document.getElementById('firstName').value = nameParts[0] || '';
    document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    document.getElementById('email').value = userData.email;
    document.getElementById('educationLevel').value = userData.educationLevel;
    
    // Notifications - SAFEGUARDED
    // We check if the element exists first because you commented them out in HTML
    const notifyPrograms = document.getElementById('notifyPrograms');
    const notifyFees = document.getElementById('notifyFees');
    const newsletter = document.getElementById('newsletter');

    if (notifyPrograms) notifyPrograms.checked = userData.notifications?.newPrograms ?? true;
    if (notifyFees) notifyFees.checked = userData.notifications?.feeUpdates ?? true;
    if (newsletter) newsletter.checked = userData.notifications?.newsletter ?? false;
}

// Setup event listeners
function setupEventListeners() {
    // Personal Info Form Submit
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // This stops the refresh
            await savePersonalInfo();
        });
    }
    
    // Save notification settings
    document.querySelectorAll('.toggle-switch input').forEach(checkbox => {
        checkbox.addEventListener('change', saveNotificationSettings);
    });
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                await logout();
                window.location.href = 'login.html';
            }
        });
    }

    // --- DELETE ACCOUNT LOGIC ---
    const deleteModal = document.getElementById('deleteModal');
    const deleteBtn = document.getElementById('deleteAccountBtn');
    
    // Only set up delete logic if the button exists
    if (deleteModal && deleteBtn) {
        const cancelDeleteBtn = document.getElementById('cancelDelete');
        const confirmDeleteBtn = document.getElementById('confirmDelete');
        const deleteInput = document.getElementById('deleteConfirm');
        const closeBtn = deleteModal.querySelector('.close');

        // 1. Open Modal (Step 1)
        deleteBtn.addEventListener('click', () => {
            deleteModal.style.display = 'flex';
            deleteInput.value = ''; // Reset input
            confirmDeleteBtn.disabled = true; // Disable button initially
            confirmDeleteBtn.style.opacity = '0.5';
            confirmDeleteBtn.style.cursor = 'not-allowed';
        });

        // 2. Close Modal Logic
        const closeModal = () => deleteModal.style.display = 'none';
        cancelDeleteBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeModal();
        });

        // 3. Verification Logic (Step 2 - Type "DELETE")
        deleteInput.addEventListener('input', (e) => {
            if (e.target.value === 'DELETE') {
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.style.opacity = '1';
                confirmDeleteBtn.style.cursor = 'pointer';
            } else {
                confirmDeleteBtn.disabled = true;
                confirmDeleteBtn.style.opacity = '0.5';
                confirmDeleteBtn.style.cursor = 'not-allowed';
            }
        });

        // 4. Perform Deletion
        confirmDeleteBtn.addEventListener('click', async () => {
            confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
            
            const result = await deleteUserAccount();
            
            if (result.success) {
                alert('Your account has been successfully deleted.');
                window.location.href = 'index.html';
            } else {
                alert('Error: ' + result.error);
                confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete Account';
                
                if (result.error.includes('log out')) {
                    await logout();
                    window.location.href = 'login.html';
                }
            }
        });
    }
    // ---------------------------

    // Image Modal Triggers
    const triggerImgBtn = document.getElementById('triggerImageModal');
    if (triggerImgBtn) {
        triggerImgBtn.addEventListener('click', openImageSelectionModal);
        document.getElementById('cancelImageSelect').addEventListener('click', closeImageModal);
        
        const closeImgModalBtn = document.querySelector('#imageModal .close');
        if(closeImgModalBtn) closeImgModalBtn.addEventListener('click', closeImageModal);
        
        document.getElementById('confirmImageSelect').addEventListener('click', saveNewProfileImage);
    }
}

// Open image selection modal
function openImageSelectionModal() {
    const modal = document.getElementById('imageModal');
    const imageGrid = document.getElementById('imageGrid');
    
    // Populate image grid
    imageGrid.innerHTML = profileImages.map((img, index) => `
        <div class="image-option ${userData.profileImage === img ? 'selected' : ''}" data-image="${img}">
            <img src="${img}" alt="Profile Image ${index + 1}">
            <div class="image-overlay">
                <i class="fa-solid fa-check"></i>
            </div>
        </div>
    `).join('');
    
    selectedImage = userData.profileImage;
    modal.style.display = 'flex'; 
    
    imageGrid.querySelectorAll('.image-option').forEach(option => {
        option.addEventListener('click', () => {
            imageGrid.querySelectorAll('.image-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedImage = option.dataset.image;
        });
    });

    modal.onclick = (e) => {
        if (e.target === modal) closeImageModal();
    }
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// Save New Profile Image
async function saveNewProfileImage() {
    const result = await updateUserProfile({
        profileImage: selectedImage
    });
    
    if (result.success) {
        await loadUserData();
        closeImageModal();
        showMessage('Profile image updated successfully!', 'success');
    } else {
        showMessage('Error updating profile image: ' + result.error, 'error');
    }
}

// Save personal information
async function savePersonalInfo() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const educationLevel = document.getElementById('educationLevel').value;
    
    const fullName = `${firstName} ${lastName}`.trim();

    const result = await updateUserProfile({
        fullName: fullName,
        educationLevel: educationLevel
    });
    
    if (result.success) {
        showMessage('Personal information updated successfully!', 'success');
        await loadUserData();
    } else {
        showMessage('Error updating personal information: ' + result.error, 'error');
    }
}

// Save notification settings
async function saveNotificationSettings() {
    const notifyPrograms = document.getElementById('notifyPrograms');
    const notifyFees = document.getElementById('notifyFees');
    const newsletter = document.getElementById('newsletter');

    // Only save if elements exist
    if (!notifyPrograms || !notifyFees || !newsletter) return;

    const notifications = {
        newPrograms: notifyPrograms.checked,
        feeUpdates: notifyFees.checked,
        newsletter: newsletter.checked
    };
    
    const result = await updateUserData(currentUser.uid, {
        notifications: notifications
    });
    
    if (result.success) {
        showMessage('Notification settings updated!', 'success');
    } else {
        showMessage('Error updating notification settings: ' + result.error, 'error');
    }
}

// Show message
function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) existingMessage.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 2rem;
        color: white;
        z-index: 2000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSettings);