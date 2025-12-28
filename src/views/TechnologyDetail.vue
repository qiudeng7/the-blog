<template>
  <div class="technology-detail-container" ref="containerRef">
    <!-- 返回按钮 -->
    <button class="back-button" @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>返回</span>
    </button>

    <!-- D3 居中坐标系 -->
    <D3CenteredCoordinate :technology="technology" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import D3CenteredCoordinate from '../components/coordinate/D3CenteredCoordinate.vue'
import { getTechnologyById } from '../utils/contentLoader'
import type { Technology } from '../types/content'

const router = useRouter()
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

function goBack() {
  // 添加淡出动画（倒放进入动画）
  if (containerRef.value) {
    containerRef.value.classList.remove('zoom-in-enter')
    containerRef.value.classList.add('zoom-in-exit')
  }

  // 延迟导航，等待动画完成
  setTimeout(() => {
    router.push({ name: 'SoftwareDevelopment' })
  }, 400)
}

onUnmounted(() => {
  // 清理动画类
  if (containerRef.value) {
    containerRef.value.classList.remove('zoom-in-enter', 'zoom-in-exit')
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

/* 淡入转场动画 */
.zoom-in-enter {
  animation: fadeIn 0.4s cubic-bezier(0.6, 0.04, 0.98, 0.335) forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* 缩小淡出转场动画 */
.zoom-in-exit {
  animation: zoomOutFade 0.4s cubic-bezier(0.6, 0.04, 0.98, 0.335) forwards;
}

@keyframes zoomOutFade {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.3);
    opacity: 0;
  }
}

/* 返回按钮样式 */
.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(26, 38, 37, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg, 1.5rem);
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all var(--transition-base, 250ms ease);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.back-button svg {
  width: 20px;
  height: 20px;
}
</style>
