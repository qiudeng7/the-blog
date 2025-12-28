<template>
  <div class="software-development-wrapper" ref="wrapperRef">
    <D3CoordinateSvg ref="coordinateRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import D3CoordinateSvg from '../components/coordinate/D3CoordinateSvg.vue'

const router = useRouter()
const wrapperRef = ref<HTMLElement | null>(null)

function handleNavigateToTechnology(event: CustomEvent) {
  const { technology } = event.detail

  // 添加转场动画类
  if (wrapperRef.value) {
    wrapperRef.value.classList.add('zoom-out-transition')
  }

  // 延迟导航，等待动画完成
  setTimeout(() => {
    router.push({
      name: 'TechnologyDetail',
      params: { title: technology.title }
    })
  }, 400)
}

onMounted(() => {
  window.addEventListener('navigate-to-technology', handleNavigateToTechnology as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('navigate-to-technology', handleNavigateToTechnology as EventListener)
})
</script>

<style scoped>
.software-development-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
}

/* 放大淡出转场动画 */
.zoom-out-transition {
  animation: zoomOutFade 0.4s cubic-bezier(0.6, 0.04, 0.98, 0.335) forwards;
}

@keyframes zoomOutFade {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
</style>
