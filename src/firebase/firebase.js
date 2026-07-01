// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAl-Ppj8ApKSCca32MTfzmp8qiuMbrotYg",
    authDomain: "varta-087.firebaseapp.com",
    projectId: "varta-087",
    storageBucket: "varta-087.firebasestorage.app",
    messagingSenderId: "186026907472",
    appId: "1:186026907472:web:f6d3fb611b8521292cbe55",
    measurementId: "G-6R5R6MDC9R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;