// src/composables/useControls.ts
import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Composable for managing keyboard controls
 */
export function useControls() {
  const keys = ref<Record<string, boolean>>({});
  
  const handleKeyDown = (e: KeyboardEvent) => {
    keys.value[e.code] = true;
    
    // Also update window.keyboard for compatibility
    if (window.keyboard) {
      window.keyboard[e.code] = true;
    }
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
    keys.value[e.code] = false;
    
    // Also update window.keyboard for compatibility
    if (window.keyboard) {
      window.keyboard[e.code] = false;
    }
  };
  
  onMounted(() => {
    // Initialize window.keyboard if it doesn't exist
    if (!window.keyboard) {
      window.keyboard = {};
    }
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
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