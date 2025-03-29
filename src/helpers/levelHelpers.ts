// src/helpers/levelHelpers.ts
import { 
  Level, 
  TileType, 
  GameObject, 
  GameObjectType 
} from '../types';
import { useGameStore } from '../stores';

/**
 * Converts a level's tile map to game objects
 * @param level The level data to convert
 */
export function convertLevelToGameObjects(level: Level) {
  const gameStore = useGameStore();
  const tileSize = level.tileSize;
  
  // Find player start position
  let playerX = 0;
  let playerY = 0;
  
  // Process each tile in the level
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const tileType = level.tiles[y][x];
      const posX = x * tileSize;
      const posY = y * tileSize;
      
      // Skip empty tiles
      if (tileType === TileType.EMPTY) continue;
      
      // Remember player start position
      if (tileType === TileType.START) {
        playerX = posX;
        playerY = posY;
        continue; // Don't create a tile for the start position
      }
      
      // Create game objects based on tile type
      switch (tileType) {
        case TileType.GROUND:
        case TileType.BRICK:
        case TileType.QUESTION_BLOCK:
        case TileType.PIPE_TOP:
        case TileType.PIPE_BODY:
          createTile(gameStore, tileType, posX, posY, tileSize);
          break;
          
        case TileType.COIN:
          createCollectible(gameStore, 'coin', posX, posY, tileSize, 100);
          break;
          
        case TileType.MUSHROOM:
          createCollectible(gameStore, 'mushroom', posX, posY, tileSize, 200);
          break;
          
        case TileType.ENEMY:
          createEnemy(gameStore, 'basic', posX, posY, tileSize);
          break;
          
        case TileType.END:
          createLevelEnd(gameStore, posX, posY, tileSize);
          break;
      }
    }
  }
  
  // Create the player at the start position
  createPlayer(gameStore, playerX, playerY, tileSize);
}

/**
 * Create a tile game object
 */
function createTile(
  gameStore: any, 
  tileType: TileType, 
  x: number, 
  y: number, 
  size: number
) {
  const tile: GameObject = {
    id: `tile_${x}_${y}`,
    x,
    y,
    width: size,
    height: size,
    type: GameObjectType.TILE,
    tileType,
    visible: true,
    
    update(deltaTime: number) {
      // Tiles are static, no update needed
    },
    
    render(ctx: CanvasRenderingContext2D) {
      // Draw based on tile type
      switch (tileType) {
        case TileType.GROUND:
          ctx.fillStyle = '#8B4513'; // Brown
          ctx.fillRect(this.x, this.y, this.width, this.height);
          break;
          
        case TileType.BRICK:
          ctx.fillStyle = '#D2691E'; // Chocolate
          ctx.fillRect(this.x, this.y, this.width, this.height);
          // Draw brick pattern
          ctx.strokeStyle = '#8B4513';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y + this.height / 2);
          ctx.lineTo(this.x + this.width, this.y + this.height / 2);
          ctx.moveTo(this.x + this.width / 2, this.y);
          ctx.lineTo(this.x + this.width / 2, this.y + this.height);
          ctx.stroke();
          break;
          
        case TileType.QUESTION_BLOCK:
          ctx.fillStyle = '#FFD700'; // Gold
          ctx.fillRect(this.x, this.y, this.width, this.height);
          ctx.fillStyle = '#000000';
          ctx.font = `${this.width / 2}px Arial`;
          ctx.fillText('?', this.x + this.width / 3, this.y + this.height / 1.5);
          break;
          
        case TileType.PIPE_TOP:
        case TileType.PIPE_BODY:
          ctx.fillStyle = '#00AA00'; // Green
          ctx.fillRect(this.x, this.y, this.width, this.height);
          break;
      }
    }
  };
  
  gameStore.addGameObject(tile);
}

/**
 * Create a collectible game object
 */
