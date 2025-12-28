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
          <h3 class="tooltip-title">{{ technology.title }}</h3>
          <p class="tooltip-description">{{ technology.description }}</p>

          <div class="tooltip-meta">
            <span class="meta-item">
              <strong>掌握程度:</strong>
              <div class="mastery-bar">
                <div
                  class="mastery-fill"
                  :style="{ width: (technology.mastery * 100) + '%' }"
                />
              </div>
              {{ (technology.mastery * 100).toFixed(0) }}%
            </span>
            <span class="meta-item">
              <strong>抽象深度:</strong> {{ technology.y_axis }}/5
            </span>
          </div>

          <div class="tooltip-tags">
            <span v-for="tag in technology.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>

          <div class="tooltip-details" v-html="renderedDetails"></div>
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
