// src/services/mockFirebase.ts
import { HighScore } from '../types';

// In-memory storage for high scores
let highScores: HighScore[] = [
  { name: "Player1", score: 8000 },
  { name: "Player2", score: 7500 },
  { name: "Player3", score: 6200 },
  { name: "Player4", score: 5800 },
  { name: "Player5", score: 4900 }
];

/**
 * Fetch high scores from mock storage
 * @returns Promise with array of high scores
 */
export const fetchHighScores = async (): Promise<HighScore[]> => {
  return [...highScores].sort((a, b) => b.score - a.score).slice(0, 10);
};

/**
 * Save a score to mock storage
 * @param name Player name
 * @param score Player score
 * @returns Promise with dummy document reference
 */
export const saveScore = async (name: string, score: number) => {
  highScores.push({
    name,
    score,
    date: new Date()
  });
  
  // Sort high scores in descending order
  highScores.sort((a, b) => b.score - a.score);
  
  // Keep only the top 10 scores
  if (highScores.length > 10) {
    highScores = highScores.slice(0, 10);
  }
  
  return { id: 'mock-doc-id' };
};