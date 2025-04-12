// src/services/spriteService.ts

interface SpriteMap {
    [key: string]: HTMLImageElement;
  }
  
  export class SpriteService {
    private sprites: SpriteMap = {};
    private loaded: boolean = false;
    private loadPromise: Promise<void> | null = null;
    
    // List of all sprites to load
    private spriteList = [
      { key: 'player_idle', src: require('@/assets/sprites/player/idle.png') },
      { key: 'player_run', src: require('@/assets/sprites/player/run.png') },
      { key: 'player_jump', src: require('@/assets/sprites/player/jump.png') },
      { key: 'enemy_basic', src: require('@/assets/sprites/enemies/basic_enemy.png') },
      { key: 'tile_ground', src: require('@/assets/sprites/tiles/ground.png') },
      { key: 'tile_brick', src: require('@/assets/sprites/tiles/brick.png') },
      { key: 'tile_question', src: require('@/assets/sprites/tiles/question_block.png') },
      { key: 'collectible_coin', src: require('@/assets/sprites/collectibles/coin.png') },
      { key: 'collectible_mushroom', src: require('@/assets/sprites/collectibles/mushroom.png') },
      { key: 'bg_sky', src: require('@/assets/sprites/backgrounds/sky.png') },
      { key: 'bg_mountains', src: require('@/assets/sprites/backgrounds/mountains.png') },
    ];
    
    // Load all sprites
    public loadAllSprites(): Promise<void> {
      if (this.loadPromise) return this.loadPromise;
      
      this.loadPromise = new Promise((resolve, reject) => {
        let loadedCount = 0;
        const totalCount = this.spriteList.length;
        
        this.spriteList.forEach(spriteInfo => {
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            if (loadedCount === totalCount) {
              this.loaded = true;
              resolve();
            }
          };
          img.onerror = (err) => {
            console.error(`Failed to load sprite: ${spriteInfo.key}`, err);
            reject(new Error(`Failed to load sprite: ${spriteInfo.key}`));
          };
          img.src = spriteInfo.src;
          this.sprites[spriteInfo.key] = img;
        });
      });
      
      return this.loadPromise;
    }
    
    // Get a specific sprite
    public getSprite(key: string): HTMLImageElement | null {
      return this.sprites[key] || null;
    }
    
    // Check if all sprites are loaded
    public isLoaded(): boolean {
      return this.loaded;
    }
  }
  
  // Create a singleton instance
  export const spriteService = new SpriteService();