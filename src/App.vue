<template>
  <div class="app-container">
    <header class="game-header">
      <h1>Mushroom Adventure</h1>
    </header>
    
    <main>
      <template v-if="gameState === 'menu'">
        <div class="menu-screen">
          <h2>Welcome to Mushroom Adventure!</h2>
          <div class="menu-buttons">
            <button @click="startGame" class="menu-button">Start Game</button>
            <button @click="showHighScores" class="menu-button">High Scores</button>
            <button @click="showInstructions" class="menu-button">How to Play</button>
          </div>
        </div>
      </template>
      
      <template v-else-if="gameState === 'playing'">
        <GameCanvas :width="800" :height="600" />
      </template>
      
      <template v-else-if="gameState === 'gameover'">
        <div class="gameover-screen">
          <h2>Game Over!</h2>
          <p>Your Score: {{ gameStore.score }}</p>
          <p>High Score: {{ gameStore.highScore }}</p>
          
          <div v-if="isNewHighScore" class="new-highscore">
            <p>New High Score!</p>
            <div class="save-score">
              <input v-model="playerName" placeholder="Enter your name" />
              <button @click="saveHighScore" :disabled="!playerName">Save</button>
            </div>
          </div>
          
          <div class="menu-buttons">
            <button @click="startGame" class="menu-button">Play Again</button>
            <button @click="returnToMenu" class="menu-button">Main Menu</button>
          </div>
        </div>
      </template>
      
      <template v-else-if="gameState === 'highscores'">
        <div class="highscores-screen">
          <h2>High Scores</h2>
          <div v-if="loading" class="loading">Loading...</div>
          <div v-else class="scores-list">
            <div v-for="(score, index) in highScores" :key="index" class="score-item">
              <span class="rank">{{ index + 1 }}</span>
              <span class="name">{{ score.name }}</span>
              <span class="score">{{ score.score }}</span>
            </div>
          </div>
          <button @click="returnToMenu" class="menu-button">Back to Menu</button>
        </div>
      </template>
      
      <template v-else-if="gameState === 'instructions'">
        <div class="instructions-screen">
          <h2>How to Play</h2>
          <div class="instructions">
            <p>Use the arrow keys to move left and right.</p>
            <p>Press the space bar to jump.</p>
            <p>Collect mushrooms to gain points.</p>
            <p>Avoid enemies or jump on them to defeat them.</p>
            <p>Reach the end of each level to progress.</p>
          </div>
          <button @click="returnToMenu" class="menu-button">Back to Menu</button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
import { useGameStore } from './stores';
import { fetchHighScores, saveScore } from './services/firebase';
import { HighScore } from './types';

// Game state management
const gameState = ref<'menu' | 'playing' | 'gameover' | 'highscores' | 'instructions'>('menu');
const gameStore = useGameStore();
const playerName = ref('');
const highScores = ref<HighScore[]>([]);
const loading = ref(false);

// Check if the player achieved a new high score
const isNewHighScore = computed(() => {
  return gameStore.score > 0 && (
    highScores.value.length < 10 || 
    gameStore.score > (highScores.value[highScores.value.length - 1]?.score || 0)
  );
});

// Start a new game
const startGame = () => {
  gameStore.startGame();
  gameState.value = 'playing';
};

// Return to the main menu
const returnToMenu = () => {
  gameState.value = 'menu';
};

// Show high scores screen
const showHighScores = async () => {
  gameState.value = 'highscores';
  await loadHighScores();
};

// Show instructions screen
const showInstructions = () => {
  gameState.value = 'instructions';
};

// Load high scores from Firebase
const loadHighScores = async () => {
  loading.value = true;
  try {
    highScores.value = await fetchHighScores();
  } catch (error) {
    console.error('Error loading high scores:', error);
  } finally {
    loading.value = false;
  }
};

// Save high score to Firebase
const saveHighScore = async () => {
  if (!playerName.value) return;
  
  try {
    await saveScore(playerName.value, gameStore.score);
    await loadHighScores();
  } catch (error) {
    console.error('Error saving high score:', error);
  }
};

// Watch for game over
watch(() => gameStore.isGameOver, (isOver) => {
  if (isOver) {
    gameState.value = 'gameover';
    loadHighScores();
  }
});

// Load high scores when component is mounted
onMounted(() => {
  loadHighScores();
});
</script>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Press Start 2P', cursive; /* Use a retro pixel font */
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

.menu-screen, .gameover-screen, .highscores-screen, .instructions-screen {
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
  border: 4px solid #D80000;
  border-radius: 10px;
  padding: 30px;
  color: white;
  max-width: 600px;
  margin: 0 auto;
}

.menu-buttons {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.menu-button {
  background-color: #D80000;
  color: white;
  border: none;
  padding: 12px 20px;
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-button:hover {
  transform: scale(1.05);
  background-color: #FF0000;
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
}

.rank {
  width: 30px;
  text-align: center;
}

.name {
  flex-grow: 1;
  text-align: left;
  padding-left: 10px;
}

.score {
  width: 100px;
  text-align: right;
}

.new-highscore {
  margin: 20px 0;
  padding: 10px;
  background-color: rgba(255, 215, 0, 0.3);
  border-radius: 5px;
}

.save-score {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.save-score input {
  padding: 8px;
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
}

.instructions {
  text-align: left;
  line-height: 1.6;
}
</style>