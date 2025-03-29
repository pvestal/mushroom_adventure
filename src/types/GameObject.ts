// src/types/GameObject.ts
export enum GameObjectType {
  PLAYER = 'player',
  ENEMY = 'enemy',
  COLLECTIBLE = 'collectible',
  TILE = 'tile',
  POWERUP = 'powerup',
  LEVEL_END = 'level_end'
}

/**
 * Base interface for all game objects
 */
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
  // Optional methods and properties that some game objects might implement
  velocity?: { x: number; y: number };
  speed?: number;
  jumpPower?: number;
  isJumping?: boolean;
  tileType?: any;
  collectibleType?: string;
  enemyType?: string;
  direction?: number;
  points?: number;
  moveLeft?: (deltaTime: number) => void;
  moveRight?: (deltaTime: number) => void;
  stopMoving?: () => void;
  jump?: () => void;
  collect?: () => void;
}

// Add window keyboard definition
declare global {
  interface Window {
    keyboard: Record<string, boolean>;
  }
}