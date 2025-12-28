/**
 * D3.js 坐标系 - 支持缩放、平移和视差效果
 */

import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import * as d3 from 'd3'
import type { Technology } from '../types/content'
import { developmentStages } from '../data/development-lifecycle'

export interface D3Point {
  x: number
  y: number
  technology: Technology
  radius: number
}

export interface StageSegment {
  stage: typeof developmentStages[0]
}

export function useD3Coordinate(
  svgRef: Ref<SVGSVGElement | null>,
  technologies: Ref<Technology[]>
) {
  const hoveredPoint = ref<D3Point | null>(null)
  const hoveredStage = ref<StageSegment | null>(null)

  // SVG 尺寸
  const svgWidth = ref(0)
  const svgHeight = ref(0)

  // D3 缩放行为
  let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
  let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
  let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null

  // 视差效果
  const parallaxX = ref(0)
  const parallaxY = ref(0)
  const targetParallaxX = ref(0)
  const targetParallaxY = ref(0)
  const parallaxStrength = 0.03
  let animationFrameId: number | null = null

  // 布局配置
  const padding = { top: 100, right: 100, bottom: 150, left: 100 }
  const pointRadius = 12
  const yAxisMax = 5
  const stageStep = 200
  const depthStep = 150

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

    const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio)

    return `rgb(${r}, ${g}, ${b})`
  }

  // 获取 X 轴位置
  function getXPosition(stageOrder: number): number {
    return padding.left + stageStep * (stageOrder - 0.5)
  }

  // 获取 Y 轴位置
  function getYPosition(depth: number): number {
    return padding.top + contentHeight - depth * depthStep
  }

  // 平滑视差动画
  function animateParallax(): void {
    const ease = 0.08

    parallaxX.value += (targetParallaxX.value - parallaxX.value) * ease
    parallaxY.value += (targetParallaxY.value - parallaxY.value) * ease

    // 应用视差偏移到内容组
    if (contentGroup) {
      contentGroup.attr('transform', `translate(${parallaxX.value},${parallaxY.value})`)
    }

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

  // 绘制坐标轴
  function drawAxes(): void {
    if (!contentGroup) return

    // 背景
    contentGroup.append('rect')
      .attr('class', 'background')
      .attr('x', -10000)
      .attr('y', -10000)
      .attr('width', contentWidth + 20000)
      .attr('height', contentHeight + 20000)
      .attr('fill', '#1e293b')

    // Y 轴网格线和标签
    for (let i = 1; i <= yAxisMax; i++) {
      const y = getYPosition(i)

      // 网格线
      contentGroup.append('line')
        .attr('class', 'grid-line')
        .attr('x1', padding.left)
        .attr('y1', y)
        .attr('x2', padding.left + contentWidth)
        .attr('y2', y)
        .attr('stroke', 'rgba(148, 163, 184, 0.2)')
        .attr('stroke-width', 2)

      // Y 轴标签
      contentGroup.append('text')
        .attr('class', 'y-axis-label')
        .attr('x', padding.left - 20)
        .attr('y', y)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '16px')
        .text(i.toString())
    }

    // Y 轴标题
    contentGroup.append('text')
      .attr('class', 'y-axis-title')
      .attr('x', 50)
      .attr('y', contentHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '20px')
      .attr('transform', `rotate(-90, 50, ${contentHeight / 2})`)
      .text('抽象深度')

    // X 轴阶段线段
    const stageGroup = contentGroup.append('g').attr('class', 'x-axis-stages')

    developmentStages.forEach((stage, index) => {
      const x = padding.left + stageStep * index
      const segmentWidth = stageStep * 0.7
      const segmentX = x + stageStep * 0.15

      const stageG = stageGroup.append('g')
        .attr('class', `stage stage-${stage.id}`)
        .datum(stage)

      // 阶段线段
      stageG.append('line')
        .attr('class', 'stage-line')
        .attr('x1', segmentX)
        .attr('y1', contentHeight + 20)
        .attr('x2', segmentX + segmentWidth)
        .attr('y2', contentHeight + 20)
        .attr('stroke', 'rgba(59, 130, 246, 0.5)')
        .attr('stroke-width', 4)
        .attr('stroke-linecap', 'round')

      // 阶段标签
      stageG.append('text')
        .attr('class', 'stage-label')
        .attr('x', segmentX + segmentWidth / 2)
        .attr('y', contentHeight + 60)
        .attr('text-anchor', 'end')
        .attr('fill', '#94a3b8')
        .attr('font-size', '14px')
        .attr('transform', `rotate(-30, ${segmentX + segmentWidth / 2}, ${contentHeight + 60})`)
        .text(stage.name)
    })
  }

  // 绘制技术点
  function drawPoints(): void {
    if (!contentGroup) return

    const pointsGroup = contentGroup.append('g').attr('class', 'technology-points')

    technologies.value.forEach(tech => {
      const stage = developmentStages.find(s => s.id === tech.x_axis)
      if (!stage) return

      const x = getXPosition(stage.order)
      const y = getYPosition(tech.y_axis)

      const pointG = pointsGroup.append('g')
        .attr('class', `point point-${tech.title}`)
        .datum({ x, y, technology: tech, radius: pointRadius })

      // 外发光效果（默认隐藏）
      const glow = pointG.append('circle')
        .attr('class', 'point-glow')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', pointRadius * 2)
        .attr('fill', 'url(#glow-gradient)')
        .style('opacity', 0)

      // 主点
      pointG.append('circle')
        .attr('class', 'point-circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', pointRadius)
        .attr('fill', getMasteryColor(tech.mastery))
        .attr('stroke', 'rgba(255, 255, 255, 0.3)')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
    })

    // 添加渐变定义
    const defs = svg!.select<SVGDefsElement>('defs') || svg!.append('defs')
    const gradient = defs.append('radialGradient')
      .attr('id', 'glow-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(59, 130, 246, 0.3)')

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(59, 130, 246, 0)')
  }

  // 更新阶段悬停状态
  function updateStageHover(stageId: string | null): void {
    if (!contentGroup) return

    contentGroup.selectAll('.stage').classed('hovered', function() {
      const stage = d3.select(this).datum() as typeof developmentStages[0]
      return stage.id === stageId
    })

    contentGroup.selectAll<SVGLineElement, typeof developmentStages[0]>('.stage-line')
      .attr('stroke', function() {
        const stage = d3.select(this).datum() as typeof developmentStages[0]
        return stage.id === stageId ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)'
      })
      .attr('stroke-width', function() {
        const stage = d3.select(this).datum() as typeof developmentStages[0]
        return stage.id === stageId ? 6 : 4
      })

    contentGroup.selectAll<SVGTextElement, typeof developmentStages[0]>('.stage-label')
      .attr('fill', function() {
        const stage = d3.select(this).datum() as typeof developmentStages[0]
        return stage.id === stageId ? '#3b82f6' : '#94a3b8'
      })
  }

  // 更新点悬停状态
  function updatePointHover(techTitle: string | null): void {
    if (!contentGroup) return

    contentGroup.selectAll('.point').classed('hovered', function() {
      const data = d3.select(this).datum() as D3Point
      return data.technology.title === techTitle
    })

    contentGroup.selectAll<SVGCircleElement, D3Point>('.point-circle')
      .attr('r', function() {
        const data = d3.select(this).datum() as D3Point
        return data.technology.title === techTitle ? pointRadius * 1.5 : pointRadius
      })
      .attr('stroke', function() {
        const data = d3.select(this).datum() as D3Point
        return data.technology.title === techTitle ? '#3b82f6' : 'rgba(255, 255, 255, 0.3)'
      })
      .attr('stroke-width', function() {
        const data = d3.select(this).datum() as D3Point
        return data.technology.title === techTitle ? 3 : 2
      })

    contentGroup.selectAll<SVGCircleElement, D3Point>('.point-glow')
      .style('opacity', function() {
        const data = d3.select(this).datum() as D3Point
        return data.technology.title === techTitle ? 1 : 0
      })
  }

  // 重新渲染
  function render(): void {
    if (!contentGroup) return

    // 清除现有内容
    contentGroup.selectAll('*').remove()

    // 重新绘制
    drawAxes()
    drawPoints()
  }

  // 鼠标移动处理
  function handleMouseMove(event: MouseEvent): void {
    const rect = svgRef.value?.getBoundingClientRect()
    if (!rect) return

    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // 计算视差偏移
    const centerX = svgWidth.value / 2
    const centerY = svgHeight.value / 2

    targetParallaxX.value = (centerX - mouseX) * parallaxStrength
    targetParallaxY.value = (centerY - mouseY) * parallaxStrength

    triggerParallax()

    // 检测悬停
    const transform = d3.zoomTransform(svgRef.value!)
    const [worldX, worldY] = transform.invert([mouseX, mouseY])

    // 检查技术点
    let foundPoint: D3Point | null = null
    for (const tech of technologies.value) {
      const stage = developmentStages.find(s => s.id === tech.x_axis)
      if (!stage) continue

      const x = getXPosition(stage.order)
      const y = getYPosition(tech.y_axis)
      const distance = Math.sqrt((worldX - x) ** 2 + (worldY - y) ** 2)

      const hitRadius = Math.max(pointRadius, 20 / transform.k)

      if (distance <= hitRadius) {
        foundPoint = { x, y, technology: tech, radius: pointRadius }
        break
      }
    }

    // 检查阶段
    let foundStage: StageSegment | null = null
    if (!foundPoint && worldY >= contentHeight && worldY <= contentHeight + 100) {
      for (const stage of developmentStages) {
        const x = padding.left + stageStep * (stage.order - 1)
        const segmentX = x + stageStep * 0.15
        const segmentWidth = stageStep * 0.7

        if (worldX >= segmentX && worldX <= segmentX + segmentWidth) {
          foundStage = { stage }
          break
        }
      }
    }

    // 更新状态
    if (foundPoint !== hoveredPoint.value || (foundStage?.stage.id !== hoveredStage.value?.stage.id)) {
      hoveredPoint.value = foundPoint
      hoveredStage.value = foundStage

      updatePointHover(foundPoint?.technology.title || null)
      updateStageHover(foundStage?.stage.id || null)
    }
  }

  // 鼠标离开处理
  function handleMouseLeave(): void {
    hoveredPoint.value = null
    hoveredStage.value = null

    updatePointHover(null)
    updateStageHover(null)

    targetParallaxX.value = 0
    targetParallaxY.value = 0
    triggerParallax()
  }

  // 调整大小处理
  function handleResize(): void {
    if (!svgRef.value) return

    const container = svgRef.value.parentElement
    if (!container) return

    svgWidth.value = container.clientWidth
    svgHeight.value = container.clientHeight

    d3.select(svgRef.value)
      .attr('width', svgWidth.value)
      .attr('height', svgHeight.value)

    // 初始化时居中
    if (!g || g.selectAll('*').size() === 0) {
      const contentCenterX = padding.left + contentWidth / 2
      const contentCenterY = padding.top + contentHeight / 2

      const initialTransform = d3.zoomIdentity
        .translate(svgWidth.value / 2 - contentCenterX, svgHeight.value / 2 - contentCenterY)

      if (zoom) {
        zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 5])
          .on('zoom', (event) => {
            if (g) {
              g.attr('transform', event.transform)
            }
          })

        d3.select(svgRef.value).call(zoom)

        // 应用初始变换
        d3.select(svgRef.value)
          .call(zoom.transform, initialTransform)
      }
    }

    render()
  }

  // 初始化
  onMounted(() => {
    if (!svgRef.value) return

    svg = d3.select(svgRef.value)

    // 创建主组（用于缩放/平移）
    mainGroup = svg.append('g')

    // 创建内容组（用于视差效果）
    contentGroup = mainGroup.append('g')

    // 设置缩放行为
    zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        if (mainGroup) {
          mainGroup.attr('transform', event.transform)
        }
      })

    svg.call(zoom as any)

    handleResize()
    window.addEventListener('resize', handleResize)

    // 添加事件监听
    svg.on('mousemove', handleMouseMove)
    svg.on('mouseleave', handleMouseLeave)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
  })

  // 监听技术数据变化
  watch(technologies, () => {
    render()
  })

  return {
    hoveredPoint,
    hoveredStage,
    handleResize,
    render
  }
}
