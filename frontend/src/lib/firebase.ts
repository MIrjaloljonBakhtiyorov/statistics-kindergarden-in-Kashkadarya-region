import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "gen-lang-client-0285344350",
  "appId": "1:214305082096:web:11a95400901c1ec6231035",
  "apiKey": "AIzaSyAicMwcQWcw0LI15TB7_QTunuE7BFvCRmk",
  "authDomain": "gen-lang-client-0285344350.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-b725744f-f717-49dd-b986-3fd6f32b3b03",
  "storageBucket": "gen-lang-client-0285344350.firebasestorage.app",
  "messagingSenderId": "214305082096",
  "measurementId": ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();
