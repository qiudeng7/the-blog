/**
 * Canvas 无限画布 - 支持缩放和视差效果
 */

import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
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

  // 画布尺寸
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)

  // 变换状态
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)

  // 视差效果
  const parallaxX = ref(0)
  const parallaxY = ref(0)
  const targetParallaxX = ref(0)
  const targetParallaxY = ref(0)
  const parallaxStrength = 0.03  // 视差强度
  let animationFrameId: number | null = null

  // 初始化标志
  let isInitialized = false

  // 布局配置（世界坐标）
  const padding = { top: 100, right: 100, bottom: 150, left: 100 }
  const pointRadius = 12
  const yAxisMax = 5
  const stageStep = 200  // X 轴每个阶段的间距
  const depthStep = 150   // Y 轴每层的间距

  // 内容总尺寸
  const contentWidth = developmentStages.length * stageStep
  const contentHeight = yAxisMax * depthStep

  // 计算掌握程度的颜色
  function getMasteryColor(mastery: number): string {
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

    if (!c1 || !c2) {
      return `rgb(128, 128, 128)`
    }

    const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio)

    return `rgb(${r}, ${g}, ${b})`
  }

  // 屏幕坐标转世界坐标
  function screenToWorld(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - translateX.value - parallaxX.value) / scale.value,
      y: (y - translateY.value - parallaxY.value) / scale.value
    }
  }

  // 获取 X 轴位置（世界坐标）
  function getXPosition(stageOrder: number): number {
    return padding.left + stageStep * (stageOrder - 0.5)
  }

  // 获取 Y 轴位置（世界坐标）
  function getYPosition(depth: number): number {
    return padding.top + contentHeight - depth * depthStep
  }

  // 应用变换
  function applyTransform(): void {
    if (!ctx.value) return
    ctx.value.setTransform(
      scale.value,
      0,
      0,
      scale.value,
      translateX.value + parallaxX.value,
      translateY.value + parallaxY.value
    )
  }

  // 平滑视差动画
  function animateParallax(): void {
    const ease = 0.08  // 缓动系数

    parallaxX.value += (targetParallaxX.value - parallaxX.value) * ease
    parallaxY.value += (targetParallaxY.value - parallaxY.value) * ease

    draw()

    // 继续动画直到接近目标值
    if (
      Math.abs(targetParallaxX.value - parallaxX.value) > 0.1 ||
      Math.abs(targetParallaxY.value - parallaxY.value) > 0.1
    ) {
      animationFrameId = requestAnimationFrame(animateParallax)
    }
  }

  // 触发视差动画
  function triggerParallax(): void {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
    animationFrameId = requestAnimationFrame(animateParallax)
  }

  // 绘制坐标轴和网格
  function drawAxes(): void {
    if (!ctx.value) return
    const context = ctx.value

    // 保存当前状态
    context.save()

    // 绘制背景
    context.fillStyle = '#1e293b'
    context.fillRect(
      -10000,
      -10000,
      contentWidth + 20000,
      contentHeight + 20000
    )

    // 绘制 Y 轴网格线和标签
    context.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    context.lineWidth = 2 / scale.value
    context.font = `${16 / scale.value}px system-ui`
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
      context.fillText(i.toString(), padding.left - 20 / scale.value, y)
    }

    // 绘制 Y 轴标题
    context.save()
    context.translate(50, contentHeight / 2)
    context.rotate(-Math.PI / 2)
    context.textAlign = 'center'
    context.font = `${20 / scale.value}px system-ui`
    context.fillText('抽象深度', 0, 0)
    context.restore()

    // 绘制 X 轴阶段线段
    developmentStages.forEach((stage, index) => {
      const x = padding.left + stageStep * index
      const segmentWidth = stageStep * 0.7
      const segmentX = x + stageStep * 0.15

      // 阶段线段
      context.strokeStyle = hoveredStage.value?.stage.id === stage.id
        ? '#3b82f6'
        : 'rgba(59, 130, 246, 0.5)'
      context.lineWidth = (hoveredStage.value?.stage.id === stage.id ? 6 : 4) / scale.value
      context.beginPath()
      context.moveTo(segmentX, contentHeight + 20)
      context.lineTo(segmentX + segmentWidth, contentHeight + 20)
      context.stroke()

      // 阶段标签
      context.save()
      context.translate(segmentX + segmentWidth / 2, contentHeight + 60)
      context.rotate(-Math.PI / 6)
      context.textAlign = 'right'
      context.font = `${14 / scale.value}px system-ui`
      context.fillStyle = hoveredStage.value?.stage.id === stage.id
        ? '#3b82f6'
        : '#94a3b8'
      context.fillText(stage.name, 0, 0)
      context.restore()
    })

    context.restore()
  }

  // 绘制技术点
  function drawPoints(): void {
    if (!ctx.value) return
    const context = ctx.value

    context.save()

    technologies.value.forEach(tech => {
      const stage = developmentStages.find(s => s.id === tech.x_axis)
      if (!stage) return

      const x = getXPosition(stage.order)
      const y = getYPosition(tech.y_axis)

      // 绘制点
      const isHovered = hoveredPoint.value?.technology.title === tech.title
      const radius = isHovered ? pointRadius * 1.5 : pointRadius

      // 外发光效果
      if (isHovered) {
        const gradient = context.createRadialGradient(x, y, radius * 0.5, x, y, radius * 2)
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
        context.fillStyle = gradient
        context.beginPath()
        context.arc(x, y, radius * 2, 0, Math.PI * 2)
        context.fill()
      }

      // 主点
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = getMasteryColor(tech.mastery)
      context.fill()

      // 边框
      context.strokeStyle = isHovered ? '#3b82f6' : 'rgba(255, 255, 255, 0.3)'
      context.lineWidth = (isHovered ? 3 : 2) / scale.value
      context.stroke()
    })

    context.restore()
  }

  // 主绘制函数
  function draw(): void {
    if (!ctx.value) return

    // 清空画布
    ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

    // 重置变换
    ctx.value.setTransform(1, 0, 0, 1, 0, 0)

    // 应用变换
    applyTransform()

    // 绘制内容
    drawAxes()
    drawPoints()
  }

  // 检测鼠标悬停的技术点
  function checkPointHover(screenX: number, screenY: number): CanvasPoint | null {
    const world = screenToWorld(screenX, screenY)

    for (const tech of technologies.value) {
      const stage = developmentStages.find(s => s.id === tech.x_axis)
      if (!stage) continue

      const x = getXPosition(stage.order)
      const y = getYPosition(tech.y_axis)
      const distance = Math.sqrt((world.x - x) ** 2 + (world.y - y) ** 2)

      // 考虑缩放的点击区域
      const hitRadius = Math.max(pointRadius, 20 / scale.value)

      if (distance <= hitRadius) {
        return { x, y, technology: tech, radius: pointRadius }
      }
    }
    return null
  }

  // 检测鼠标悬停的阶段
  function checkStageHover(screenX: number, screenY: number): StageSegment | null {
    const world = screenToWorld(screenX, screenY)

    // 检查是否在 X 轴区域
    if (world.y >= contentHeight && world.y <= contentHeight + 100) {
      for (let i = 0; i < developmentStages.length; i++) {
        const x = padding.left + stageStep * i
        const segmentX = x + stageStep * 0.15
        const segmentWidth = stageStep * 0.7

        if (world.x >= segmentX && world.x <= segmentX + segmentWidth) {
          const stage = developmentStages[i]
          if (!stage) return null

          return {
            x: segmentX,
            y: contentHeight + 20,
            width: segmentWidth,
            height: 40,
            stage
          }
        }
      }
    }
    return null
  }

  // 鼠标移动（视差效果）
  function handleMouseMove(event: MouseEvent): void {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return

    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // 计算视差偏移（鼠标相对于画布中心的偏移）
    const centerX = canvasWidth.value / 2
    const centerY = canvasHeight.value / 2

    targetParallaxX.value = (centerX - mouseX) * parallaxStrength
    targetParallaxY.value = (centerY - mouseY) * parallaxStrength

    triggerParallax()

    // 检测悬停
    const point = checkPointHover(mouseX, mouseY)
    const stage = point ? null : checkStageHover(mouseX, mouseY)

    if (point !== hoveredPoint.value || stage !== hoveredStage.value) {
      hoveredPoint.value = point
      hoveredStage.value = stage

      if (canvasRef.value) {
        canvasRef.value.style.cursor = point || stage ? 'pointer' : 'default'
      }

      draw()
    }
  }

  // 鼠标离开
  function handleMouseLeave(): void {
    hoveredPoint.value = null
    hoveredStage.value = null

    // 重置视差
    targetParallaxX.value = 0
    targetParallaxY.value = 0
    triggerParallax()
  }

  // 滚轮缩放
  function handleWheel(event: WheelEvent): void {
    event.preventDefault()

    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return

    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // 计算缩放前的世界坐标
    const worldBefore = screenToWorld(mouseX, mouseY)

    // 更新缩放
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, scale.value * zoomFactor))

    if (newScale === scale.value) return

    scale.value = newScale

    // 调整平移，使鼠标位置保持不变
    const worldAfter = screenToWorld(mouseX, mouseY)
    translateX.value += (worldAfter.x - worldBefore.x) * scale.value
    translateY.value += (worldAfter.y - worldBefore.y) * scale.value

    draw()
  }

  // 调整大小
  function handleResize(): void {
    if (!canvasRef.value) return

    const container = canvasRef.value.parentElement
    if (!container) return

    const dpr = window.devicePixelRatio || 1

    // 设置显示尺寸
    canvasWidth.value = container.clientWidth
    canvasHeight.value = container.clientHeight

    canvasRef.value.style.width = canvasWidth.value + 'px'
    canvasRef.value.style.height = canvasHeight.value + 'px'

    // 设置实际像素尺寸（考虑 DPI）
    canvasRef.value.width = canvasWidth.value * dpr
    canvasRef.value.height = canvasHeight.value * dpr

    if (ctx.value) {
      ctx.value.scale(dpr, dpr)
    }

    // 初始化时将坐标系居中
    if (!isInitialized) {
      // 内容的中心点（世界坐标）
      const contentCenterX = padding.left + contentWidth / 2
      const contentCenterY = padding.top + contentHeight / 2

      // 画布的中心点（屏幕坐标）
      const screenCenterX = canvasWidth.value / 2
      const screenCenterY = canvasHeight.value / 2

      // 计算居中所需的偏移
      // 世界坐标转屏幕坐标：screenX = worldX * scale + translateX
      // 所以：translateX = screenCenterX - contentCenterX * scale
      translateX.value = screenCenterX - contentCenterX * scale.value
      translateY.value = screenCenterY - contentCenterY * scale.value

      isInitialized = true
    }

    draw()
  }

  // 初始化
  onMounted(() => {
    if (!canvasRef.value) return

    ctx.value = canvasRef.value.getContext('2d')
    if (!ctx.value) return

    handleResize()
    window.addEventListener('resize', handleResize)

    // 鼠标事件
    canvasRef.value.addEventListener('mousemove', handleMouseMove)
    canvasRef.value.addEventListener('mouseleave', handleMouseLeave)
    canvasRef.value.addEventListener('wheel', handleWheel, { passive: false })

    // 设置初始光标
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'default'
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (canvasRef.value) {
      canvasRef.value.removeEventListener('mousemove', handleMouseMove)
      canvasRef.value.removeEventListener('mouseleave', handleMouseLeave)
      canvasRef.value.removeEventListener('wheel', handleWheel)
    }
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
  })

  // 监听技术数据变化
  watch(technologies, () => {
    draw()
  })

  return {
    hoveredPoint,
    hoveredStage,
    handleResize,
    draw
  }
}
