/**
 * D3.js 坐标系 - 支持视差效果
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

  // D3 选择
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
  let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
  let overlayGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
  let overlayParallaxGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null

  // 视差效果 - 可通过 debug 面板调整
  const parallaxX = ref(0)
  const parallaxY = ref(0)
  const targetParallaxX = ref(0)
  const targetParallaxY = ref(0)
  const parallaxStrength = ref(0.06)  // 视差强度
  let animationFrameId: number | null = null

  // 布局配置 - 可通过 debug 面板调整
  const padding = { top: 100, right: 30, bottom: 150, left: 100 }
  const pointRadius = ref(12)
  const yAxisMax = 5
  const stageStep = ref(200)
  const depthStep = ref(150)

  // 内容总尺寸 - 动态计算
  const contentWidth = ref(developmentStages.length * stageStep.value)
  const contentHeight = ref(yAxisMax * depthStep.value)

  // 监听参数变化，更新内容尺寸
  function updateContentDimensions() {
    contentWidth.value = developmentStages.length * stageStep.value
    contentHeight.value = yAxisMax * depthStep.value
  }

  // 计算掌握程度的颜色 - 黑白渐变
  function getMasteryColor(mastery: number): string {
    // 黑白渐变：从浅灰到纯黑
    const lightness = 255 - mastery * 200  // 0.0 -> 255, 1.0 -> 55
    return `rgb(${lightness}, ${lightness}, ${lightness})`
  }

  // 获取 X 轴位置
  function getXPosition(stageOrder: number): number {
    return padding.left + stageStep.value * (stageOrder - 0.5)
  }

  // 获取 Y 轴位置
  function getYPosition(depth: number): number {
    return padding.top + contentHeight.value - depth * depthStep.value
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

    // 应用视差偏移到覆盖层视差组
    if (overlayParallaxGroup) {
      overlayParallaxGroup.attr('transform', `translate(${parallaxX.value},${parallaxY.value})`)
    }

    if (
      Math.abs(targetParallaxX.value - parallaxX.value) > 0.1 ||
      Math.abs(targetParallaxY.value - parallaxY.value) > 0.1
    ) {
      animationFrameId = requestAnimationFrame(animateParallax)
    }
  }

  // 应用 debug 参数
  function applyDebugParams(params: Record<string, any>) {
    if (params.parallaxStrength !== undefined) {
      parallaxStrength.value = params.parallaxStrength
    }
    if (params.pointRadius !== undefined) {
      pointRadius.value = params.pointRadius
    }
    if (params.stageStep !== undefined) {
      stageStep.value = params.stageStep
      updateContentDimensions()
    }
    if (params.depthStep !== undefined) {
      depthStep.value = params.depthStep
      updateContentDimensions()
    }
    render()
  }

  // 获取当前参数值
  function getCurrentParams() {
    return {
      parallaxStrength: parallaxStrength.value,
      pointRadius: pointRadius.value,
      stageStep: stageStep.value,
      depthStep: depthStep.value
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

    // 背景 - 黑色
    contentGroup.append('rect')
      .attr('class', 'background')
      .attr('x', -10000)
      .attr('y', -10000)
      .attr('width', contentWidth.value + 20000)
      .attr('height', contentHeight.value + 20000)
      .attr('fill', '#000000')

    // Y 轴水平网格线 - 向两侧无限延伸
    for (let i = 1; i <= yAxisMax; i++) {
      const y = getYPosition(i)

      // 网格线 - 白色，延伸很远以看起来无限
      contentGroup.append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', -10000)
        .attr('y1', y)
        .attr('x2', contentWidth.value + 10000)
        .attr('y2', y)
        .attr('stroke', 'rgba(255, 255, 255, 0.15)')
        .attr('stroke-width', 1)

      // Y 轴标签 - 白色，移到右侧
      contentGroup.append('text')
        .attr('class', 'y-axis-label')
        .attr('x', padding.left + contentWidth.value + 20)
        .attr('y', y)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '16px')
        .text(i.toString())
    }

    // X 轴垂直网格线 - 向上下无限延伸
    for (let i = 0; i <= developmentStages.length; i++) {
      const x = padding.left + stageStep.value * i

      contentGroup.append('line')
        .attr('class', 'grid-line-x')
        .attr('x1', x)
        .attr('y1', -10000)
        .attr('x2', x)
        .attr('y2', contentHeight.value + 10000)
        .attr('stroke', 'rgba(255, 255, 255, 0.15)')
        .attr('stroke-width', 1)
    }

    // 创建渐变定义（在绘制阶段之前）
    const defs = svg!.select<SVGDefsElement>('defs') || svg!.append('defs')
    const grayGradient = defs.append('linearGradient')
      .attr('id', 'gray-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', -10000)
      .attr('y1', 0)
      .attr('x2', padding.left + stageStep.value)
      .attr('y2', 0)

    grayGradient.append('stop')
      .attr('offset', 0)
      .attr('stop-color', 'rgba(60, 60, 60, 0.5)')

    grayGradient.append('stop')
      .attr('offset', 0.7)
      .attr('stop-color', 'rgba(40, 40, 40, 0.3)')

    grayGradient.append('stop')
      .attr('offset', 1)
      .attr('stop-color', 'rgba(0, 0, 0, 0)')

    // 添加灰色渐变矩形（在网格线之后，阶段之前）
    contentGroup.insert('rect', ':first-child')
      .attr('class', 'gray-background')
      .attr('x', -10000)
      .attr('y', -10000)
      .attr('width', 10000 + padding.left + stageStep.value)
      .attr('height', contentHeight.value + 20000)
      .attr('fill', 'url(#gray-gradient)')
      .attr('pointer-events', 'none')

    // Y 轴标题 - 白色，移到右侧
    contentGroup.append('text')
      .attr('class', 'y-axis-title')
      .attr('x', padding.left + contentWidth.value + 60)
      .attr('y', contentHeight.value / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '20px')
      .attr('transform', `rotate(-90, ${padding.left + contentWidth.value + 60}, ${contentHeight.value / 2})`)
      .text('抽象深度')

    // X 轴阶段线段
    const stageGroup = contentGroup.append('g').attr('class', 'x-axis-stages')

    developmentStages.forEach((stage, index) => {
      const x = padding.left + stageStep.value * index
      const segmentWidth = stageStep.value * 0.7
      const segmentX = x + stageStep.value * 0.15

      const stageG = stageGroup.append('g')
        .attr('class', `stage stage-${stage.id}`)
        .datum(stage)

      // 阶段线段 - 白色
      stageG.append('line')
        .attr('class', 'stage-line')
        .attr('x1', segmentX)
        .attr('y1', contentHeight.value + 20)
        .attr('x2', segmentX + segmentWidth)
        .attr('y2', contentHeight.value + 20)
        .attr('stroke', 'rgba(255, 255, 255, 0.6)')
        .attr('stroke-width', 4)
        .attr('stroke-linecap', 'round')

      // 阶段标签 - 中文（上）
      stageG.append('text')
        .attr('class', 'stage-label-zh')
        .attr('x', segmentX + segmentWidth / 2)
        .attr('y', contentHeight.value + 50)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '15px')
        .attr('font-weight', '500')
        .text(stage.name)

      // 阶段标签 - 英文（下）
      stageG.append('text')
        .attr('class', 'stage-label-en')
        .attr('x', segmentX + segmentWidth / 2)
        .attr('y', contentHeight.value + 72)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255, 255, 255, 0.7)')
        .attr('font-size', '13px')
        .text(stage.nameEn)
    })
  }

  // 绘制技术点
  function drawPoints(): void {
    if (!overlayParallaxGroup) return

    const pointsGroup = overlayParallaxGroup.append('g').attr('class', 'technology-points')

    technologies.value.forEach(tech => {
      const stage = developmentStages.find(s => s.id === tech.x_axis)
      if (!stage) return

      const x = getXPosition(stage.order)
      const y = getYPosition(tech.y_axis)

      const pointG = pointsGroup.append('g')
        .attr('class', `point point-${tech.title}`)
        .datum({ x, y, technology: tech, radius: pointRadius.value })

      // 文本标签（在节点上方）
      pointG.append('text')
        .attr('class', 'point-label')
        .attr('x', x)
        .attr('y', y - pointRadius.value - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '14px')
        .attr('font-weight', '500')
        .attr('pointer-events', 'none')
        .text(tech.title)

      // 外发光效果（默认隐藏）
      pointG.append('circle')
        .attr('class', 'point-glow')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', pointRadius.value * 2)
        .attr('fill', 'url(#glow-gradient)')
        .style('opacity', 0)

      // 主点
      pointG.append('circle')
        .attr('class', 'point-circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', pointRadius.value)
        .attr('fill', getMasteryColor(tech.mastery))
        .attr('stroke', 'rgba(255, 255, 255, 0.5)')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
    })

    // 添加渐变定义 - 白色光晕
    const defs = svg!.select<SVGDefsElement>('defs') || svg!.append('defs')
    const gradient = defs.append('radialGradient')
      .attr('id', 'glow-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(255, 255, 255, 0.4)')

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(255, 255, 255, 0)')
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
        return stage.id === stageId ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'
      })
      .attr('stroke-width', function() {
        const stage = d3.select(this).datum() as typeof developmentStages[0]
        return stage.id === stageId ? 6 : 4
      })

    contentGroup.selectAll<SVGTextElement, typeof developmentStages[0]>('.stage-label-zh')
      .attr('fill', function() {
        const stage = d3.select(this).datum() as typeof developmentStages[0]
        return stage.id === stageId ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'
      })

    contentGroup.selectAll<SVGTextElement, typeof developmentStages[0]>('.stage-label-en')
      .attr('fill', function() {
        const stage = d3.select(this).datum() as typeof developmentStages[0]
        return stage.id === stageId ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'
      })
  }

  // 更新点悬停状态
  function updatePointHover(techTitle: string | null): void {
    if (!overlayParallaxGroup) return

    overlayParallaxGroup.selectAll('.point').classed('hovered', function() {
      const data = d3.select(this).datum() as D3Point
      return data.technology.title === techTitle
    })

    overlayParallaxGroup.selectAll<SVGCircleElement, D3Point>('.point-circle')
      .attr('r', function() {
        const data = d3.select(this).datum() as D3Point
        return data.technology.title === techTitle ? pointRadius.value * 1.5 : pointRadius.value
      })
      .attr('stroke', function() {
        const data = d3.select(this).datum() as D3Point
        return data.technology.title === techTitle ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
      })
      .attr('stroke-width', function() {
        const data = d3.select(this).datum() as D3Point
        return data.technology.title === techTitle ? 3 : 2
      })

    overlayParallaxGroup.selectAll<SVGCircleElement, D3Point>('.point-glow')
      .style('opacity', function() {
        const data = d3.select(this).datum() as D3Point
        return data.technology.title === techTitle ? 1 : 0
      })
  }

  // 重新渲染
  function render(): void {
    if (!contentGroup || !overlayParallaxGroup) return

    console.log('Rendering coordinate system with', technologies.value.length, 'technologies')

    // 清除现有内容
    contentGroup.selectAll('*').remove()
    overlayParallaxGroup.selectAll('*').remove()

    // 重新绘制
    drawAxes()
    drawPoints()

    console.log('Render complete')
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

    targetParallaxX.value = (centerX - mouseX) * parallaxStrength.value
    targetParallaxY.value = (centerY - mouseY) * parallaxStrength.value

    triggerParallax()

    // 检测悬停 - 需要考虑视差偏移
    // 节点因为视差效果移动了，视觉位置 = 原始位置 + parallax
    // 鼠标在视觉位置上，要反向调整来匹配原始位置
    // 使用目标值而不是当前值，因为动画可能还没完成
    const adjustedMouseX = mouseX - targetParallaxX.value
    const adjustedMouseY = mouseY - targetParallaxY.value

    // 检查技术点
    let foundPoint: D3Point | null = null
    for (const tech of technologies.value) {
      const stage = developmentStages.find(s => s.id === tech.x_axis)
      if (!stage) continue

      const x = getXPosition(stage.order)
      const y = getYPosition(tech.y_axis)
      const distance = Math.sqrt((adjustedMouseX - x) ** 2 + (adjustedMouseY - y) ** 2)

      const hitRadius = Math.max(pointRadius.value, 20)

      if (distance <= hitRadius) {
        foundPoint = { x, y, technology: tech, radius: pointRadius.value }
        break
      }
    }

    // 检查阶段（阶段在 contentGroup 中，也有视差效果）
    let foundStage: StageSegment | null = null
    if (!foundPoint && adjustedMouseY >= contentHeight.value && adjustedMouseY <= contentHeight.value + 100) {
      for (const stage of developmentStages) {
        const x = padding.left + stageStep.value * (stage.order - 1)
        const segmentX = x + stageStep.value * 0.15
        const segmentWidth = stageStep.value * 0.7

        if (adjustedMouseX >= segmentX && adjustedMouseX <= segmentX + segmentWidth) {
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

    render()
  }

  // 初始化
  onMounted(() => {
    if (!svgRef.value) return

    console.log('useD3Coordinate initializing...')

    svg = d3.select(svgRef.value)

    // 创建内容组（用于视差效果）
    contentGroup = svg.append('g')

    // 创建覆盖层组（用于节点和文本，不受缩放影响）
    overlayGroup = svg.append('g').attr('class', 'overlay-group')

    // 创建覆盖层视差组（用于节点和文本的视差效果）
    overlayParallaxGroup = overlayGroup.append('g').attr('class', 'overlay-parallax-group')

    console.log('SVG groups created')

    handleResize()
    window.addEventListener('resize', handleResize)

    // 添加事件监听
    svg.on('mousemove', handleMouseMove)
    svg.on('mouseleave', handleMouseLeave)

    // 监听 debug 面板参数调整事件
    window.addEventListener('debug-apply-params', ((event: CustomEvent) => {
      applyDebugParams(event.detail)
      // 发送更新后的参数值
      window.dispatchEvent(new CustomEvent('debug-update-values', {
        detail: getCurrentParams()
      }))
    }) as EventListener)

    // 监听请求参数值事件
    window.addEventListener('debug-request-values', (() => {
      window.dispatchEvent(new CustomEvent('debug-update-values', {
        detail: getCurrentParams()
      }))
    }) as EventListener)

    // 监听重置事件
    window.addEventListener('debug-reset-params', () => {
      // 重置为默认值
      parallaxStrength.value = 0.06
      pointRadius.value = 12
      stageStep.value = 200
      depthStep.value = 150
      updateContentDimensions()
      render()

      window.dispatchEvent(new CustomEvent('debug-update-values', {
        detail: getCurrentParams()
      }))
    })

    console.log('useD3Coordinate initialized')
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
    render,
    parallaxX: targetParallaxX,  // 返回目标值而不是当前值
    parallaxY: targetParallaxY
  }
}
