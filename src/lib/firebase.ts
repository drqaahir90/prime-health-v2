import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBn56HOZ5b8-LeY_YgHk8mOHdHeEnumKBY",
  authDomain: "prime-health-consult.firebaseapp.com",
  projectId: "prime-health-consult",
  storageBucket: "prime-health-consult.firebasestorage.app",
  messagingSenderId: "991978966260",
  appId: "1:991978966260:web:40f5f65316037b357b22a1"
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);

export default app;
