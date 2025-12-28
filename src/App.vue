<template>
  <div class="app-container">
    <main class="main-content">
      <RouterView />
    </main>
    <NavigationBar />
  </div>
</template>

<script setup lang="ts">
import NavigationBar from './components/NavigationBar.vue'
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 80px;
}
</style>
