// auth-service.js
import { app } from './firebase-config.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail, // Import this
    setPersistence,         // Import this
    browserLocalPersistence,// Import this
    browserSessionPersistence, // Import this
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    arrayRemove,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// ... (Existing Profile Images code) ...
const profileImages = [
    "images/profile/1.jpg",
    "images/profile/2.jpg",
    "images/profile/3.jpg",
    "images/profile/4.jpg",
    "images/profile/5.jpg",
    "images/profile/6.jpg",
    "images/profile/7.jpg",
    "images/profile/8.jpg",
    "images/profile/9.jpg",
    "images/profile/10.jpg",
    "images/profile/11.jpg",
    "images/profile/12.jpg",
    "images/profile/23.jpg",
    "images/profile/13.jpg",
    "images/profile/14.jpg",
    "images/profile/15.jpg",
    "images/profile/16.jpg",
    "images/profile/17.jpg",
    "images/profile/18.jpg",
    "images/profile/19.jpg",
    "images/profile/20.jpg",
    "images/profile/21.jpg",
    "images/profile/22.jpg",
    "images/profile/24.jpg",

];

function getRandomProfileImage() {
    return profileImages[Math.floor(Math.random() * profileImages.length)];
}

// Authentication Functions
async function signUp(email, password, fullName, educationLevel = "High School Senior") {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const profileImage = getRandomProfileImage();
        
        await updateProfile(user, {
            displayName: fullName,
            photoURL: profileImage
        });

        await setDoc(doc(db, "users", user.uid), {
            fullName: fullName,
            email: email,
            educationLevel: educationLevel,
            profileImage: profileImage,
            createdAt: new Date(),
            savedUniversities: [],
            comparisons: [],
            notifications: {
                newPrograms: true,
                feeUpdates: true,
                newsletter: false
            }
        });

        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Updated Login Function to handle Remember Me
async function login(email, password, rememberMe = false) {
    try {
        // Set persistence based on checkbox
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistenceType);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// New Function: Reset Password
async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteUserAccount() {
    try {
        const user = auth.currentUser;
        if (!user) return { success: false, error: "No user logged in" };
        const uid = user.uid;

        const comparisonsQ = query(collection(db, "comparisons"), where("userId", "==", uid));
        const comparisonsSnapshot = await getDocs(comparisonsQ);
        
        const deletePromises = [];
        comparisonsSnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);

        await deleteDoc(doc(db, "users", uid));
        await deleteUser(user);

        return { success: true };
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            return { success: false, error: "Security check: Please log out and log in again to delete your account." };
        }
        return { success: false, error: error.message };
    }
}

// ... (Keep existing User Data, University, Saved, Comparison functions exactly as they were) ...
// (I will omit re-pasting the bottom half to save space, but assume the rest of the file remains unchanged)

// User Data Functions
async function getUserData(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: false, error: "User data not found" };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateUserData(uid, data) {
    try {
        const docRef = doc(db, "users", uid);
        await updateDoc(docRef, data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateUserProfile(updates) {
    try {
        const user = auth.currentUser;
        if (!user) return { success: false, error: "No user logged in" };

        if (updates.displayName || updates.photoURL) {
            await updateProfile(user, {
                displayName: updates.displayName || user.displayName,
                photoURL: updates.photoURL || user.photoURL
            });
        }

        const firestoreUpdates = {};
        if (updates.fullName) firestoreUpdates.fullName = updates.fullName;
        if (updates.educationLevel) firestoreUpdates.educationLevel = updates.educationLevel;
        if (updates.profileImage) firestoreUpdates.profileImage = updates.profileImage;

        if (Object.keys(firestoreUpdates).length > 0) {
            await updateUserData(user.uid, firestoreUpdates);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// University Functions
async function getUniversities(filters = {}) {
    try {
        let q = collection(db, "universities");
        
        const constraints = [];
        if (filters.location) {
            constraints.push(where("location", "==", filters.location));
        }
        if (filters.type) {
            constraints.push(where("type", "==", filters.type));
        }
        
        if (constraints.length > 0) {
            q = query(q, ...constraints);
        }
        
        const querySnapshot = await getDocs(q);
        const universities = [];
        querySnapshot.forEach((doc) => {
            universities.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: universities };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getUniversityById(id) {
    try {
        const docRef = doc(db, "universities", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { success: false, error: "University not found" };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Saved Universities Functions
async function saveUniversity(uid, universityId) {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            savedUniversities: arrayUnion(universityId)
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function removeSavedUniversity(uid, universityId) {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            savedUniversities: arrayRemove(universityId)
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getSavedUniversities(uid) {
    try {
        const userData = await getUserData(uid);
        if (!userData.success) return userData;
        
        const savedUniversityIds = userData.data.savedUniversities || [];
        const universities = [];
        
        for (const universityId of savedUniversityIds) {
            const universityData = await getUniversityById(universityId);
            if (universityData.success) {
                universities.push(universityData.data);
            }
        }
        
        return { success: true, data: universities };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Comparison Functions
async function createComparison(uid, universityIds, name) {
    try {
        const comparisonRef = await addDoc(collection(db, "comparisons"), {
            userId: uid,
            universityIds: universityIds,
            name: name || `Comparison ${new Date().toLocaleDateString()}`,
            createdAt: new Date()
        });
        
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            comparisons: arrayUnion(comparisonRef.id)
        });
        
        return { success: true, id: comparisonRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getComparisonById(id) {
    try {
        const docRef = doc(db, "comparisons", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { success: false, error: "Comparison not found" };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getUserComparisons(uid) {
    try {
        const userData = await getUserData(uid);
        if (!userData.success) return userData;
        
        const comparisonIds = userData.data.comparisons || [];
        const comparisons = [];
        
        for (const comparisonId of comparisonIds) {
            const comparisonData = await getComparisonById(comparisonId);
            if (comparisonData.success) {
                const comparison = comparisonData.data;
                const universities = [];
                
                for (const uniId of comparison.universityIds) {
                    const uniData = await getUniversityById(uniId);
                    if (uniData.success) {
                        universities.push(uniData.data);
                    }
                }
                
                comparisons.push({
                    ...comparison,
                    universities: universities
                });
            }
        }
        
        return { success: true, data: comparisons };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function searchUniversitiesLocal(query) {
    try {
        const allUniversities = await getUniversities();
        if (!allUniversities.success) return allUniversities;
        
        const filtered = allUniversities.data.filter(uni => 
            uni.name.toLowerCase().includes(query.toLowerCase()) ||
            uni.location.toLowerCase().includes(query.toLowerCase()) ||
            uni.description.toLowerCase().includes(query.toLowerCase())
        );
        
        return { success: true, data: filtered };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export {
    auth,
    db,
    signUp,
    login,
    logout,
    resetPassword, // Export new function
    deleteUserAccount, 
    onAuthStateChanged,
    getUserData,
    updateUserData,
    updateUserProfile,
    getUniversities,
    getUniversityById,
    saveUniversity,
    removeSavedUniversity,
    getSavedUniversities,
    createComparison,
    getUserComparisons,
    getRandomProfileImage,
    profileImages
};