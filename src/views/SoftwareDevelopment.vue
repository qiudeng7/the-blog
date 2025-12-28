<template>
  <div class="software-development">
    <canvas
      ref="canvasRef"
      class="coordinate-canvas"
      @mousemove="handleCanvasMouseMove"
    />

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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
}

.coordinate-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
