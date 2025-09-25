// Firebase configuration for JobGenie
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-jobgenie.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-jobgenie",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-jobgenie.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Connect to Firebase Emulators in development
if (import.meta.env.DEV) {
  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  } catch (error) {
    // Emulator already connected
  }
  
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8081)
  } catch (error) {
    // Emulator already connected
  }
}

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' && !import.meta.env.DEV ? getAnalytics(app) : null

// Initialize Google Generative AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDummy_Key_For_Development"
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// Initialize Gemini models
export const geminiFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
export const geminiPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })