// src/types/index.ts - All type definitions in one place

// Re-export types from their individual files
export { GameObject, GameObjectType } from './GameObject';
export { GameState } from './GameState';
export { Level, TileType, LevelStoreState } from './Level';

// High score interface
export interface HighScore {
  name: string;
  score: number;
  date?: Date;
}