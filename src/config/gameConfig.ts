// src/config/gameConfig.ts
// This file contains various configuration settings for the game

export const GameConfig = {
  // Player settings
  player: {
    speed: 200,          // Player movement speed in pixels per second
    jumpPower: 400,      // Initial velocity when jumping
    gravity: 1000,       // Gravity acceleration in pixels per second squared
    width: 32,           // Player width in pixels
    height: 32,          // Player height in pixels
    lives: 3,            // Starting number of lives
  },
  
  // Enemy settings
  enemy: {
    speed: 50,           // Enemy movement speed in pixels per second
    scoreValue: 150,     // Score gained from defeating an enemy
  },
  
  // Collectible settings
  collectibles: {
    coin: {
      scoreValue: 100,   // Score gained from collecting a coin
    },
    mushroom: {
      scoreValue: 200,   // Score gained from collecting a mushroom
    },
  },
  
  // Level settings
  level: {
    tileSize: 32,        // Size of each tile in pixels
    completionBonus: 1000, // Score bonus for completing a level
    timeLimit: 180,      // Time limit in seconds (3 minutes)
  },
  
  // Game settings
  game: {
    initialLevel: 1,     // Starting level number
    scoreMultiplier: 1,  // Score multiplier (can increase in later levels)
    debug: false,        // Enable debug mode (shows collision boxes, etc.)
  },
  
  // Physics settings
  physics: {
    frictionGround: 0.8, // Friction coefficient when on ground (lower = more slippery)
    frictionAir: 0.95,   // Friction coefficient when in air
  },
  
  // Visual settings
  visuals: {
    backgroundColor: '#87CEEB', // Sky blue background
    groundColor: '#8B4513',     // Brown ground
    playerCapColor: '#D80000',  // Red mushroom cap
    playerStemColor: '#FFFFFF', // White mushroom stem
    enemyColor: '#8B4513',      // Brown enemy
    coinColor: '#FFD700',       // Gold coin
    brickColor: '#D2691E',      // Chocolate brick
    questionBlockColor: '#FFD700', // Gold question block
    pipeColor: '#00AA00',       // Green pipe
  }
};