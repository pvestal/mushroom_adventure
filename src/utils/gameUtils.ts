// src/utils/gameUtils.ts
// Utility functions for the game

/**
 * Clamps a value between a minimum and maximum
 * @param value The value to clamp
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generates a random integer between min (inclusive) and max (inclusive)
 * @param min The minimum value
 * @param max The maximum value
 * @returns A random integer
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a number as a score with leading zeros
 * @param score The score to format
 * @param length The desired length of the score string
 * @returns A formatted score string
 */
export function formatScore(score: number, length: number = 6): string {
  return score.toString().padStart(length, '0');
}

/**
 * Formats time in seconds as a MM:SS string
 * @param timeInSeconds The time in seconds
 * @returns A formatted time string
 */
export function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Preloads images to prevent flickering during game
 * @param imageUrls Array of image URLs to preload
 * @returns A promise that resolves when all images are loaded
 */
export function preloadImages(imageUrls: string[]): Promise<void> {
  const promises = imageUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  });
  
  return Promise.all(promises).then(() => {});
}

/**
 * Creates a simple particle effect
 * @param ctx The canvas rendering context
 * @param x The x position
 * @param y The y position
 * @param color The particle color
 * @param count The number of particles
 */
export function createParticleEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  count: number = 10
): void {
  for (let i = 0; i < count; i++) {
    const particle = {
      x,
      y,
      radius: randomInt(2, 5),
      color,
      vx: randomInt(-5, 5),
      vy: randomInt(-5, 0),
      gravity: 0.1,
      alpha: 1,
      life: randomInt(20, 40)
    };
    
    const update = () => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.alpha -= 1 / particle.life;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(color)}, ${particle.alpha})`;
      ctx.fill();
      
      if (particle.alpha > 0) {
        requestAnimationFrame(update);
      }
    };
    
    update();
  }
}

/**
 * Converts a hex color to RGB
 * @param hex The hex color string
 * @returns The RGB values as a string
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Simple HTML5 Audio wrapper for sound effects
 */
export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  
  /**
   * Loads a sound effect
   * @param key The key to reference the sound
   * @param url The URL of the sound file
   */
  loadSound(key: string, url: string): void {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(key, audio);
  }
  
  /**
   * Plays a sound effect
   * @param key The key of the sound to play
   * @param volume Optional volume (0.0 to 1.0)
   */
  playSound(key: string, volume: number = 1.0): void {
    if (this.muted) return;
    
    const sound = this.sounds.get(key);
    if (sound) {
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(err => console.error('Error playing sound:', err));
    }
  }
  
  /**
   * Sets the mute state
   * @param muted Whether sounds should be muted
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
  }
  
  /**
   * Toggles the mute state
   * @returns The new mute state
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }
}