// src/stores/gameStore.ts
import { defineStore } from 'pinia';
import { GameState } from '../types/GameState';
import { GameObject, GameObjectType } from '../types/GameObject';

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