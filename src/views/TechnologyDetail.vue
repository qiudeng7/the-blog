<template>
  <div class="technology-detail-container" ref="containerRef">
    <!-- D3 居中坐标系 -->
    <D3CenteredCoordinate :technology="technology" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import D3CenteredCoordinate from '../components/coordinate/D3CenteredCoordinate.vue'
import { getTechnologyById } from '../utils/contentLoader'
import type { Technology } from '../types/content'

const route = useRoute()
const technology = ref<Technology | null>(null)
const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const title = route.params.title as string
  technology.value = await getTechnologyById(title)

  // 添加淡入动画
  if (containerRef.value) {
    containerRef.value.classList.add('zoom-in-enter')
  }
})
</script>

<style scoped>
.technology-detail-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  /* 深空背景渐变 */
  --bg-color-1: #1a2a28;
  --bg-color-2: #15221f;
  --bg-color-3: #0f1a1e;
  --bg-color-4: #0b1215;
  --bg-color-5: #070a0c;
  --glow-color-1: rgba(36, 107, 100, 0.08);
  --glow-color-2: rgba(36, 107, 100, 0.04);

  background: radial-gradient(circle at 50% 50%,
    var(--bg-color-1) 0%,
    var(--bg-color-2) 25%,
    var(--bg-color-3) 50%,
    var(--bg-color-4) 75%,
    var(--bg-color-5) 100%
  );
}

/* Glow overlay */
.technology-detail-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%,
    var(--glow-color-1) 0%,
    var(--glow-color-2) 40%,
    transparent 70%);
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: 0;
}

/* 缩小淡入转场动画 */
.zoom-in-enter {
  animation: zoomInFade 0.8s ease-out forwards;
}

@keyframes zoomInFade {
  0% {
    transform: scale(3);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
