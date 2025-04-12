// src/stores/levelStore.ts
import { defineStore } from 'pinia';
import { Level, TileType } from '../types/Level';
import { GameObject, GameObjectType } from '../types/GameObject';
import { useGameStore } from './gameStore';

interface LevelStoreState {
  currentLevelId: number;
  levels: Level[];
  isLoading: boolean;
}

/**
 * Store for managing levels and level loading
 */
export const useLevelStore = defineStore('level', {
  state: (): LevelStoreState => ({
    currentLevelId: 1,
    levels: [],
    isLoading: false
  }),
  
  getters: {
    /**
     * Get the current level
     */
    currentLevel: (state: LevelStoreState) => {
      return state.levels.find((level: Level) => level.id === state.currentLevelId);
    }
  },
  
  actions: {
    /**
     * Load all levels
     */
    async loadLevels() {
      this.isLoading = true;
      
      try {
        // In a real application, this would load levels from a database or file
        // For now, we'll just create a sample level
        this.levels = [createLevel1(), createLevel2(), createLevel3()];
      } catch (error) {
        console.error('Error loading levels:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Load a specific level by ID
     */
    loadLevel(levelId: number) {
      this.currentLevelId = levelId;
      const gameStore = useGameStore();
      
      // Clear existing game objects
      gameStore.gameObjects = [];
      
      const level = this.currentLevel;
      if (!level) return;
      
      // Set up the level
      convertLevelToGameObjects(level);
    },
    
    /**
     * Go to the next level
     */
    nextLevel() {
      const nextId = this.currentLevelId + 1;
      if (this.levels.some((level: Level) => level.id === nextId)) {
        this.loadLevel(nextId);
        return true;
      }
      return false;
    }
  }
});

// Helper functions for level creation

/**
 * Create a simple first level
 */
function createLevel1(): Level {
  // Create a simple 20x10 level grid
  const width = 20;
  const height = 10;
  const tiles: TileType[][] = [];
  
  // Initialize with empty tiles
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      // Bottom row is ground, with pipe body exception
      if (y === height - 1) {
        // Pipe body in the ground row
        if (x === 12 || x === 13) {
          tiles[y][x] = TileType.PIPE_BODY;
        } else {
          tiles[y][x] = TileType.GROUND;
        }
      } 
      // Place some bricks in the air
      else if (y === height - 4 && (x === 5 || x === 6 || x === 7)) {
        tiles[y][x] = TileType.BRICK;
      }
      // Question blocks with power-ups
      else if (y === height - 4 && (x === 8)) {
        tiles[y][x] = TileType.QUESTION_BLOCK;
      }
      // Place a pipe
      else if (y === height - 2 && (x === 12 || x === 13)) {
        tiles[y][x] = TileType.PIPE_TOP;
      }
      // Place coins
      else if (y === height - 5 && (x === 6 || x === 7)) {
        tiles[y][x] = TileType.COIN;
      }
      // Place an enemy
      else if (y === height - 2 && x === 15) {
        tiles[y][x] = TileType.ENEMY;
      }
      // Place start position
      else if (y === height - 2 && x === 2) {
        tiles[y][x] = TileType.START;
      }
      // Place end position
      else if (y === height - 2 && x === width - 2) {
        tiles[y][x] = TileType.END;
      }
      // Everything else is empty
      else {
        tiles[y][x] = TileType.EMPTY;
      }
    }
  }
  
  return {
    id: 1,
    name: 'Level 1: First Steps',
    width,
    height,
    tileSize: 32,
    tiles,
    background: 'blue_sky',
    music: 'level1_music',
    timeLimit: 180 // 3 minutes
  };
}

/**
 * Create level 2 with slightly more complexity
 */
function createLevel2(): Level {
  // Similar to createLevel1 but with more challenging layout
  // This is a placeholder - you would implement a more complex level
  const width = 25;
  const height = 10;
  const tiles: TileType[][] = [];
  
  // Initialize with empty tiles
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      // Default to empty
      tiles[y][x] = TileType.EMPTY;
    }
  }
  
  // Add ground with gaps
  for (let x = 0; x < width; x++) {
    if (x < 5 || (x > 7 && x < 15) || x > 17) {
      tiles[height - 1][x] = TileType.GROUND;
    }
  }
  
  // Add player start
  tiles[height - 2][2] = TileType.START;
  
  // Add level end
  tiles[height - 2][width - 2] = TileType.END;
  
  return {
    id: 2,
    name: 'Level 2: Mind the Gap',
    width,
    height,
    tileSize: 32,
    tiles,
    background: 'sunset_sky',
    music: 'level2_music',
    timeLimit: 240 // 4 minutes
  };
}

/**
 * Create level 3 with more challenge
 */
function createLevel3(): Level {
  // Even more complex level
  // This is a placeholder - you would implement a more complex level
  const width = 30;
  const height = 12;
  const tiles: TileType[][] = [];
  
  // Initialize with empty tiles
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      // Default to empty
      tiles[y][x] = TileType.EMPTY;
    }
  }
  
  // Add ground
  for (let x = 0; x < width; x++) {
    tiles[height - 1][x] = TileType.GROUND;
  }
  
  // Add player start
  tiles[height - 2][2] = TileType.START;
  
  // Add level end
  tiles[height - 2][width - 2] = TileType.END;
  
  return {
    id: 3,
    name: 'Level 3: The Challenge',
    width,
    height,
    tileSize: 32,
    tiles,
    background: 'night_sky',
    music: 'level3_music',
    timeLimit: 300 // 5 minutes
  };
}

/**
 * Convert a level's tile map to game objects
 * This is a placeholder - in your implementation, you'd create actual game objects
 */
function convertLevelToGameObjects(level: Level): void {
  // Implementation details would go here
  console.log(`Converting level ${level.id} to game objects`);
}