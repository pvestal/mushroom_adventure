<template>
  <div class="game-container">
    <canvas 
      ref="canvasRef" 
      :width="width" 
      :height="height" 
      class="game-canvas"
    ></canvas>
    
    <div class="game-controls">
      <div class="controls-info">
        <p>Arrow keys to move</p>
        <p>Space to jump</p>
      </div>
      <button @click="pauseGame" class="pause-button">{{ isPaused ? 'Resume' : 'Pause' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-setup-props-destructure */
/* eslint-disable-next-line no-undef */
const props = defineProps<{
  width: number;
  height: number;
}>();

import { ref, onMounted, watch, computed } from 'vue';
import { useGameStore } from '../stores';
import { useGameLoop, useControls } from '../composables';
import { GameObjectType } from '../types';
import { GameConfig } from '../config/gameConfig';
import { convertLevelToGameObjects } from '../helpers/levelHelpers';
import { formatScore, formatTime } from '../utils/gameUtils';

// Canvas references
const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

// Game state
const gameStore = useGameStore();
const isPaused = computed(() => gameStore.isPaused);

// Initialize controls
const { keys } = useControls();

// Pause the game
const pauseGame = () => {
  if (gameStore.isPaused) {
    gameStore.resumeGame();
  } else {
    gameStore.pauseGame();
  }
};

// Initialize canvas and context
onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d');
    
    // Make sure keyboard controls are set up
    window.keyboard = window.keyboard || {};
    window.addEventListener('keydown', (e) => {
      window.keyboard[e.code] = true;
      
      // Pause/resume on Escape key
      if (e.code === 'Escape') {
        pauseGame();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      window.keyboard[e.code] = false;
    });
    
    // Initialize the game
    initGame();
  }
});

// Initialize the game
const initGame = () => {
  // Clear any existing game objects
  gameStore.gameObjects = [];
  
  // Create a basic level (a flat ground with platforms)
  createBasicLevel();
  
  // Start the game
  gameStore.startGame();
};

// Create a basic level with platforms
const createBasicLevel = () => {
  const tileSize = GameConfig.level.tileSize;
  const levelWidth = Math.floor(props.width / tileSize);
  const levelHeight = Math.floor(props.height / tileSize);
  
  // Create a simple level object
  const level = {
    id: 1,
    name: 'Level 1: First Steps',
    width: levelWidth,
    height: levelHeight,
    tileSize: tileSize,
    tiles: Array(levelHeight).fill(null).map(() => Array(levelWidth).fill(0)), // Initialize with empty tiles
    background: 'blue_sky',
    music: 'level1_music',
    timeLimit: GameConfig.level.timeLimit
  };
  
  // Fill the bottom row with ground tiles
  for (let x = 0; x < levelWidth; x++) {
    level.tiles[levelHeight - 1][x] = 1; // Ground tile
  }
  
  // Create some platforms
  // Platform 1
  for (let x = 5; x < 8; x++) {
    level.tiles[levelHeight - 4][x] = 2; // Brick tile
  }
  
  // Platform 2
  for (let x = 12; x < 16; x++) {
    level.tiles[levelHeight - 6][x] = 2; // Brick tile
  }
  
  // Add a question block
  level.tiles[levelHeight - 4][8] = 3; // Question block
  
  // Add coins
  level.tiles[levelHeight - 5][6] = 6; // Coin
  level.tiles[levelHeight - 5][7] = 6; // Coin
  level.tiles[levelHeight - 7][13] = 6; // Coin
  level.tiles[levelHeight - 7][14] = 6; // Coin
  
  // Add an enemy
  level.tiles[levelHeight - 2][15] = 8; // Enemy
  
  // Add a pipe
  level.tiles[levelHeight - 2][12] = 4; // Pipe top
  level.tiles[levelHeight - 2][13] = 4; // Pipe top
  level.tiles[levelHeight - 1][12] = 5; // Pipe body
  level.tiles[levelHeight - 1][13] = 5; // Pipe body
  
  // Add player start position
  level.tiles[levelHeight - 2][2] = 9; // Start
  
  // Add level end
  level.tiles[levelHeight - 2][levelWidth - 3] = 10; // End
  
  // Convert level data to game objects
  convertLevelToGameObjects(level);
};

// Update game logic
const updateGame = (deltaTime: number) => {
  // Don't update if paused
  if (gameStore.isPaused) return;
  
  // Update game state
  gameStore.updateGame(deltaTime);
};

// Render the game
const renderGame = () => {
  if (!ctx.value) return;
  
  // Clear the canvas
  ctx.value.clearRect(0, 0, props.width, props.height);
  
  // Draw the background
  ctx.value.fillStyle = GameConfig.visuals.backgroundColor;
  ctx.value.fillRect(0, 0, props.width, props.height);
  
  // Draw all game objects
  for (const obj of gameStore.gameObjects) {
    if (obj.visible) {
      obj.render(ctx.value);
    }
  }
  
  // Draw HUD (score, lives, etc.)
  renderHUD(ctx.value);
  
  // Draw pause screen if game is paused
  if (gameStore.isPaused) {
    renderPauseScreen(ctx.value);
  }
};

// Render the HUD (Heads-Up Display)
const renderHUD = (ctx: CanvasRenderingContext2D) => {
  // Set up text style
  ctx.fillStyle = '#000000';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  
  // Draw score
  ctx.fillText(`Score: ${formatScore(gameStore.score)}`, 20, 30);
  
  // Draw lives
  ctx.fillText(`Lives: ${gameStore.lives}`, 20, 60);
  
  // Draw level
  ctx.fillText(`Level: ${gameStore.level}`, 20, 90);
  
  // Draw time
  const timeRemaining = GameConfig.level.timeLimit - gameStore.timeElapsed;
  ctx.fillText(`Time: ${formatTime(Math.max(0, timeRemaining))}`, props.width - 120, 30);
};

// Render the pause screen
const renderPauseScreen = (ctx: CanvasRenderingContext2D) => {
  // Darken the screen
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, props.width, props.height);
  
  // Draw pause text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', props.width / 2, props.height / 2);
  
  // Draw instruction
  ctx.font = '16px Arial';
  ctx.fillText('Press ESC to resume', props.width / 2, props.height / 2 + 40);
};

// Initialize the game loop
const { isRunning, start, stop } = useGameLoop(updateGame, renderGame);

// Start the game loop when the component is mounted
onMounted(() => {
  start();
});

// Watch for game state changes
watch(() => gameStore.isRunning, (newValue) => {
  if (newValue) {
    start();
  } else {
    stop();
  }
});
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.game-canvas {
  border: 4px solid #333;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  background-color: #000;
  image-rendering: pixelated; /* For retro feel */
}

.game-controls {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin-top: 10px;
}

.controls-info {
  font-size: 14px;
  color: #555;
}

.controls-info p {
  margin: 5px 0;
}

.pause-button {
  background-color: #D80000;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Press Start 2P', Arial, sans-serif;
}

.pause-button:hover {
  background-color: #FF0000;
}
</style>