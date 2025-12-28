<template>
  <div class="d3-coordinate-container">
    <svg
      ref="svgRef"
      class="coordinate-svg"
      @mousemove="handleMouseMove"
      @contextmenu.prevent
    />

    <StageTooltip
      ref="tooltipRef"
      :stage="hoveredStage"
      :technology="hoveredTechnology"
    />

    <DebugPanel v-if="isDevMode" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useD3Coordinate } from '../../composables/useD3Coordinate'
import { loadTechnologies } from '../../utils/contentLoader'
import type { Technology } from '../../types/content'
import StageTooltip from './StageTooltip.vue'
import DebugPanel from './DebugPanel.vue'

const svgRef = ref<SVGSVGElement | null>(null)
const tooltipRef = ref<InstanceType<typeof StageTooltip> | null>(null)

const technologies = ref<Technology[]>([])
const hoveredStage = ref<typeof import('../../data/development-lifecycle').developmentStages[0] | null>(null)
const hoveredTechnology = ref<Technology | null>(null)

// 检测是否为开发模式
const isDevMode = computed(() => import.meta.env.DEV)

const { hoveredPoint, hoveredStage: d3HoveredStage, parallaxX, parallaxY } = useD3Coordinate(
  svgRef,
  technologies
)

onMounted(async () => {
  // 加载技术数据
  technologies.value = await loadTechnologies()
})

// 监听 D3 composable 的悬停状态变化
watch([hoveredPoint, d3HoveredStage], () => {
  hoveredTechnology.value = hoveredPoint.value?.technology || null
  hoveredStage.value = d3HoveredStage.value?.stage || null
})

// 处理鼠标移动，更新 tooltip 位置
function handleMouseMove(event: MouseEvent) {
  // 需要考虑视差偏移
  // 内容移动了，tooltip 也要跟着移动
  const adjustedEvent = {
    clientX: event.clientX - parallaxX.value,
    clientY: event.clientY - parallaxY.value
  }
  tooltipRef.value?.position(adjustedEvent as MouseEvent)
}
</script>

<style>
.d3-coordinate-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  background-color: #000000;
}

.coordinate-svg {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 节点光晕呼吸动画 */
@keyframes breathe-glow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: var(--glow-max-opacity, 0.8);
  }
}

/* 为节点应用动画 */
.point-glow {
  animation: breathe-glow var(--glow-duration, 4s) ease-in-out var(--glow-delay, 0s) infinite;
  will-change: opacity;
}
</style>
