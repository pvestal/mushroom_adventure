/* eslint-disable no-dupe-else-if */
// src/stores/index.ts
import { defineStore } from 'pinia';
import { 
  GameState, 
  GameObject, 
  GameObjectType, 
  Level, 
  LevelStoreState,
  TileType 
} from '../types';

/**
 * Central store for managing game state
 */
export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    isRunning: false,
    isPaused: false,
    level: 1,
    score: 0,
    lives: 3,
    timeElapsed: 0,
    gameObjects: [],
    highScore: 0
  }),
  
  getters: {
    /**
     * Get game objects by type
     */
    getObjectsByType: (state) => (type: string) => {
      return state.gameObjects.filter((obj: GameObject) => obj.type === type);
    },
    
    /**
     * Check if the game is over
     */
    isGameOver: (state: GameState) => {
      return state.lives <= 0;
    }
  },
  
  actions: {
    /**
     * Start a new game
     */
    startGame() {
      this.isRunning = true;
      this.isPaused = false;
      this.level = 1;
      this.score = 0;
      this.lives = 3;
      this.timeElapsed = 0;
      this.gameObjects = [];
      
      // Load level data, initialize player, etc.
    },
    
    /**
     * Pause the game
     */
    pauseGame() {
      this.isPaused = true;
    },
    
    /**
     * Resume the game
     */
    resumeGame() {
      this.isPaused = false;
    },
    
    /**
     * End the current game
     */
    endGame() {
      this.isRunning = false;
      
      // Update high score if needed
      if (this.score > this.highScore) {
        this.highScore = this.score;
        // Save high score to Firebase
      }
    },
    
    /**
     * Add points to the score
     */
    addScore(points: number) {
      this.score += points;
    },
    
    /**
     * Lose a life
     */
    loseLife() {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.endGame();
      }
    },
    
    /**
     * Add a game object
     */
    addGameObject(obj: GameObject) {
      this.gameObjects.push(obj);
    },
    
    /**
     * Remove a game object
     */
    removeGameObject(id: string) {
      const index = this.gameObjects.findIndex((obj: GameObject) => obj.id === id);
      if (index !== -1) {
        this.gameObjects.splice(index, 1);
      }
    },
    
    /**
     * Update all game objects
     */
    updateGameObjects(deltaTime: number) {
      for (const obj of this.gameObjects) {
        if (obj.visible) {
          obj.update(deltaTime);
        }
      }
    },
    
    /**
     * Update the game state
     */
    updateGame(deltaTime: number) {
      if (!this.isRunning || this.isPaused) return;
      
      this.timeElapsed += deltaTime;
      this.updateGameObjects(deltaTime);
      
      // Check for collisions, update level progress, etc.
    }
  }
});

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
        this.levels = [createLevel1()];
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
      
      // Set up the level - this would implement level building logic
      // Here you would call the convertLevelToGameObjects function
    },
    
    /**
     * Go to the next level
     * @returns true if successfully moved to next level, false if there is no next level
     */
    nextLevel() {
      const nextId = this.currentLevelId + 1;
      
      if (this.levels.some(level => level.id === nextId)) {
        this.loadLevel(nextId);
        return true;
      }
      
      return false;
    }
  }
});

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
      // Bottom row is ground
      if (y === height - 1) {
        tiles[y][x] = TileType.GROUND;
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
      else if (y === height - 1 && (x === 12 || x === 13)) {
        tiles[y][x] = TileType.PIPE_BODY;
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