// src/types/GameState.ts
import { GameObject } from './GameObject';

/**
 * Interface defining the global game state
 * Holds all the information needed to track game progress
 */
export interface GameState {
  /** Whether the game is currently running or not */
  isRunning: boolean;
  
  /** Whether the game is currently paused */
  isPaused: boolean;
  
  /** Current level number */
  level: number;
  
  /** Current player score */
  score: number;
  
  /** Number of lives remaining */
  lives: number;
  
  /** Time elapsed in the current level (in seconds) */
  timeElapsed: number;
  
  /** Array of all game objects currently in the game */
  gameObjects: GameObject[];
  
  /** Highest score achieved in any game */
  highScore: number;
}