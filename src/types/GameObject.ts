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
  tileType?: string;
  collectibleType?: string;
  enemyType?: string;
  direction?: number;
  points?: number;
  moveLeft?: (deltaTime: number) => void;
  moveRight?: (deltaTime: number) => void;
  stopMoving?: () => void;
  jump?: () => void;
  collect?: () => void;

  // New sprite properties
  spriteKey?: string;         // Reference to the sprite to use
  spriteFrame?: number;       // Current animation frame
  spriteFrameCount?: number;  // Total frames in animation
  spriteFrameWidth?: number;  // Width of a single frame
  spriteFrameHeight?: number; // Height of a single frame
  spriteAnimationSpeed?: number; // Frames per second
  spriteAnimationTime?: number;  // Current animation time
}

// Add window keyboard definition
declare global {
  interface Window {
    keyboard: Record<string, boolean>;
  }
}