// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBpffbHcYcc4xQlooLCjvyW5h34c-x2y4g",
  authDomain: "sounddepot-pos.firebaseapp.com",
  projectId: "sounddepot-pos",
  storageBucket: "sounddepot-pos.firebasestorage.app",
  messagingSenderId: "869259922188",
  appId: "1:869259922188:web:967c7922f752f318fc9729",
  measurementId: "G-KQPBHN16HZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth
export const auth = getAuth(app);

// Useful auth helpers
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
};
