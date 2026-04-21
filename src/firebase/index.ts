
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, isConfigValid } from './config';

export function initializeFirebase() {
  if (!isConfigValid) {
    // Use warn instead of error to prevent NextJS full-screen crash overlay
    console.warn("VITAL-AURA: Firebase configuration is missing or pending. Using offline fallback mode.");
    return { 
      firebaseApp: null as any, 
      firestore: null as any, 
      auth: null as any 
    };
  }
  
  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    
    console.log("[Firebase] Session Established.");
    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.warn("[Firebase] Initialization issue detected. App running in restricted mode.", error);
    return { 
      firebaseApp: null as any, 
      firestore: null as any, 
      auth: null as any 
    };
  }
}

export * from './provider';
export * from './client-provider';
export { useUser } from './auth/use-user';
export { useDoc } from './firestore/use-doc';
export { useCollection } from './firestore/use-collection';
