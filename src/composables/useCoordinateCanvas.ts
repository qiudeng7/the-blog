/**
 * Canvas 坐标系可视化逻辑
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import type { Technology } from '../types/content'
import { developmentStages } from '../data/development-lifecycle'

export interface CanvasPoint {
  x: number
  y: number
  technology: Technology
  radius: number
}

export interface StageSegment {
  x: number
  y: number
  width: number
  height: number
  stage: typeof developmentStages[0]
}

export function useCoordinateCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  technologies: Ref<Technology[]>
) {
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const hoveredPoint = ref<CanvasPoint | null>(null)
  const hoveredStage = ref<StageSegment | null>(null)
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)

  // 布局配置
  const padding = { top: 60, right: 40, bottom: 80, left: 60 }
  const pointRadius = 8
  const yAxisMax = 5

  // 计算掌握程度的颜色
  function getMasteryColor(mastery: number): string {
    // 从浅色 (#f1f5f9) 到深色 (#334155)
    const colors = [
      { r: 241, g: 245, b: 249 }, // 0.0
      { r: 203, g: 213, b: 225 }, // 0.25
      { r: 148, g: 163, b: 184 }, // 0.5
      { r: 100, g: 116, b: 139 }, // 0.75
      { r: 51, g: 80, b: 85 }     // 1.0
    ]

    const index = mastery * (colors.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const ratio = index - lower

    const c1 = colors[Math.min(lower, colors.length - 1)]
    const c2 = colors[Math.min(upper, colors.length - 1)]

    const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio)

    return `rgb(${r}, ${g}, ${b})`
  }

  // 坐标转换
  function getXPosition(stageOrder: number): number {
    const contentWidth = canvasWidth.value - padding.left - padding.right
    const step = contentWidth / developmentStages.length
    return padding.left + step * (stageOrder - 0.5)
  }

  function getYPosition(depth: number): number {
    const contentHeight = canvasHeight.value - padding.top - padding.bottom
    return padding.top + contentHeight - (depth / yAxisMax) * contentHeight
  }

  // 绘制坐标轴和网格
  function drawAxes(): void {
    if (!ctx.value) return

    const context = ctx.value
    const contentWidth = canvasWidth.value - padding.left - padding.right
    const contentHeight = canvasHeight.value - padding.top - padding.bottom

    // 清空画布
    context.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

    // 绘制 Y 轴网格线和标签
    context.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    context.lineWidth = 1
    context.font = '12px system-ui'
    context.fillStyle = '#94a3b8'
    context.textAlign = 'right'
    context.textBaseline = 'middle'

    for (let i = 1; i <= yAxisMax; i++) {
      const y = getYPosition(i)

      // 网格线
      context.beginPath()
      context.moveTo(padding.left, y)
      context.lineTo(padding.left + contentWidth, y)
      context.stroke()

      // Y 轴标签
      context.fillText(i.toString(), padding.left - 10, y)
    }

    // 绘制 Y 轴标题
    context.save()
    context.translate(15, canvasHeight.value / 2)
    context.rotate(-Math.PI / 2)
    context.textAlign = 'center'
    context.font = '14px system-ui'
    context.fillText('抽象深度', 0, 0)
    context.restore()

    // 绘制 X 轴阶段线段
    const step = contentWidth / developmentStages.length

    developmentStages.forEach((stage, index) => {
      const x = padding.left + step * index
      const segmentWidth = step * 0.8
      const segmentX = x + step * 0.1

      // 阶段线段
      context.strokeStyle = hoveredStage.value?.stage.id === stage.id
        ? '#3b82f6'
        : 'rgba(59, 130, 246, 0.4)'
      context.lineWidth = 3
      context.beginPath()
      context.moveTo(segmentX, padding.top + contentHeight + 10)
      context.lineTo(segmentX + segmentWidth, padding.top + contentHeight + 10)
      context.stroke()

      // 阶段标签
      context.save()
      context.translate(segmentX + segmentWidth / 2, padding.top + contentHeight + 35)
      context.rotate(-Math.PI / 6)
      context.textAlign = 'right'
      context.font = '11px system-ui'
      context.fillStyle = hoveredStage.value?.stage.id === stage.id
        ? '#3b82f6'
        : '#94a3b8'
      context.fillText(stage.name, 0, 0)
      context.restore()
    })
  }

  // 绘制技术点
  function drawPoints(): void {
    if (!ctx.value) return

    const context = ctx.value

    technologies.value.forEach(tech => {
      const stage = developmentStages.find(s => s.id === tech.x_axis)
      if (!stage) return

      const x = getXPosition(stage.order)
      const y = getYPosition(tech.y_axis)

      // 绘制点
      const isHovered = hoveredPoint.value?.technology.title === tech.title
      const radius = isHovered ? pointRadius * 1.5 : pointRadius

      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = getMasteryColor(tech.mastery)
      context.fill()

      // 悬停时的高亮边框
      if (isHovered) {
        context.strokeStyle = '#3b82f6'
        context.lineWidth = 2
        context.stroke()
      }
    })
  }

  // 主绘制函数
  function draw(): void {
    drawAxes()
    drawPoints()
  }

  // 检测鼠标悬停的技术点
  function checkPointHover(mouseX: number, mouseY: number): CanvasPoint | null {
    for (const tech of technologies.value) {
      const stage = developmentStages.find(s => s.id === tech.x_axis)
      if (!stage) continue

      const x = getXPosition(stage.order)
      const y = getYPosition(tech.y_axis)
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)

      if (distance <= pointRadius + 2) {
        return { x, y, technology: tech, radius: pointRadius }
      }
    }
    return null
  }

  // 检测鼠标悬停的阶段
  function checkStageHover(mouseX: number, mouseY: number): StageSegment | null {
    const contentHeight = canvasHeight.value - padding.top - padding.bottom
    const step = (canvasWidth.value - padding.left - padding.right) / developmentStages.length

    // 检查是否在 X 轴区域
    if (mouseY >= padding.top + contentHeight && mouseY <= padding.top + contentHeight + 40) {
      for (let i = 0; i < developmentStages.length; i++) {
        const x = padding.left + step * i
        const segmentX = x + step * 0.1
        const segmentWidth = step * 0.8

        if (mouseX >= segmentX && mouseX <= segmentX + segmentWidth) {
          return {
            x: segmentX,
            y: padding.top + contentHeight + 10,
            width: segmentWidth,
            height: 30,
            stage: developmentStages[i]
          }
        }
      }
    }
    return null
  }

  // 鼠标移动处理
  function handleMouseMove(event: MouseEvent): void {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return

    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const point = checkPointHover(mouseX, mouseY)
    const stage = point ? null : checkStageHover(mouseX, mouseY)

    if (point !== hoveredPoint.value || stage !== hoveredStage.value) {
      hoveredPoint.value = point
      hoveredStage.value = stage
      draw()
    }
  }

  // 调整大小
  function handleResize(): void {
    if (!canvasRef.value) return

    const container = canvasRef.value.parentElement
    if (!container) return

    canvasWidth.value = container.clientWidth
    canvasHeight.value = Math.max(500, container.clientHeight)

    canvasRef.value.width = canvasWidth.value
    canvasRef.value.height = canvasHeight.value

    draw()
  }

  // 初始化
  onMounted(() => {
    if (!canvasRef.value) return

    ctx.value = canvasRef.value.getContext('2d')
    if (!ctx.value) return

    handleResize()
    window.addEventListener('resize', handleResize)
    canvasRef.value.addEventListener('mousemove', handleMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (canvasRef.value) {
      canvasRef.value.removeEventListener('mousemove', handleMouseMove)
    }
  })

  return {
    hoveredPoint,
    hoveredStage,
    handleResize,
    draw
  }
}
