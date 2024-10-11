// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Import necessary functions
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQCz_o0GvIcv71m1CUahp58gKuUpMpmxU",
  authDomain: "alp-new.firebaseapp.com",
  projectId: "alp-new",
  storageBucket: "alp-new.appspot.com",
  messagingSenderId: "373323302973",
  appId: "1:373323302973:web:3b82d5e2ee31e4c29c8254",
  measurementId: "G-S663RM9BQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Initialize Firestore and Authentication
export const db = getFirestore(app);
export const auth = getAuth(app);
export { storage };

// Set authentication persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local storage");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error); // Log any errors during persistence setup
  });

