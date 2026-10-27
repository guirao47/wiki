import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, set, update, push, remove } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Auth helpers
export const loginMagician = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutMagician = () => signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// Realtime DB helpers
export const watchPath = <T>(path: string, callback: (data: T | null) => void) => {
  const refDb = ref(db, path);
  onValue(refDb, (snapshot) => callback(snapshot.val()));
  return () => off(refDb);
};

export const writePath = <T>(path: string, data: T) => set(ref(db, path), data);

export const updatePath = <T>(path: string, data: Partial<T>) => update(ref(db, path), data);

export const pushPath = <T>(path: string, data: T) => push(ref(db, path), data);

export const deletePath = (path: string) => remove(ref(db, path));

export const getRef = (path: string) => ref(db, path);

// Predicción helpers
export const forceQuery = (sessionId: string, query: string) =>
  update(ref(db, `sessions/${sessionId}/control`), { forcedQuery: query, timestamp: Date.now() });

export const clearForce = (sessionId: string) =>
  update(ref(db, `sessions/${sessionId}/control`), { forcedQuery: '', timestamp: Date.now() });