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
import { ref, onMounted, watch, computed } from 'vue';
import { GameObjectType } from '../types';
import { GameConfig } from '../config/gameConfig';

// Props
const props = defineProps<{
  width: number;
  height: number;
}>();

// Canvas references
const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

// Game state
const isPaused = ref(false);
const gameObjects = ref<any[]>([]);
const score = ref(0);
const lives = ref(3);
const level = ref(1);
const timeElapsed = ref(0);
const isPlayerPoweredUp = ref(false);

// Pause the game
const pauseGame = () => {
  isPaused.value = !isPaused.value;
};

// Add points to the score
const addScore = (points: number) => {
  score.value += points;
};

// Initialize canvas and context
onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d');
    
    // Initialize keyboard controls
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
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
  }
});

// Time tracking for game loop
let lastTime = 0;

// Game loop
const gameLoop = (timestamp: number) => {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  
  if (!isPaused.value) {
    // Update game state
    updateGame(deltaTime);
  }
  
  // Render the game
  renderGame();
  
  // Continue the loop
  requestAnimationFrame(gameLoop);
};

// Initialize the game
const initGame = () => {
  // Create a player
  const player = {
    id: 'player',
    x: 100,
    y: props.height - 100,
    width: 32,
    height: 32,
    type: GameObjectType.PLAYER,
    velocity: { x: 0, y: 0 },
    speed: 200,
    jumpPower: 400,
    isJumping: false,
    visible: true,
    poweredUp: false,
    
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
      
      // Check if player fell off the screen
      if (this.y > props.height) {
        lives.value--;
        if (lives.value <= 0) {
          // Game over logic would go here
          console.log("Game Over!");
        } else {
          // Respawn
          this.x = 100;
          this.y = props.height - 100;
          this.velocity.x = 0;
          this.velocity.y = 0;
        }
      }
    },
    
    render(ctx: CanvasRenderingContext2D) {
      // Draw a mushroom character
      
      // Adjust size if powered up
      const sizeMultiplier = isPlayerPoweredUp.value ? 1.5 : 1;
      const width = this.width * sizeMultiplier;
      const height = this.height * sizeMultiplier;
      
      // Red cap
      ctx.fillStyle = isPlayerPoweredUp.value ? '#FF6600' : '#D80000';
      ctx.beginPath();
      ctx.arc(this.x + width / 2, this.y + height / 4, width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // White spots
      ctx.fillStyle = '#FFFFFF';
      const spotRadius = width / 8;
      ctx.beginPath();
      ctx.arc(this.x + width / 4, this.y + height / 6, spotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + width * 3/4, this.y + height / 6, spotRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // White stem
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(
        this.x + width / 4, 
        this.y + height / 3, 
        width / 2, 
        height * 2/3
      );
      
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(this.x + width / 3, this.y + height / 2, spotRadius / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + width * 2/3, this.y + height / 2, spotRadius / 2, 0, Math.PI * 2);
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
    type: GameObjectType.TILE,
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
    { x: 200, y: props.height - 150, width: 100, height: 20 },
    { x: 350, y: props.height - 220, width: 150, height: 20 },
    { x: 100, y: props.height - 300, width: 80, height: 20 },
    { x: 500, y: props.height - 180, width: 120, height: 20 }
  ];
  
  platforms.forEach((platform, index) => {
    gameObjects.value.push({
      id: `platform_${index}`,
      ...platform,
      type: GameObjectType.TILE,
      visible: true,
      
      update() {
        // Platforms don't need updating
      },
      
      render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#D2691E'; // Chocolate
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    });
  });
  
  // Add coins
  const coinPositions = [
    { x: 220, y: props.height - 180 },
    { x: 260, y: props.height - 180 },
    { x: 400, y: props.height - 250 },
    { x: 450, y: props.height - 250 },
    { x: 120, y: props.height - 330 },
    { x: 550, y: props.height - 210 }
  ];
  
  coinPositions.forEach((position, index) => {
    gameObjects.value.push({
      id: `coin_${index}`,
      x: position.x,
      y: position.y,
      width: 20,
      height: 20,
      type: GameObjectType.COLLECTIBLE,
      collectibleType: 'coin',
      points: 100,
      visible: true,
      
      update() {
        // Check for collision with player
        const player = gameObjects.value.find(obj => obj.id === 'player');
        if (player && this.visible && checkCollision(this, player)) {
          this.visible = false;
          addScore(this.points);
        }
      },
      
      render(ctx: CanvasRenderingContext2D) {
        if (!this.visible) return;
        
        // Draw a coin
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2, 
          this.y + this.height / 2, 
          this.width / 2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        
        // Add shine
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2 - 3, 
          this.y + this.height / 2 - 3, 
          2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  });
  
  // Add power-up mushroom
  gameObjects.value.push({
    id: 'powerup_mushroom',
    x: 380,
    y: props.height - 270,
    width: 25,
    height: 25,
    type: GameObjectType.POWERUP,
    powerupType: 'mushroom',
    visible: true,
    
    update() {
      // Check for collision with player
      const player = gameObjects.value.find(obj => obj.id === 'player');
      if (player && this.visible && checkCollision(this, player)) {
        this.visible = false;
        isPlayerPoweredUp.value = true;
        addScore(500);
        setTimeout(() => {
          isPlayerPoweredUp.value = false;
        }, 10000); // Power up lasts for 10 seconds
      }
    },
    
    render(ctx: CanvasRenderingContext2D) {
      if (!this.visible) return;
      
      // Draw a power-up mushroom
      ctx.fillStyle = '#FF6600'; // Orange cap
      ctx.fillRect(this.x, this.y, this.width, this.height/2);
      ctx.fillStyle = '#FFFFFF'; // White stem
      ctx.fillRect(this.x, this.y + this.height/2, this.width, this.height/2);
      
      // Add spots
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 3, 
        this.y + this.height / 4, 
        2, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        this.x + this.width * 2/3, 
        this.y + this.height / 4, 
        2, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    }
  });
  
  // Add enemies
  const enemyPositions = [
    { x: 300, y: props.height - 64, direction: -1 },
    { x: 600, y: props.height - 64, direction: -1 },
    { x: 400, y: props.height - 250, direction: 1 }
  ];
  
  enemyPositions.forEach((position, index) => {
    gameObjects.value.push({
      id: `enemy_${index}`,
      x: position.x,
      y: position.y,
      width: 30,
      height: 30,
      type: GameObjectType.ENEMY,
      speed: 50, // pixels per second
      direction: position.direction, // -1 for left, 1 for right
      visible: true,
      
      update(deltaTime: number) {
        // Move enemy
        this.x += this.speed * this.direction * deltaTime;
        
        // Turn around at screen edges
        if (this.x <= 0 || this.x + this.width >= props.width) {
          this.direction *= -1;
        }
        
        // Check for collision with player
        const player = gameObjects.value.find(obj => obj.id === 'player');
        if (player && this.visible && checkCollision(this, player)) {
          // Check if player is landing on enemy from above
          if (player.velocity.y > 0 && player.y + player.height < this.y + this.height / 2) {
            // Player defeated enemy
            this.visible = false;
            player.velocity.y = -200; // Bounce
            addScore(150);
          } else if (!isPlayerPoweredUp.value) {
            // Player hit by enemy
            lives.value--;
            if (lives.value <= 0) {
              // Game over logic
              console.log("Game Over!");
            } else {
              // Reset player position
              player.x = 100;
              player.y = props.height - 100;
              player.velocity.x = 0;
              player.velocity.y = 0;
            }
          } else {
            // Powered up player defeats enemy regardless of angle
            this.visible = false;
            addScore(150);
            // Reduce power up effect to make it slightly more balanced
            setTimeout(() => {
              isPlayerPoweredUp.value = false;
            }, 1000);
          }
        }
      },
      
      render(ctx: CanvasRenderingContext2D) {
        if (!this.visible) return;
        
        // Draw a simple enemy (goomba-like)
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        const eyeOffset = this.direction === -1 ? this.width / 3 : this.width * 2/3;
        ctx.beginPath();
        ctx.arc(
          this.x + eyeOffset, 
          this.y + this.height / 3, 
          this.width / 8, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        
        // Add angry eyebrows
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 4, this.y + this.height / 4);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 3/4, this.y + this.height / 4);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 6);
        ctx.stroke();
      }
    });
  });
};

// Update game logic
const updateGame = (deltaTime: number) => {
  // Update all game objects
  for (const obj of gameObjects.value) {
    if (obj.visible) {
      obj.update(deltaTime);
    }
  }
  
  // Check collisions for player with platforms
  const player = gameObjects.value.find(obj => obj.id === 'player');
  if (player) {
    for (const obj of gameObjects.value) {
      if (obj.id !== 'player' && obj.type === GameObjectType.TILE) {
        // Simple AABB collision detection
        if (checkCollision(player, obj)) {
          // Collision from top (landing)
          if (player.velocity.y > 0 && player.y < obj.y) {
            player.y = obj.y - player.height;
            player.velocity.y = 0;
            player.isJumping = false;
          }
          // Collision from bottom (hitting ceiling)
          else if (player.velocity.y < 0 && player.y + player.height > obj.y + obj.height) {
            player.y = obj.y + obj.height;
            player.velocity.y = 0;
          }
          // Collision from left (hitting wall)
          else if (player.velocity.x > 0 && player.x < obj.x) {
            player.x = obj.x - player.width;
            player.velocity.x = 0;
          }
          // Collision from right (hitting wall)
          else if (player.velocity.x < 0 && player.x + player.width > obj.x + obj.width) {
            player.x = obj.x + obj.width;
            player.velocity.x = 0;
          }
        }
      }
    }
  }
  
  // Update time
  timeElapsed.value += deltaTime;
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
  for (const obj of gameObjects.value) {
    if (obj.visible) {
      obj.render(ctx.value);
    }
  }
  
  // Draw HUD (score, lives, etc.)
  renderHUD(ctx.value);
  
  // Draw power-up status if active
  if (isPlayerPoweredUp.value) {
    ctx.value.fillStyle = '#FF6600';
    ctx.value.font = '16px Arial';
    ctx.value.textAlign = 'center';
    ctx.value.fillText('POWERED UP!', props.width / 2, 30);
  }
  
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

// Check if two objects are colliding
const checkCollision = (obj1: any, obj2: any): boolean => {
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
}

.pause-button:hover {
  background-color: #FF0000;
}
</style>