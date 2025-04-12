<template>
  <div class="game-container">
    <!-- Start Menu -->
    <div v-if="gameState === 'menu'" class="menu">
      <h2>Mushroom Adventure</h2>
      <p>Use arrow keys to move and space to jump</p>
      <button @click="startGame" class="menu-button">Start Game</button>
    </div>

    <!-- Game Over Screen -->
    <div v-if="gameState === 'gameOver'" class="menu game-over">
      <h2>Game Over</h2>
      <p>Your score: {{ score }}</p>
      <button @click="backToMenu" class="menu-button">Back to Menu</button>
    </div>

    <!-- Game Canvas -->
    <canvas v-show="gameState === 'playing'" ref="canvasRef" :width="width" :height="height"
      class="game-canvas"></canvas>

    <!-- Game Controls (only visible during gameplay) -->
    <div v-if="gameState === 'playing'" class="game-controls">
      <div class="controls-info">
        <p>Arrow keys to move</p>
        <p>Space to jump</p>
      </div>
      <button @click="pauseGame" class="pause-button">{{ isPaused ? 'Resume' : 'Pause' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { spriteService } from '../services/spriteService';

// Props
const props = defineProps<{
  width: number;
  height: number;
}>();

// Canvas references
const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

// Game state
const gameState = ref<'menu' | 'playing' | 'gameOver'>('menu');
const isPaused = ref(false);
const gameObjects = ref<Array<Record<string, any>>>([]);
const score = ref(0);
const lives = ref(3);
const level = ref(1);
const timeElapsed = ref(0);
const isPlayerPoweredUp = ref(false);
let animationFrameId: number | null = null;

// Start the game
const startGame = async () => {
  // Reset game state
  gameObjects.value = [];
  score.value = 0;
  lives.value = 3;
  level.value = 1;
  timeElapsed.value = 0;
  isPlayerPoweredUp.value = false;

  // Change to playing state
  gameState.value = 'playing';
  isPaused.value = false;

  // Wait for the canvas to be visible in the DOM
  await nextTick();

  // Initialize the game when canvas is ready
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d');
    console.log('Canvas context initialized:', !!ctx.value);

    initGame();
    lastTime = 0;
    // Start the game loop
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
  } else {
    console.error('Canvas reference not found');
  }
};

// Back to menu
const backToMenu = () => {
  gameState.value = 'menu';
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// Handle game over
const handleGameOver = () => {
  gameState.value = 'gameOver';
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// Pause the game
const pauseGame = () => {
  isPaused.value = !isPaused.value;
};

// Add points to the score
const addScore = (points: number) => {
  score.value += points;
};

// Initialize keyboard controls
onMounted(() => {
  window.keyboard = window.keyboard || {};

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Load all sprites before starting the game
  spriteService.loadAllSprites()
    .then(() => {
      console.log('All sprites loaded successfully');
    })
    .catch((err) => {
      console.error('Failed to load sprites:', err);
    });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

// Keyboard event handlers
const handleKeyDown = (e: KeyboardEvent) => {
  window.keyboard[e.code] = true;

  // Pause/resume on Escape key
  if (e.code === 'Escape' && gameState.value === 'playing') {
    pauseGame();
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  window.keyboard[e.code] = false;
};

// Time tracking for game loop
let lastTime = 0;

// Game loop
const gameLoop = (timestamp: number) => {
  if (gameState.value !== 'playing') return;

  const deltaTime = lastTime ? (timestamp - lastTime) / 1000 : 0;
  lastTime = timestamp;

  if (!isPaused.value) {
    // Update game state
    updateGame(deltaTime);

    // Check for game over condition
    if (lives.value === 0) {
      handleGameOver();
      return;
    }
  }

  // Render the game
  renderGame();

  // Continue the loop
  animationFrameId = requestAnimationFrame(gameLoop);
};

// Initialize the game
const initGame = () => {
  if (!ctx.value) {
    console.error('Cannot initialize game: canvas context is null');
    return;
  }

  console.log('Initializing game objects');

  // Create a player
  const player = {
    id: 'player',
    x: 100,
    y: props.height - 100,
    width: 32,
    height: 32,
    type: 'PLAYER',
    velocity: { x: 0, y: 0 },
    speed: 200,
    jumpPower: 400,
    isJumping: false,
    visible: true,

    update(deltaTime: number) {
      // Apply gravity
      this.velocity.y += 1000 * deltaTime;

      // Move based on keyboard input
      if (window.keyboard.ArrowLeft) {
        this.velocity.x = -this.speed;
      } else if (window.keyboard.ArrowRight) {
        this.velocity.x = this.speed;
      } else {
        this.velocity.x = 0;
      }

      // Jump
      if (window.keyboard.Space && !this.isJumping) {
        this.velocity.y = -this.jumpPower;
        this.isJumping = true;
      }

      // Update position
      this.x += this.velocity.x * deltaTime;
      this.y += this.velocity.y * deltaTime;

      // Keep player within bounds
      if (this.x < 0) this.x = 0;
      if (this.x + this.width > props.width) this.x = props.width - this.width;

      // Floor collision
      if (this.y + this.height > props.height - 32) {
        this.y = props.height - 32 - this.height;
        this.velocity.y = 0;
        this.isJumping = false;
      }

      // Check platform collisions
      for (const obj of gameObjects.value) {
        if (obj.type === 'TILE' && obj.id !== 'ground' && checkCollision(this, obj)) {
          // Only handle collision when player is falling onto platform from above
          if (this.velocity.y > 0 && this.y + this.height < obj.y + obj.height / 2) {
            this.y = obj.y - this.height;
            this.velocity.y = 0;
            this.isJumping = false;
          }
        }
      }
    },

    render(ctx: CanvasRenderingContext2D) {
      // Draw a mushroom character

      // Red cap
      ctx.fillStyle = '#D80000';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 4, this.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // White spots
      ctx.fillStyle = '#FFFFFF';
      const spotRadius = this.width / 8;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 4, this.y + this.height / 6, spotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + this.width * 3 / 4, this.y + this.height / 6, spotRadius, 0, Math.PI * 2);
      ctx.fill();

      // White stem
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(
        this.x + this.width / 4,
        this.y + this.height / 3,
        this.width / 2,
        this.height * 2 / 3
      );

      // Eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 3, this.y + this.height / 2, spotRadius / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + this.width * 2 / 3, this.y + this.height / 2, spotRadius / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Add player to game objects
  gameObjects.value.push(player);

  // Add ground
  const ground = {
    id: 'ground',
    x: 0,
    y: props.height - 32,
    width: props.width,
    height: 32,
    type: 'TILE',
    visible: true,

    update() {
      // Ground doesn't need updating
    },

    render(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = '#8B4513'; // Brown
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  };

  // Add ground to game objects
  gameObjects.value.push(ground);

  // Add platforms
  const platforms = [
    { id: 'platform1', x: 200, y: props.height - 120, width: 100, height: 20 },
    { id: 'platform2', x: 350, y: props.height - 180, width: 120, height: 20 },
    { id: 'platform3', x: 550, y: props.height - 150, width: 80, height: 20 },
    { id: 'platform4', x: 650, y: props.height - 250, width: 100, height: 20 }
  ];

  platforms.forEach((platform) => {
    gameObjects.value.push({
      ...platform,
      type: 'TILE',
      visible: true,
      update() {
        // Platforms don't need updating
      },
      render(ctx: CanvasRenderingContext2D) {
        // Draw platform with gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#D2691E'); // Top color - chocolate
        gradient.addColorStop(1, '#8B4513'); // Bottom color - brown

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw platform top edge
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(this.x, this.y, this.width, 4);
      }
    });
  });

  // Add enemies
  const enemies = [
    {
      id: 'enemy1',
      x: 300,
      y: props.height - 64,
      width: 32,
      height: 32,
      direction: -1,
      moveRange: { min: 250, max: 400 }
    },
    {
      id: 'enemy2',
      x: 500,
      y: props.height - 64,
      width: 32,
      height: 32,
      direction: 1,
      moveRange: { min: 450, max: 600 }
    },
    {
      id: 'enemy3',
      x: 650,
      y: props.height - 282,
      width: 32,
      height: 32,
      direction: 1,
      moveRange: { min: 650, max: 720 }
    }
  ];

  enemies.forEach((enemy) => {
    gameObjects.value.push({
      ...enemy,
      type: 'ENEMY',
      visible: true,
      speed: 80,
      velocity: { x: enemy.direction * 80, y: 0 },
      update(deltaTime: number) {
        // Move enemy back and forth
        this.x += this.velocity.x * deltaTime;

        // Change direction when reaching bounds
        if (this.x <= this.moveRange.min) {
          this.x = this.moveRange.min;
          this.velocity.x = Math.abs(this.velocity.x);
          this.direction = 1;
        } else if (this.x >= this.moveRange.max) {
          this.x = this.moveRange.max;
          this.velocity.x = -Math.abs(this.velocity.x);
          this.direction = -1;
        }

        // Check collision with player
        const player = gameObjects.value.find(obj => obj.type === 'PLAYER');
        if (player && checkCollision(this, player)) {
          // If player is falling on enemy from above
          if (player.velocity.y > 0 && player.y + player.height < this.y + this.height / 2) {
            // Player bounces off enemy
            player.velocity.y = -player.jumpPower * 0.5;

            // Remove enemy
            this.visible = false;

            // Add score
            addScore(150);
          } else {
            // Player loses a life and gets knocked back
            lives.value--;
            player.velocity.x = (player.x < this.x) ? -200 : 200;
            player.velocity.y = -200;
          }
        }
      },
      render(ctx: CanvasRenderingContext2D) {
        // Draw enemy (simple goomba-style)

        // Brown body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFFFFF';
        const eyeRadius = this.width / 8;

        // Position eyes based on direction
        const eyeOffsetX = this.direction * (this.width / 8);

        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - this.width / 6 + eyeOffsetX, this.y + this.height / 3, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + this.width / 6 + eyeOffsetX, this.y + this.height / 3, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - this.width / 6 + eyeOffsetX + (eyeOffsetX / 2), this.y + this.height / 3, eyeRadius / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + this.width / 6 + eyeOffsetX + (eyeOffsetX / 2), this.y + this.height / 3, eyeRadius / 2, 0, Math.PI * 2);
        ctx.fill();

        // Mouth - frown
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.arc(this.x + this.width / 2, this.y + this.height * 0.65, this.width / 4, Math.PI * 0.2, Math.PI * 0.8, false);
        ctx.stroke();

        // Feet
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(this.x + this.width / 6, this.y + this.height - this.height / 6, this.width / 4, this.height / 6);
        ctx.fillRect(this.x + this.width * 7 / 12, this.y + this.height - this.height / 6, this.width / 4, this.height / 6);
      }
    });
  });

  console.log('Game objects initialized:', gameObjects.value.length);
};

// Update game logic
const updateGame = (deltaTime: number) => {
  // Update all game objects
  for (const obj of gameObjects.value) {
    if (obj.visible) {
      obj.update(deltaTime);
    }
  }

  // Update time
  timeElapsed.value += deltaTime;
};

// Render the game
const renderGame = () => {
  if (!ctx.value) {
    console.error('Cannot render game: canvas context is null');
    return;
  }

  // Clear the canvas
  ctx.value.clearRect(0, 0, props.width, props.height);

  // Draw the background
  ctx.value.fillStyle = '#87CEEB'; // Sky blue
  ctx.value.fillRect(0, 0, props.width, props.height);

    // Draw all game objects
    for (const obj of gameObjects.value) {
    if (obj.visible) {
      if (obj.spriteKey) {
        renderSprite(ctx.value, obj);
      } else {
        // Fall back to original rendering if no sprite is available
        obj.render(ctx.value);
      }
    }
  }


  // Draw HUD (score, lives, etc.)
  renderHUD(ctx.value);

  // Draw pause screen if game is paused
  if (isPaused.value) {
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
  ctx.fillText(`Score: ${score.value.toString().padStart(6, '0')}`, 20, 30);

  // Draw lives
  ctx.fillText(`Lives: ${lives.value}`, 20, 60);

  // Draw level
  ctx.fillText(`Level: ${level.value}`, 20, 90);

  // Draw time
  const timeInSeconds = Math.floor(timeElapsed.value);
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  ctx.fillText(
    `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    props.width - 120,
    30
  );
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

// Render multi-layer backgrounds (uncomment to use)
/* function renderBackground(ctx: CanvasRenderingContext2D) {
  // Draw sky background
  const skySprite = spriteService.getSprite('bg_sky');
  if (skySprite) {
    ctx.drawImage(skySprite, 0, 0, props.width, props.height);
  } else {
    // Fallback to solid color
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, props.width, props.height);
  }
  
  // Draw distant mountains (parallax effect)
  const mountainsSprite = spriteService.getSprite('bg_mountains');
  if (mountainsSprite) {
    // Calculate parallax offset based on player position
    const player = gameObjects.value.find(obj => obj.type === 'PLAYER');
    const parallaxOffset = player ? player.x * 0.2 : 0;
    
    // Draw the mountains with parallax scrolling
    ctx.drawImage(
      mountainsSprite, 
      -parallaxOffset % props.width, props.height * 0.3, 
      props.width, props.height * 0.4
    );
    
    // Draw a second copy for seamless scrolling
    ctx.drawImage(
      mountainsSprite, 
      -parallaxOffset % props.width + props.width, props.height * 0.3, 
      props.width, props.height * 0.4
    );
  }
} */

// Render sprites
const renderSprite = (ctx: CanvasRenderingContext2D, obj: Record<string, any>) => {
  if (!obj.spriteKey) return;
  
  const sprite = spriteService.getSprite(obj.spriteKey);
  if (!sprite) return;
  
  // If sprite has animation frames
  if (obj.spriteFrameCount && obj.spriteFrameCount > 1) {
    // Calculate current frame based on animation time
    const frameWidth = obj.spriteFrameWidth || obj.width;
    const frameHeight = obj.spriteFrameHeight || obj.height;
    
    // Update animation time
    obj.spriteAnimationTime = (obj.spriteAnimationTime || 0) + 
      (obj.spriteAnimationSpeed || 10) / 60;
    
    // Calculate current frame
    const currentFrame = Math.floor(obj.spriteAnimationTime) % 
      obj.spriteFrameCount;
    
    // Draw the current frame
    ctx.drawImage(
      sprite,
      currentFrame * frameWidth, 0,  // Source x, y
      frameWidth, frameHeight,       // Source width, height
      obj.x, obj.y,                  // Destination x, y
      obj.width, obj.height          // Destination width, height
    );
  } else {
    // Draw the entire sprite (no animation)
    ctx.drawImage(sprite, obj.x, obj.y, obj.width, obj.height);
  }
};

// Check if two objects are colliding
const checkCollision = (obj1: Record<string, any>, obj2: Record<string, any>): boolean => {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
};
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  position: relative;
}

.game-canvas {
  border: 4px solid #333;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  background-color: #87CEEB;
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
}

.pause-button:hover {
  background-color: #FF0000;
}

/* Menu Styles */
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  height: 400px;
  background-color: rgba(0, 0, 0, 0.8);
  border: 4px solid #D80000;
  color: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}

.menu h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #D80000;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.menu p {
  margin-bottom: 30px;
  font-size: 18px;
}

.menu-button {
  background-color: #D80000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.menu-button:hover {
  background-color: #FF0000;
  transform: scale(1.05);
}

/* Game Over specific styles */
.game-over {
  background-color: rgba(0, 0, 0, 0.9);
}

.game-over h2 {
  color: #FF0000;
}
</style>