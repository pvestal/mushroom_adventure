// src/types/Level.ts
// Define level-related types without importing from other modules

/**
 * Tile types for level design
 */
export enum TileType {
  EMPTY = 0,
  GROUND = 1,
  BRICK = 2,
  QUESTION_BLOCK = 3,
  PIPE_TOP = 4,
  PIPE_BODY = 5,
  COIN = 6,
  MUSHROOM = 7,
  ENEMY = 8,
  START = 9,
  END = 10
}

/**
 * Level structure interface
 */
export interface Level {
  id: number;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  tiles: TileType[][];
  background: string;
  music: string;
  timeLimit: number;
}

/**
 * Level store state
 */
export interface LevelStoreState {
  currentLevelId: number;
  levels: Level[];
  isLoading: boolean;
}