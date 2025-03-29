// src/composables/index.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { GameObject } from '../types';

/**
 * Composable for managing the game loop
 * @param updateFn Function to call every frame for game logic
 * @param renderFn Function to call every frame for rendering
 */
export function useGameLoop(
  updateFn: (deltaTime: number) => void,
  renderFn: () => void
) {
  const isRunning = ref(false);
  const lastTimestamp = ref(0);
  let animationFrameId: number;

  // The main game loop
  const gameLoop = (timestamp: number) => {
    if (!isRunning.value) return;
    
    // Calculate time elapsed since last frame
    const deltaTime = lastTimestamp.value ? (timestamp - lastTimestamp.value) / 1000 : 0;
    lastTimestamp.value = timestamp;
    
    // Update game state
    updateFn(deltaTime);
    
    // Render the game
    renderFn();
    
    // Queue the next frame
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  // Start the game loop
  const start = () => {
    if (isRunning.value) return;
    
    isRunning.value = true;
    lastTimestamp.value = 0;
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  // Stop the game loop
  const stop = () => {
    isRunning.value = false;
    cancelAnimationFrame(animationFrameId);
  };

  // Clean up when component unmounts
  onUnmounted(() => {
    stop();
  });

  return {
    isRunning,
    start,
    stop
  };
}

/**
 * Composable for managing keyboard controls
 */
export function useControls() {
  const keys = ref<Record<string, boolean>>({});
  
  const handleKeyDown = (e: KeyboardEvent) => {
    keys.value[e.code] = true;
    if (window.keyboard) {
      window.keyboard[e.code] = true;
    }
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
    keys.value[e.code] = false;
    if (window.keyboard) {
      window.keyboard[e.code] = false;
    }
  };
  
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Initialize the window.keyboard property
    window.keyboard = window.keyboard || {};
  });
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });
  
  // Check if a key is currently pressed
  const isKeyPressed = (code: string): boolean => {
    return !!keys.value[code];
  };
  
  return {
    keys,
    isKeyPressed
  };
}

/**
 * Composable for handling collisions between game objects
 */
export function useCollision() {
  /**
   * Check if two objects are colliding using AABB (Axis-Aligned Bounding Box)
   */
  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };
  
  /**
   * Find all objects that collide with the given object
   */
  const findCollisions = (obj: GameObject, others: GameObject[]): GameObject[] => {
    return others.filter(other => 
      other.id !== obj.id && 
      other.visible && 
      checkCollision(obj, other)
    );
  };
  
  return {
    checkCollision,
    findCollisions
  };
}