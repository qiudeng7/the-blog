<template>
  <nav class="glass-nav">
    <RouterLink to="/" class="nav-item" active-class="active">
      <span class="nav-icon">🏠</span>
      <span class="nav-text">首页</span>
    </RouterLink>
    <RouterLink to="/development" class="nav-item" active-class="active">
      <span class="nav-icon">📊</span>
      <span class="nav-text">软件开发坐标系</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
// Component for liquid glass navigation bar
</script>

<style scoped>
.glass-nav {
  position: fixed;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  background: transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.nav-item.active {
  background: var(--color-accent);
  box-shadow: 0 4px 12px var(--theme-accent-glow);
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-text {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
