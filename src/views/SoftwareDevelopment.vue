<template>
  <div class="software-development">
    <header class="page-header">
      <h1 class="page-title">软件开发知识坐标系</h1>
      <p class="page-subtitle">
        可视化软件开发生命周期与技术栈的掌握情况
      </p>
      <div class="legend">
        <div class="legend-item">
          <span class="legend-label">掌握程度:</span>
          <div class="legend-gradient">
            <span class="gradient-label">初学</span>
            <span class="gradient-label">精通</span>
          </div>
        </div>
        <div class="legend-item">
          <span class="legend-label">X 轴:</span>
          <span>开发生命周期阶段</span>
        </div>
        <div class="legend-item">
          <span class="legend-label">Y 轴:</span>
          <span>技术抽象深度 (1-5)</span>
        </div>
      </div>
    </header>

    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        class="coordinate-canvas"
        @mousemove="handleCanvasMouseMove"
      />
    </div>

    <StageTooltip
      ref="tooltipRef"
      :stage="hoveredStage"
      :technology="hoveredTechnology"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCoordinateCanvas } from '../composables/useCoordinateCanvas'
import { loadTechnologies } from '../utils/contentLoader'
import type { Technology } from '../types/content'
import StageTooltip from '../components/coordinate/StageTooltip.vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const tooltipRef = ref<InstanceType<typeof StageTooltip> | null>(null)

const technologies = ref<Technology[]>([])
const hoveredStage = ref(null)
const hoveredTechnology = ref<Technology | null>(null)

const { hoveredPoint, hoveredStage: canvasHoveredStage } = useCoordinateCanvas(
  canvasRef,
  technologies
)

onMounted(async () => {
  // 加载技术数据
  technologies.value = await loadTechnologies()
})

function handleCanvasMouseMove(event: MouseEvent) {
  // 更新 tooltip 位置
  tooltipRef.value?.position(event)

  // 更新悬停的技术
  hoveredTechnology.value = hoveredPoint.value?.technology || null
  hoveredStage.value = canvasHoveredStage.value?.stage || null
}
</script>

<style scoped>
.software-development {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-accent), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.legend-label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.legend-gradient {
  width: 120px;
  height: 12px;
  background: linear-gradient(to right, #f1f5f9, #cbd5e1, #94a3b8, #64748b, #334155);
  border-radius: var(--radius-sm);
  position: relative;
  display: flex;
  justify-content: space-between;
}

.gradient-label {
  font-size: 0.75rem;
  position: relative;
  top: 14px;
}

.canvas-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.coordinate-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .legend {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .canvas-container {
    height: 400px;
  }
}
</style>
