// src/types/index.ts - All type definitions in one place

// Game object types
export enum GameObjectType {
  PLAYER = 'player',
  ENEMY = 'enemy',
  COLLECTIBLE = 'collectible',
  TILE = 'tile',
  POWERUP = 'powerup',
  LEVEL_END = 'level_end'
}

// Base interface for all game objects
export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: GameObjectType;
  visible: boolean;
  // These can be any to accommodate additional properties needed by different object types
  velocity?: { x: number; y: number };
  speed?: number;
  jumpPower?: number;
  isJumping?: boolean;
  tileType?: any; // For tile objects
  collectibleType?: string; // For collectible objects
  enemyType?: string; // For enemy objects
  direction?: number; // For moving objects
  points?: number; // For collectibles
  update: (deltaTime: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  moveLeft?: (deltaTime: number) => void;
  moveRight?: (deltaTime: number) => void;
  stopMoving?: () => void;
  jump?: () => void;
  collect?: () => void; // For collectibles
}

// Tile types for level design
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

// Level structure interface
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

// Level store state
export interface LevelStoreState {
  currentLevelId: number;
  levels: Level[];
  isLoading: boolean;
}

// Game state interface
export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  level: number;
  score: number;
  lives: number;
  timeElapsed: number;
  gameObjects: GameObject[];
  highScore: number;
}

// High score interface
export interface HighScore {
  name: string;
  score: number;
  date?: Date;
}

// Add window keyboard extension
declare global {
  interface Window {
    keyboard: Record<string, boolean>;
  }
}