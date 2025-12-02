import { 
    getUniversities, 
    saveUniversity, 
    removeSavedUniversity, 
    getSavedUniversities,
    auth,
    db, 
//                 <div class="location"><i class="fa-solid fa-map-marker-alt"></i> ${uni.location}</div>
//                 <p class="description">${uni.description}</p>
//                 <div class="tags">
//                     <span class="tag" style="${uni.type === 'Public' ? 'background:#e6f4ea; color:#137333;' : 'background:#e8f0fe; color:var(--primary-blue);'}">
//                         ${uni.type || 'General'}
//                     </span>
//                     <span class="tag secondary">${formatCurrency(uni.tuition)}/year</span>
//                 </div>
//                 <div class="card-actions">
//                     <a href="#" class="view-details" style="color:var(--primary-blue); font-weight:600;">View Details</a>
//                     <div class="compare-check" onclick="window.toggleSaveUniversity('${uni.id}', this)">
//                         <i class="fa-solid ${savedUniversityIds.includes(uni.id) ? 'fa-check-circle' : 'fa-plus-circle'}"></i>
//                         ${savedUniversityIds.includes(uni.id) ? 'Saved' : 'Save'}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `).join('');

//     universitiesList.innerHTML = universitiesHTML;
// }

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
            button.style.color = 'var(--text-grey)';
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
        const navAuth = document.getElementById('navAuth');
        
        // Let profile-load.js handle the nav image, but we need auth state here for logic
        if (user) {
            const result = await getSavedUniversities(user.uid);
            if (result.success) savedUniversityIds = result.data.map(u => u.id);
        }
        
        loadUniversities(); 
    });
}

document.addEventListener('DOMContentLoaded', initDashboard);