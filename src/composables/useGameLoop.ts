// src/composables/useGameLoop.ts
import { ref, onUnmounted } from 'vue';

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