function createCollectible(
  gameStore: any, 
  collectibleType: string, 
  x: number, 
  y: number, 
  size: number,
  points: number
) {
  const collectible: GameObject = {
    id: `collectible_${x}_${y}`,
    x,
    y,
    width: size,
    height: size,
    type: GameObjectType.COLLECTIBLE,
    collectibleType,
    points,
    visible: true,
    
    update(deltaTime: number) {
      // Check for collision with player
      const players = gameStore.getObjectsByType(GameObjectType.PLAYER);
      if (players.length > 0 && this.visible) {
        const player = players[0];
        if (checkCollision(this, player)) {
          // Fixed: Add null check before calling collect
          if (this.collect) {
            this.collect();
          }
        }
      }
    },
    
    render(ctx: CanvasRenderingContext2D) {
      if (!this.visible) return;
      
      if (collectibleType === 'coin') {
        // Draw a coin
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2, 
          this.y + this.height / 2, 
          this.width / 3, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      } else if (collectibleType === 'mushroom') {
        // Draw a power-up mushroom (simplified)
        ctx.fillStyle = '#D80000'; // Red cap
        ctx.fillRect(this.x, this.y, this.width, this.height/2);
        ctx.fillStyle = '#FFFFFF'; // White stem
        ctx.fillRect(this.x, this.y + this.height/2, this.width, this.height/2);
      }
    },
    
    collect() {
      this.visible = false;
      gameStore.addScore(points);
      
      // If it's a power-up, apply effects to the player
      if (collectibleType === 'mushroom') {
        const players = gameStore.getObjectsByType(GameObjectType.PLAYER);
        if (players.length > 0) {
          // For example, give extra life
          gameStore.lives += 1;
        }
      }
    }
  };
  
  gameStore.addGameObject(collectible);
}

/**
 * Create an enemy game object
 */
