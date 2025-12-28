<template>
  <div class="d3-coordinate-container">
    <!-- 缩放比例显示 -->
    <div class="zoom-indicator">
      缩放: {{ (currentZoom * 100).toFixed(0) }}%
    </div>

    <svg
      ref="svgRef"
      class="coordinate-svg"
      @mousemove="handleMouseMove"
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
const hoveredStage = ref(null)
const hoveredTechnology = ref<Technology | null>(null)
const currentZoom = ref(1)

// 检测是否为开发模式
const isDevMode = computed(() => import.meta.env.DEV)

const { hoveredPoint, hoveredStage: d3HoveredStage, zoom: zoomValue } = useD3Coordinate(
  svgRef,
  technologies,
  currentZoom
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
  tooltipRef.value?.position(event)
}
</script>

<style scoped>
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
}

.zoom-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: #ffffff;
  padding: 10px 15px;
  border-radius: 8px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
  pointer-events: none;
  z-index: 1000;
}

/* 禁用文本选择 */
.coordinate-svg {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
