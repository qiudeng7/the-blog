<template>
  <div class="d3-coordinate-container">
    <!-- 缩放比例显示 -->
    <div
      class="zoom-indicator"
      :class="{ visible: isZoomIndicatorVisible, editing: isEditing }"
      @click="handleZoomIndicatorClick"
    >
      <template v-if="!isEditing">
        <svg class="zoom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
        <span class="zoom-text">缩放: {{ (currentZoom * 100).toFixed(0) }}%</span>
      </template>
      <template v-else>
        <input
          ref="zoomInputRef"
          type="number"
          class="zoom-input"
          :value="(currentZoom * 100).toFixed(0)"
          @click.stop
          @keydown.enter="applyZoomValue"
          @keydown.esc="cancelZoomEdit"
          @blur="cancelZoomEdit"
          min="10"
          max="500"
        />
        <span class="zoom-unit">%</span>
      </template>
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
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useD3Coordinate } from '../../composables/useD3Coordinate'
import { loadTechnologies } from '../../utils/contentLoader'
import type { Technology } from '../../types/content'
import StageTooltip from './StageTooltip.vue'
import DebugPanel from './DebugPanel.vue'
import * as d3 from 'd3'

const svgRef = ref<SVGSVGElement | null>(null)
const tooltipRef = ref<InstanceType<typeof StageTooltip> | null>(null)
const zoomInputRef = ref<HTMLInputElement | null>(null)

const technologies = ref<Technology[]>([])
const hoveredStage = ref(null)
const hoveredTechnology = ref<Technology | null>(null)
const currentZoom = ref(1)

// 缩放指示器状态
const isZoomIndicatorVisible = ref(false)
const isEditing = ref(false)
let hideTimeout: number | null = null

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

// 监听缩放变化，显示指示器
watch(currentZoom, (newZoom, oldZoom) => {
  if (newZoom !== oldZoom) {
    showZoomIndicator()
  }
})

// 显示缩放指示器
function showZoomIndicator() {
  isZoomIndicatorVisible.value = true

  // 清除之前的定时器
  if (hideTimeout !== null) {
    clearTimeout(hideTimeout)
  }

  // 3秒后隐藏
  hideTimeout = window.setTimeout(() => {
    if (!isEditing.value) {
      isZoomIndicatorVisible.value = false
    }
  }, 3000)
}

// 处理缩放指示器点击
function handleZoomIndicatorClick() {
  if (!isEditing.value) {
    isEditing.value = true
    isZoomIndicatorVisible.value = true

    // 清除隐藏定时器
    if (hideTimeout !== null) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }

    // 聚焦输入框
    nextTick(() => {
      zoomInputRef.value?.focus()
      zoomInputRef.value?.select()
    })
  }
}

// 应用缩放值
function applyZoomValue() {
  if (zoomInputRef.value) {
    const value = parseFloat(zoomInputRef.value.value)
    if (!isNaN(value) && value >= 10 && value <= 500) {
      const newScale = value / 100
      currentZoom.value = newScale  // 立即更新缩放值
      applyZoom(newScale)
    }
  }
  isEditing.value = false
  showZoomIndicator()
}

// 取消缩放编辑
function cancelZoomEdit() {
  isEditing.value = false
  showZoomIndicator()
}

// 应用缩放到 D3
function applyZoom(scale: number) {
  if (!svgRef.value) return

  const currentTransform = d3.zoomTransform(svgRef.value)
  const newTransform = d3.zoomIdentity
    .translate(currentTransform.x, currentTransform.y)
    .scale(scale)

  const zoom = d3.zoom<SVGSVGElement, unknown>()
  d3.select(svgRef.value)
    .transition()
    .duration(300)
    .call(zoom.transform, newTransform)
}

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
  z-index: 1000;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  user-select: none;
}

.zoom-indicator.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.zoom-indicator.editing {
  cursor: default;
  pointer-events: auto;
}

.zoom-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  flex-shrink: 0;
}

.zoom-text {
  white-space: nowrap;
}

.zoom-input {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  padding: 4px 8px;
  width: 70px;
  text-align: right;
  outline: none;
  user-select: text;
}

.zoom-input:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.zoom-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 2px;
}

/* 禁用文本选择 */
.coordinate-svg {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
