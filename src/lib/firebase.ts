import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

/**
 * Firebase web SDK config.
 *
 * These values are intentionally public — Firebase web API keys are
 * designed to ship in the browser. They are read from Vite environment
 * variables so the same build can target different Firebase projects
 * (dev, staging, prod) without code changes.
 *
 * See `.env.example` for the variable names. At runtime, every value
 * MUST be set; if any are missing we throw a clear error rather than
 * silently using stale hardcoded values (which is what the previous
 * version of this file did and which made local dev on a different
 * Firebase project confusing).
 */
function readConfig() {
  const env = import.meta.env;
  const required = [
    ["apiKey", env.VITE_FIREBASE_API_KEY],
    ["authDomain", env.VITE_FIREBASE_AUTH_DOMAIN],
    ["projectId", env.VITE_FIREBASE_PROJECT_ID],
    ["storageBucket", env.VITE_FIREBASE_STORAGE_BUCKET],
    ["messagingSenderId", env.VITE_FIREBASE_MESSAGING_SENDER_ID],
    ["appId", env.VITE_FIREBASE_APP_ID],
  ] as const;

  const missing = required.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and fill in the values, or set them in your deploy environment.`,
    );
  }

  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
}

const app = getApps().length > 0 ? getApp() : initializeApp(readConfig());

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
export const firebaseStorage = getStorage(app);
export const firebaseFunctions = getFunctions(app, "us-central1");
