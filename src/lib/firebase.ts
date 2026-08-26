import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCMxYTfot83W4txTDdW9wcCKMOVC4N2uz4",
  authDomain: "zfhx4ai.firebaseapp.com",
  projectId: "zfhx4ai",
  storageBucket: "zfhx4ai.firebasestorage.app",
  messagingSenderId: "537853698125",
  appId: "1:537853698125:web:f3789e7f79f255b780fc04",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
export const firebaseStorage = getStorage(app);
export const firebaseFunctions = getFunctions(app, "us-central1");
