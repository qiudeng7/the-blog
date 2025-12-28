<template>
  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="visible"
        class="tooltip-wrapper"
        :style="{ left: x + 'px', top: y + 'px' }"
      >
        <div class="tooltip-content">
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
            <div
              class="tech-icon-container"
              v-html="technology.icon || getDefaultIcon()"
            ></div>
          </div>

          <!-- 内容区域 -->
          <div class="tech-content">
            <h3 class="tech-name">{{ technology.title }}</h3>
            <p class="tech-description">{{ technology.description }}</p>

            <!-- 掌握程度 -->
            <div class="tech-mastery">
              <div class="mastery-label">掌握程度</div>
              <div class="mastery-stars">
                <div
                  v-for="index in getStarCount(technology.mastery)"
                  :key="index"
                  class="star-badge"
                >
                  <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
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

// 获取星星数量（mastery 字段直接表示星星数量）
function getStarCount(mastery: number): number {
  return Math.round(mastery)
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
.tooltip-wrapper {
  position: fixed;
  z-index: 2000;
  pointer-events: none;
}

.tooltip-content {
  background: #fafafa;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.tech-icon-container :deep(svg) {
  width: 48px;
  height: 48px;
  color: #3b82f6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
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
  color: #1e293b;
}

.tech-description {
  color: #64748b;
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
  color: #64748b;
  white-space: nowrap;
}

/* 星星容器 */
.mastery-stars {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 星星徽章 */
.star-badge {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.star-icon {
  width: 18px;
  height: 18px;
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.3));
}

/* 原有样式保持 */
.tooltip-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: #1e293b;
}

.tooltip-description {
  color: #64748b;
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
  color: #334155;
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
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
}

.activity-list li::before,
.deliverable-list li::before,
.kpi-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #3b82f6;
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