function createEnemy(
  gameStore: any, 
  enemyType: string, 
  x: number, 
  y: number, 
  size: number
) {
  const enemy: GameObject = {
    id: `enemy_${x}_${y}`,
    x,
    y,
    width: size,
    height: size,
    type: GameObjectType.ENEMY,
    enemyType,
    speed: 50, // pixels per second
    direction: -1, // -1 for left, 1 for right
    visible: true,
    
    update(deltaTime: number) {
      // Move enemy
      this.x += (this.speed || 0) * (this.direction || -1) * deltaTime;
      
      // Check for collision with tiles
      const tiles = gameStore.getObjectsByType(GameObjectType.TILE);
      let isOnGround = false;
      
      for (const tile of tiles) {
        if (checkCollision(this, tile)) {
          // Change direction if hitting a tile from the side
          this.direction = (this.direction || -1) * -1;
          break;
        }
        
        // Check if there's ground below
        const bottomY = this.y + this.height;
        if (
          tile.y === bottomY && 
          this.x + this.width > tile.x && 
          this.x < tile.x + tile.width
        ) {
          isOnGround = true;
        }
      }
      
      // Change direction if about to walk off edge
      if (!isOnGround) {
        this.direction = (this.direction || -1) * -1;
      }
      
      // Check for collision with player
      const players = gameStore.getObjectsByType(GameObjectType.PLAYER);
      if (players.length > 0 && this.visible) {
        const player = players[0];
        if (checkCollision(this, player)) {
          // Check if player is jumping on enemy from above
          if (
            player.velocity && player.velocity.y > 0 && 
            player.y + player.height < this.y + this.height / 2
          ) {
            // Player defeated enemy
            this.visible = false;
            if (player.velocity) player.velocity.y = -200; // Bounce
            gameStore.addScore(150);
          } else {
            // Player hit by enemy
            gameStore.loseLife();
            
            // Find start position (usually at beginning of level)
            const startTiles = gameStore.gameObjects.filter(
              (obj: GameObject) => obj.type === GameObjectType.TILE && obj.tileType === TileType.START
            );
            
            if (startTiles.length > 0) {
              // Respawn player at start position
              player.x = startTiles[0].x;
              player.y = startTiles[0].y - player.height;
              if (player.velocity) {
                player.velocity.x = 0;
                player.velocity.y = 0;
              }
            }
          }
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
      ctx.beginPath();
      const eyeOffset = (this.direction || -1) === -1 ? this.width / 3 : this.width * 2/3;
      ctx.arc(
        this.x + eyeOffset, 
        this.y + this.height / 3, 
        this.width / 8, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    }
  };
  
  gameStore.addGameObject(enemy);
}

/**
 * Create the player game object
 */
function createPlayer(
  gameStore: any, 
  x: number, 
  y: number, 
  size: number
) {
  const player: GameObject = {
    id: 'player',
    x,
    y,
    width: size,
    height: size,
    type: GameObjectType.PLAYER,
    speed: 200,
    jumpPower: 400,
    velocity: { x: 0, y: 0 },
    isJumping: false,
    visible: true,
    
    update(deltaTime: number) {
      // Apply gravity
      this.velocity!.y += 1000 * deltaTime;
      
      // Update position
      this.x += this.velocity!.x * deltaTime;
      this.y += this.velocity!.y * deltaTime;
      
      // Check for collision with tiles
      const tiles = gameStore.getObjectsByType(GameObjectType.TILE);
      let isOnGround = false;
      
      for (const tile of tiles) {
        if (checkCollision(this, tile)) {
          // Collision from top (landing)
          if (this.velocity!.y > 0 && this.y + this.height > tile.y && this.y < tile.y) {
            this.y = tile.y - this.height;
            this.velocity!.y = 0;
            this.isJumping = false;
            isOnGround = true;
          }
          // Collision from bottom (hitting ceiling)
          else if (this.velocity!.y < 0 && this.y < tile.y + tile.height && this.y + this.height > tile.y + tile.height) {
            this.y = tile.y + tile.height;
            this.velocity!.y = 0;
          }
          // Collision from left (hitting wall)
          else if (this.velocity!.x > 0 && this.x + this.width > tile.x && this.x < tile.x) {
            this.x = tile.x - this.width;
            this.velocity!.x = 0;
          }
          // Collision from right (hitting wall)
          else if (this.velocity!.x < 0 && this.x < tile.x + tile.width && this.x + this.width > tile.x + tile.width) {
            this.x = tile.x + tile.width;
            this.velocity!.x = 0;
          }
        }
      }
      
      // Handle keyboard input
      if (window.keyboard.ArrowLeft) {
        this.velocity!.x = -this.speed!;
      } else if (window.keyboard.ArrowRight) {
        this.velocity!.x = this.speed!;
      } else {
        this.velocity!.x = 0;
      }
      
      if (window.keyboard.Space && !this.isJumping && isOnGround) {
        this.velocity!.y = -this.jumpPower!;
        this.isJumping = true;
      }
      
      // Check if player reached the end of the level
      const levelEnds = gameStore.getObjectsByType(GameObjectType.LEVEL_END);
      for (const levelEnd of levelEnds) {
        if (checkCollision(this, levelEnd)) {
          // Level completed!
          alert("Level completed! Going to next level...");
          // This would normally call the level store to go to the next level
          // but for simplicity we'll just reset the current level
          gameStore.score += 1000; // Bonus points for completing level
          
          // Reset player position
          this.x = x;
          this.y = y;
          this.velocity!.x = 0;
          this.velocity!.y = 0;
        }
      }
      
      // Check if player fell off the level
      const levelHeight = size * 15; // Assuming a maximum level height
      if (this.y > levelHeight) {
        gameStore.loseLife();
        
        // Respawn player at start position
        this.x = x;
        this.y = y;
        this.velocity!.x = 0;
        this.velocity!.y = 0;
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
      ctx.arc(this.x + this.width * 3/4, this.y + this.height / 6, spotRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // White stem
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(
        this.x + this.width / 4, 
        this.y + this.height / 3, 
        this.width / 2, 
        this.height * 2/3
      );
      
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 3, this.y + this.height / 2, spotRadius / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + this.width * 2/3, this.y + this.height / 2, spotRadius / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    
    moveLeft(deltaTime: number) {
      this.velocity!.x = -this.speed!;
    },
    
    moveRight(deltaTime: number) {
      this.velocity!.x = this.speed!;
    },
    
    stopMoving() {
      this.velocity!.x = 0;
    },
    
    jump() {
      if (!this.isJumping) {
        this.isJumping = true;
        this.velocity!.y = -this.jumpPower!;
      }
    }
  };
  
  gameStore.addGameObject(player);
}

/**
 * Create a level end game object
 */
function createLevelEnd(
  gameStore: any,
  x: number,
  y: number,
  size: number
) {
  const levelEnd: GameObject = {
    id: 'level_end',
    x,
    y,
    width: size,
    height: size * 2,
    type: GameObjectType.LEVEL_END,
    visible: true,
    
    update(deltaTime: number) {
      // Level end is static, no update needed
    },
    
    render(ctx: CanvasRenderingContext2D) {
      // Draw a flagpole
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(this.x + this.width / 2 - 5, this.y, 10, this.height);
      
      // Draw a flag
      ctx.fillStyle = '#D80000'; // Red
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height / 4);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.fill();
    }
  };
  
  gameStore.addGameObject(levelEnd);
}

/**
 * Check if two objects are colliding
 */
export function checkCollision(obj1: GameObject, obj2: GameObject): boolean {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}