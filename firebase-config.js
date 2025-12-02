// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDSV_eF9RRYLiTTnI34pda6XVKsP1GcZrU",
    authDomain: "unifind-4acdf.firebaseapp.com",
    projectId: "unifind-4acdf",
    storageBucket: "unifind-4acdf.firebasestorage.app",
    messagingSenderId: "102600866396",
    appId: "1:102600866396:web:1a359518ba1ead5133c499",
    measurementId: "G-X0ZQMD0W88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };