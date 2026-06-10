import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

let auth;
if (firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  // Dummy auth for development without real Firebase config
  const dummy = {
    currentUser: null,
    onAuthStateChanged: (cb) => {
      cb(null);
      return () => {};
    },
    // Stub functions return resolved promises
    createUserWithEmailAndPassword: async () => ({ user: { uid: "dev", email: "dev@example.com", displayName: "Dev User" } }),
    signInWithEmailAndPassword: async () => ({ user: { uid: "dev", email: "dev@example.com", displayName: "Dev User" } }),
    signOut: async () => {},
    signInWithPopup: async () => ({ user: { uid: "dev", email: "dev@example.com", displayName: "Dev User" } }),
    sendPasswordResetEmail: async () => {},
    updateProfile: async () => {},
    GoogleAuthProvider: class {},
  } as any;
  auth = dummy;
}

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile };
