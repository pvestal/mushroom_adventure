// src/types/GameObject.ts
export enum GameObjectType {
  PLAYER = 'player',
  ENEMY = 'enemy',
  COLLECTIBLE = 'collectible',
  TILE = 'tile',
  POWERUP = 'powerup',
  LEVEL_END = 'level_end'
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: GameObjectType;
  visible: boolean;
  update: (deltaTime: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
}

// src/types/GameState.ts
import { GameObject } from './GameObject';

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

// src/types/Level.ts
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

// Add window keyboard definition
declare global {
  interface Window {
    keyboard: Record<string, boolean>;
  }
}