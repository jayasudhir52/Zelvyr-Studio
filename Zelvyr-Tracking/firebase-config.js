import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyBK06H-zoQV6cO-suUMbL5oeDMFV-5oxzw",
    authDomain: "zelvyr-studio.firebaseapp.com",
    projectId: "zelvyr-studio", 
    storageBucket: "zelvyr-studio.firebasestorage.app",
    messagingSenderId: "102415807018", // Provided project number
    appId: "1:102415807018:web:f9669dfc1bfe0baad10953"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, query, where, doc, updateDoc };
