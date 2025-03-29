// src/types/HighScore.ts

/**
 * Interface for high score entries
 * Used for displaying and storing player achievements
 */
export interface HighScore {
    /** Player name */
    name: string;
    
    /** Score achieved */
    score: number;
    
    /** When the score was achieved (optional) */
    date?: Date;
  }