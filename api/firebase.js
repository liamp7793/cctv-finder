import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBnlctkOpVp0g71o0MO9peptYbtPBJzepQ",
  authDomain: "cctv-finder-users.firebaseapp.com",
  projectId: "cctv-finder-users",
  storageBucket: "cctv-finder-users.firebasestorage.app",
  messagingSenderId: "435511062817",
  appId: "1:435511062817:web:1c0d8a9eb69d794850ce60"
};

// Initialize Firebase only if it's not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
