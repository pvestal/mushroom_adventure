<template>
  <div class="app-container">
    <header class="game-header">
      <h1>Mushroom Adventure</h1>
    </header>
    
    <main>
      <GameCanvas :width="800" :height="600" />
    </main>
  </div>
</template>

<script setup lang="ts">
import GameCanvas from './components/GameCanvas.vue';

// No Firebase dependency in this simplified version
</script>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.game-header {
  text-align: center;
  margin-bottom: 30px;
}

.game-header h1 {
  color: #D80000;
  text-shadow: 3px 3px 0 #000;
  font-size: 40px;
}
</style>