// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { HighScore } from '../types';

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Fetch high scores from Firestore
 * @returns Promise with array of high scores
 */
export const fetchHighScores = async (): Promise<HighScore[]> => {
  try {
    const scoresRef = collection(db, 'highScores');
    const q = query(scoresRef, orderBy('score', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    
    const scores: HighScore[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scores.push({
        name: data.name,
        score: data.score
      });
    });
    
    return scores;
  } catch (error) {
    console.error('Error fetching high scores:', error);
    return [];
  }
};

/**
 * Save a score to Firestore
 * @param name Player name
 * @param score Player score
 * @returns Promise with the document reference
 */
export const saveScore = async (name: string, score: number) => {
  try {
    const scoresRef = collection(db, 'highScores');
    const docRef = await addDoc(scoresRef, {
      name,
      score,
      date: new Date()
    });
    
    return docRef;
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
};