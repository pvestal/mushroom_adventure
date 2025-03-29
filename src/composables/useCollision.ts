// src/composables/useCollision.ts
import { GameObject } from '../types/GameObject';

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