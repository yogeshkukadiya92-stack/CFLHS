'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// IMPORTANT: This configuration is for your Firebase project.
// Do not modify it unless you intend to switch to a different project.
const firebaseConfig = {
  "projectId": "kra-dashboard-7zwcr",
  "appId": "1:312075972890:web:e919b0632350589f8e3ca3",
  "storageBucket": "kra-dashboard-7zwcr.firebasestorage.app",
  "apiKey": "AIzaSyA3z4_7tMgAdB0rrTNo8R3gka-FLWixj2A",
  "authDomain": "kra-dashboard-7zwcr.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "312075972890"
};

// Initialize Firebase robustly
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
