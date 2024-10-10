//firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
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

