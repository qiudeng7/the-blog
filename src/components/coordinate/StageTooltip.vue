<template>
  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="visible"
        class="tooltip"
        :style="{ left: x + 'px', top: y + 'px' }"
      >
        <div v-if="stage" class="stage-tooltip">
          <h3 class="tooltip-title">{{ stage.name }}</h3>
          <p class="tooltip-description">{{ stage.description }}</p>

          <div class="tooltip-section">
            <h4 class="section-title">主要活动</h4>
            <ul class="activity-list">
              <li v-for="activity in stage.activities" :key="activity">
                {{ activity }}
              </li>
            </ul>
          </div>

          <div class="tooltip-section">
            <h4 class="section-title">交付物</h4>
            <ul class="deliverable-list">
              <li v-for="deliverable in stage.deliverables" :key="deliverable">
                {{ deliverable }}
              </li>
            </ul>
          </div>

          <div class="tooltip-section">
            <h4 class="section-title">评估指标</h4>
            <ul class="kpi-list">
              <li v-for="kpi in stage.kpis" :key="kpi">
                {{ kpi }}
              </li>
            </ul>
          </div>
        </div>

        <div v-else-if="technology" class="technology-tooltip">
          <!-- Icon区域 -->
          <div class="tech-icon-wrapper">
            <div class="tech-icon-container" v-html="technology.icon || getDefaultIcon()"></div>
            <div class="tech-icon-shine"></div>
          </div>

          <!-- 内容区域 -->
          <div class="tech-content">
            <h3 class="tech-name">{{ technology.title }}</h3>
            <p class="tech-description">{{ technology.description }}</p>

            <!-- 掌握程度 -->
            <div class="tech-mastery">
              <div class="mastery-label">掌握程度</div>
              <div class="mastery-badge" :class="getMasteryClass(technology.mastery)">
                <span class="mastery-text">{{ getMasteryLabel(technology.mastery) }}</span>
                <div class="mastery-shine"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DevelopmentStage } from '../../data/development-lifecycle'
import type { Technology } from '../../types/content'

interface Props {
  stage: DevelopmentStage | null
  technology: Technology | null
}

const props = defineProps<Props>()

const visible = ref(false)
const x = ref(0)
const y = ref(0)

// 简单的 Markdown 渲染（仅支持基础语法）
const renderedDetails = computed(() => {
  if (!props.technology) return ''

  let html = props.technology.details

  // 标题
  html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>')
  html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>')

  // 列表
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  // 加粗
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 换行
  html = html.replace(/\n/g, '<br>')

  return html
})

// 获取掌握程度等级
function getMasteryLabel(mastery: number): string {
  if (mastery < 0.3) return '了解'
  if (mastery < 0.6) return '掌握'
  if (mastery < 0.85) return '熟练'
  return '精通'
}

// 获取掌握程度样式类
function getMasteryClass(mastery: number): string {
  if (mastery < 0.3) return 'mastery-familiar'
  if (mastery < 0.6) return 'mastery-skilled'
  if (mastery < 0.85) return 'mastery-proficient'
  return 'mastery-expert'
}

// 获取默认图标
function getDefaultIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>`
}

watch(
  () => ({ stage: props.stage, technology: props.technology }),
  (newValue) => {
    if (newValue.stage || newValue.technology) {
      visible.value = true
    } else {
      visible.value = false
    }
  },
  { immediate: true }
)

function position(event: MouseEvent) {
  const padding = 20
  x.value = Math.min(event.clientX + padding, window.innerWidth - 320)
  y.value = Math.min(event.clientY + padding, window.innerHeight - 400)

  if (event.clientY > window.innerHeight / 2) {
    y.value = Math.max(event.clientY - 300, padding)
  }
}

defineExpose({
  position
})
</script>

<style scoped>
.tooltip {
  position: fixed;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  z-index: 2000;
  pointer-events: none;
}

/* 阶段 tooltip 样式保持不变 */
.stage-tooltip {
  /* 原有样式 */
}

/* 技术栈名片式 tooltip */
.technology-tooltip {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* Icon 区域 */
.tech-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  perspective: 1000px;
}

.tech-icon-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: iconFlip 3s ease-in-out infinite;
  position: relative;
}

.tech-icon-container :deep(svg) {
  width: 48px;
  height: 48px;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Icon 反光效果 */
.tech-icon-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  animation: shineMove 3s ease-in-out infinite;
}

@keyframes iconFlip {
  0%, 100% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
}

@keyframes shineMove {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* 内容区域 */
.tech-content {
  flex: 1;
  min-width: 0;
}

.tech-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #ffffff;
}

.tech-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

/* 掌握程度 */
.tech-mastery {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mastery-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.mastery-badge {
  position: relative;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}

/* 掌握程度等级颜色 */
.mastery-familiar {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: #ffffff;
}

.mastery-skilled {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
}

.mastery-proficient {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
}

.mastery-expert {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
}

/* 掌握程度反光效果 */
.mastery-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: masteryShine 2.5s ease-in-out infinite;
}

@keyframes masteryShine {
  0% {
    left: -100%;
  }
  50%, 100% {
    left: 150%;
  }
}

/* 原有样式保持 */
.tooltip-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-accent);
}

.tooltip-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

.tooltip-section {
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.activity-list,
.deliverable-list,
.kpi-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-list li,
.deliverable-list li,
.kpi-list li {
  padding: var(--spacing-xs) 0;
  padding-left: var(--spacing-md);
  position: relative;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.activity-list li::before,
.deliverable-list li::before,
.kpi-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-accent);
}

.tooltip-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.mastery-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.mastery-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #8b5cf6);
  transition: width var(--transition-base);
}

.tooltip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.tooltip-details {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
}

.tooltip-details :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.tooltip-details :deep(h4) {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.tooltip-details :deep(ul) {
  list-style: none;
  padding: 0;
  margin-bottom: var(--spacing-sm);
}

.tooltip-details :deep(li) {
  padding: var(--spacing-xs) 0;
  padding-left: var(--spacing-md);
  position: relative;
}

.tooltip-details :deep(li)::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-accent);
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
