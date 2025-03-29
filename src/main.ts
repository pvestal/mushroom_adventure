// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Initialize the global window.keyboard object
window.keyboard = {};

// Create the app
const app = createApp(App);

// Add Pinia store
const pinia = createPinia();
app.use(pinia);

// Mount the app
app.mount('#app');