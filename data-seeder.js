import { db } from './auth-service.js';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const universitiesData = [
    {
        name: "American University in Cairo (AUC)",
        location: "New Cairo",
        type: "Private",
        tuition: 1100000,
        language: "English",
        system: "American Credit Hours",
        website: "https://www.aucegypt.edu",
        description: "Egypt's premier private university offering American-accredited degrees.",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/97/American_University_in_Cairo_logo.png/220px-American_University_in_Cairo_logo.png",
        // Expanded Faculties
        faculties: [
            "Engineering", "Business", "Global Affairs", "Humanities", 
            "Sciences", "Computer Science", "Arts", "Architecture"
        ]
    },
    {
        name: "German University in Cairo (GUC)",
        location: "New Cairo",
        type: "Private",
        tuition: 350000,
        language: "English/German",
        system: "German Credit Hours",
        website: "https://www.guc.edu.eg",
        description: "Specialized in Engineering and Management with German cooperation.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/GUC_Logo.png/220px-GUC_Logo.png",
        faculties: [
            "Engineering", "Management Technology", "Pharmacy", "Applied Arts", 
            "Law", "Architecture", "Computer Science"
        ]
    },
    {
        name: "British University in Egypt (BUE)",
        location: "El Shorouk",
        type: "Private",
        tuition: 260000,
        language: "English",
        system: "British Dual Degree",
        website: "https://www.bue.edu.eg",
        description: "Offers dual degrees accredited in Egypt and the UK (LSBU, QMU).",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/BUE_Logo.png/220px-BUE_Logo.png",
        faculties: [
            "Engineering", "Business Admin", "Pharmacy", "Informatics", 
            "Mass Communication", "Arts & Humanities", "Dentistry", "Law", "Nursing"
        ]
    },
    {
        name: "Cairo University",
        location: "Giza",
        type: "Public",
        tuition: 60000,
        language: "English",
        system: "Credit Hours",
        website: "https://eng.cu.edu.eg",
        description: "Top-tier public programs with specialized credit-hour tracks.",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/Cairo_University_crest.png/220px-Cairo_University_crest.png",
        // Added Archeology & Tourism here
        faculties: [
            "Medicine", "Engineering", "Law", "Arts", "Archeology", 
            "Commerce", "Science", "Agriculture", "Computers & AI", 
            "Mass Communication", "Pharmacy", "Dentistry", "Nursing", 
            "Economics & Political Science"
        ]
    },
    {
        name: "Ain Shams University",
        location: "Cairo",
        type: "Public",
        tuition: 55000,
        language: "English",
        system: "Credit Hours",
        website: "https://asu.edu.eg",
        description: "Leading public research university with specialized English tracks.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ain_Shams_University_logo.png/220px-Ain_Shams_University_logo.png",
        faculties: [
            "Medicine", "Engineering", "Pharmacy", "Education", "Al-Alsun", 
            "Archeology", "Commerce", "Science", "Law", "Agriculture", 
            "Computers & Information"
        ]
    },
    {
        name: "Helwan University",
        location: "Cairo",
        type: "Public",
        tuition: 50000,
        language: "English",
        system: "Credit Hours",
        website: "https://www.helwan.edu.eg",
        description: "Known for its distinctive faculties of Arts and Tourism.",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Helwan_University_Logo.png/220px-Helwan_University_Logo.png",
        // Added Tourism specifically here
        faculties: [
            "Tourism & Hotels", "Fine Arts", "Applied Arts", "Engineering", 
            "Commerce", "Pharmacy", "Science", "Law"
        ]
    },
    {
        name: "Misr International University (MIU)",
        location: "Obour City",
        type: "Private",
        tuition: 160000,
        language: "English",
        system: "American",
        website: "https://www.miuegypt.edu.eg",
        description: "Established private university with strong international partnerships.",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Misr_International_University_logo.png/220px-Misr_International_University_logo.png",
        faculties: [
            "Dentistry", "Pharmacy", "Engineering", "Business", 
            "Al-Alsun", "Mass Communication", "Computer Science"
        ]
    },
    {
        name: "Future University in Egypt (FUE)",
        location: "New Cairo",
        type: "Private",
        tuition: 177000,
        language: "English",
        system: "Credit Hours",
        website: "https://www.fue.edu.eg",
        description: "Modern campus known for Pharmaceutical and Dental sciences.",
        logo: "https://upload.wikimedia.org/wikipedia/en/7/77/Future_University_in_Egypt_logo.png",
        faculties: [
            "Pharmacy", "Dentistry", "Engineering", "Commerce", 
            "Computers & IT", "Economics & Political Science"
        ]
    }
];

export async function seedData() {
    console.log("🚀 Starting data seed with updated Faculties...");

    if (!db) {
        console.error("❌ Database connection not found.");
        return;
    }

    try {
        const colRef = collection(db, "universities");

        for (const uni of universitiesData) {
            const q = query(colRef, where("name", "==", uni.name));
            const snap = await getDocs(q);

            if (snap.empty) {
                await addDoc(colRef, { ...uni, createdAt: new Date() });
                console.log(`✅ Added: ${uni.name}`);
            } else {
                // Update existing document with new faculties field
                const docRef = doc(db, "universities", snap.docs[0].id);
                // We overwrite 'programs' with 'faculties' to be consistent, or add both
                await updateDoc(docRef, { faculties: uni.faculties });
                console.log(`🔄 Updated Faculties for: ${uni.name}`);
            }
        }
        console.log("🎉 Data seeding complete!");
    } catch (error) {
        console.error("❌ Error seeding data:", error);
    }
}