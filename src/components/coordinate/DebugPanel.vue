<template>
  <div class="debug-panel" :class="{ collapsed: isCollapsed }">
    <div class="debug-header" @click="toggleCollapse">
      <span>Debug Panel</span>
      <button class="toggle-btn">{{ isCollapsed ? '+' : '−' }}</button>
    </div>

    <div v-if="!isCollapsed" class="debug-content">
      <!-- 参数树（可折叠，直接编辑） -->
      <div class="param-tree">
        <div
          v-for="(params, categoryName) in paramGroups"
          :key="categoryName"
          class="param-category"
        >
          <div class="category-header" @click="toggleCategory(categoryName)">
            <button class="category-toggle">
              {{ expandedCategories.has(categoryName) ? '▼' : '▶' }}
            </button>
            <span class="category-name">{{ categoryName }}</span>
          </div>
          <div v-show="expandedCategories.has(categoryName)" class="category-params">
            <div
              v-for="param in params"
              :key="param.key"
              class="param-item"
            >
              <label class="param-label">{{ param.label }}</label>
              <input
                v-if="param.type === 'number'"
                type="number"
                :value="currentValues[param.key]"
                @input="handleInput(param.key, ($event.target as HTMLInputElement).value)"
                @keydown.enter="applyParam(param.key)"
                step="0.01"
                class="param-input"
              />
              <input
                v-else
                type="text"
                :value="currentValues[param.key]"
                @input="handleInput(param.key, ($event.target as HTMLInputElement).value)"
                @keydown.enter="applyParam(param.key)"
                class="param-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="debug-actions">
        <button class="btn-reset" @click="resetAllParams">
          恢复默认值
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 参数定义（按分类组织）
const paramDefinitions = {
  '交互效果': [
    { key: 'parallaxStrength', label: '基础视差强度', type: 'number', default: 0.06 },
    { key: 'bgParallaxMult', label: '背景视差系数', type: 'number', default: 0.5 },
    { key: 'axisParallaxMult', label: '轴线视差系数', type: 'number', default: 0.75 },
    { key: 'pointParallaxMult', label: '节点视差系数', type: 'number', default: 1.0 }
  ],
  '样式': [
    { key: 'pointRadius', label: '点半径', type: 'number', default: 9 }
  ],
  '颜色': [
    { key: 'bgColor1', label: '背景色1(中心)', type: 'text', default: '#1a2a28' },
    { key: 'bgColor2', label: '背景色2(中)', type: 'text', default: '#15221f' },
    { key: 'bgColor3', label: '背景色3(边缘)', type: 'text', default: '#070a0c' },
    { key: 'glowColor', label: '光晕颜色', type: 'text', default: 'rgba(36, 107, 100, 0.08)' }
  ],
  '布局': [
    { key: 'stageStep', label: '阶段间距', type: 'number', default: 300 },
    { key: 'depthStep', label: '深度间距', type: 'number', default: 160 }
  ]
}

// 状态
const isCollapsed = ref(true)
const expandedCategories = ref<Set<string>>(new Set())
const currentValues = ref<Record<string, any>>({})
const tempValues = ref<Record<string, any>>({})

onMounted(() => {
  // 默认展开所有分类
  Object.keys(paramDefinitions).forEach(category => {
    expandedCategories.value.add(category)
  })

  // 初始化默认值（作为占位符，会被实际值覆盖）
  Object.values(paramDefinitions).flat().forEach(param => {
    currentValues.value[param.key] = param.default
  })

  // 监听外部值更新（会覆盖上面的默认值）
  window.addEventListener('debug-update-values', ((event: CustomEvent) => {
    // 完全替换为实际值，而不是合并
    currentValues.value = { ...event.detail }
  }) as EventListener)

  // 主动请求一次当前的参数值
  window.dispatchEvent(new CustomEvent('debug-request-values'))
})

// 切换折叠状态
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

// 切换分类展开/折叠
function toggleCategory(categoryName: string) {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName)
  } else {
    expandedCategories.value.add(categoryName)
  }
  // 强制更新
  expandedCategories.value = new Set(expandedCategories.value)
}

// 处理输入
function handleInput(key: string, value: string) {
  const param = Object.values(paramDefinitions).flat().find(p => p.key === key)
  if (param?.type === 'number') {
    tempValues.value[key] = parseFloat(value)
  } else {
    tempValues.value[key] = value
  }
}

// 应用单个参数
function applyParam(key: string) {
  if (tempValues.value[key] !== undefined) {
    const paramValue = { [key]: tempValues.value[key] }

    // 更新当前值
    currentValues.value[key] = tempValues.value[key]

    // 发送事件
    window.dispatchEvent(new CustomEvent('debug-apply-params', {
      detail: paramValue
    }))

    console.log(`Applied ${key}:`, tempValues.value[key])
  }
}

// 重置所有参数
function resetAllParams() {
  const defaults: Record<string, any> = {}

  Object.values(paramDefinitions).flat().forEach(param => {
    defaults[param.key] = param.default
    currentValues.value[param.key] = param.default
  })

  tempValues.value = {}

  window.dispatchEvent(new CustomEvent('debug-reset-params'))
  console.log('Reset all params to defaults')
}

// 参数分组（保持原顺序）
const paramGroups = paramDefinitions
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 260px;
  background-color: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  z-index: 10000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
}

.debug-panel.collapsed {
  transform: translateY(calc(100% - 50px));
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  user-select: none;
}

.debug-header span {
  font-weight: 600;
  font-size: 14px;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.debug-content {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

/* 参数树 */
.param-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.param-category {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  user-select: none;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-toggle {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  flex-shrink: 0;
}

.category-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
}

.category-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.category-params {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.param-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 55px;
  max-width: 55px;
  flex-shrink: 0;
}

.param-input {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 4px 6px;
  color: #ffffff;
  font-size: 11px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.param-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

/* 操作按钮 */
.debug-actions {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-reset {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 自定义滚动条 */
.debug-content::-webkit-scrollbar {
  width: 4px;
}

.debug-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.debug-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.debug-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
