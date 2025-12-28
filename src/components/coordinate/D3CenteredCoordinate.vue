<template>
  <div class="centered-coordinate-container">
    <svg
      ref="svgRef"
      class="centered-svg"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import type { Technology } from '../../types/content'

interface Props {
  technology: Technology | null
}

const props = defineProps<Props>()

const svgRef = ref<SVGSVGElement | null>(null)

let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null

const svgWidth = ref(0)
const svgHeight = ref(0)

function handleResize() {
  if (!svgRef.value) return

  const container = svgRef.value.parentElement
  if (!container) return

  svgWidth.value = container.clientWidth
  svgHeight.value = container.clientHeight

  const svgEl = d3.select(svgRef.value)
  svgEl
    .attr('width', svgWidth.value)
    .attr('height', svgHeight.value)

  render()
}

function render() {
  if (!contentGroup || !props.technology) return

  // 清除现有内容
  contentGroup.selectAll('*').remove()

  const centerX = svgWidth.value / 2
  const centerY = svgHeight.value / 2

  // 绘制网格线（淡色）
  const gridSize = 50
  const gridExtentX = Math.ceil(centerX / gridSize) * gridSize + gridSize * 10
  const gridExtentY = Math.ceil(centerY / gridSize) * gridSize + gridSize * 10

  // 垂直网格线
  for (let x = -gridExtentX; x <= gridExtentX; x += gridSize) {
    contentGroup.append('line')
      .attr('class', 'grid-line')
      .attr('x1', centerX + x)
      .attr('y1', 0)
      .attr('x2', centerX + x)
      .attr('y2', svgHeight.value * 10)
      .attr('stroke', 'rgba(255, 255, 255, 0.08)')
      .attr('stroke-width', 1)
  }

  // 水平网格线
  for (let y = -gridExtentY; y <= gridExtentY; y += gridSize) {
    contentGroup.append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('y1', centerY + y)
      .attr('x2', svgWidth.value * 10)
      .attr('y2', centerY + y)
      .attr('stroke', 'rgba(255, 255, 255, 0.08)')
      .attr('stroke-width', 1)
  }

  // X轴（稍微显眼一点的灰白色）
  contentGroup.append('line')
    .attr('class', 'axis-x')
    .attr('x1', 0)
    .attr('y1', centerY)
    .attr('x2', svgWidth.value * 10)
    .attr('y2', centerY)
    .attr('stroke', 'rgba(255, 255, 255, 0.3)')
    .attr('stroke-width', 2)

  // Y轴（稍微显眼一点的灰白色）
  contentGroup.append('line')
    .attr('class', 'axis-y')
    .attr('x1', centerX)
    .attr('y1', 0)
    .attr('x2', centerX)
    .attr('y2', svgHeight.value * 10)
    .attr('stroke', 'rgba(255, 255, 255, 0.3)')
    .attr('stroke-width', 2)

  // 在中心绘制节点（保持原样）
  drawCenterNode(centerX, centerY)
}

function drawCenterNode(x: number, y: number) {
  if (!contentGroup || !props.technology) return

  const pointGroup = contentGroup.append('g')
    .attr('class', 'center-point')

  // 外圈光晕（呼吸动画）
  const glowRadius = 40
  pointGroup.append('circle')
    .attr('class', 'point-glow')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', glowRadius)
    .attr('fill', 'rgba(255, 255, 255, 0.05)')
    .style('--glow-max-opacity', '0.15')
    .style('--glow-duration', '4s')
    .style('--glow-delay', '0s')

  // 节点圆环（2:3比例）
  const outerRadius = 9
  const innerRadius = 6

  pointGroup.append('circle')
    .attr('class', 'point-outer')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', outerRadius)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(255, 255, 255, 0.9)')
    .attr('stroke-width', 2)

  pointGroup.append('circle')
    .attr('class', 'point-inner')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', innerRadius)
    .attr('fill', 'rgba(255, 255, 255, 0.15)')
    .attr('stroke', 'rgba(255, 255, 255, 0.6)')
    .attr('stroke-width', 1.5)
}

onMounted(() => {
  if (!svgRef.value) return

  svg = d3.select(svgRef.value)
  contentGroup = svg.append('g')

  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch(() => props.technology, () => {
  render()
})
</script>

<style>
.centered-coordinate-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
}

.centered-svg {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
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

.point-glow {
  animation: breathe-glow var(--glow-duration, 4s) ease-in-out var(--glow-delay, 0s) infinite;
  will-change: opacity;
}
</style>
