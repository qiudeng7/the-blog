<template>
  <div class="debug-panel" :class="{ collapsed: isCollapsed }">
    <div class="debug-header" @click="toggleCollapse">
      <span>Debug Panel</span>
      <button class="toggle-btn">{{ isCollapsed ? '+' : '−' }}</button>
    </div>

    <div v-if="!isCollapsed" class="debug-content">
      <!-- 搜索框 -->
      <div class="debug-section">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索参数..."
        />
      </div>

      <!-- 参数树（带搜索和折叠） -->
      <div class="debug-section">
        <h4>显示参数</h4>
        <div class="param-tree">
          <div
            v-for="(group, categoryName) in filteredParamGroups"
            :key="categoryName"
            class="param-category"
          >
            <div class="category-header" @click="toggleCategory(categoryName)">
              <span class="category-name">{{ categoryName }}</span>
              <button class="category-toggle">
                {{ expandedCategories.has(categoryName) ? '▼' : '▶' }}
              </button>
            </div>
            <div v-show="expandedCategories.has(categoryName)" class="category-params">
              <label
                v-for="param in group"
                :key="param.key"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :checked="selectedParams.includes(param.key)"
                  @change="toggleParam(param.key)"
                />
                {{ param.label }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 临时参数（紧凑模式） -->
      <div v-if="selectedParams.length > 0" class="debug-section">
        <h4>临时参数</h4>
        <div class="param-inputs-compact">
          <div v-for="key in selectedParams" :key="key" class="param-input-compact">
            <label>{{ getParamLabel(key) }}</label>
            <input
              v-if="getParamType(key) === 'number'"
              type="number"
              :value="tempParams[key]"
              @input="updateTempParam(key, ($event.target as HTMLInputElement).value)"
              step="0.01"
            />
            <input
              v-else
              type="text"
              :value="tempParams[key]"
              @input="updateTempParam(key, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <!-- 当前值显示（紧凑模式） -->
      <div v-if="selectedParams.length > 0" class="debug-section">
        <h4>当前值</h4>
        <div class="current-values-compact">
          <div v-for="key in selectedParams" :key="key" class="value-display-compact">
            <span class="value-label">{{ getParamLabel(key) }}:</span>
            <span class="value-value">{{ formatValue(getCurrentValue(key)) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="debug-section">
        <button class="btn-apply" @click="applyParams">应用临时值</button>
        <button class="btn-reset" @click="resetParams">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

// 可用的参数定义（按分类组织）
const availableParams = [
  {
    key: 'parallaxStrength',
    label: '视差强度',
    type: 'number',
    category: '交互效果'
  },
  {
    key: 'initialScale',
    label: '初始缩放',
    type: 'number',
    category: '视图'
  },
  {
    key: 'pointRadius',
    label: '点半径',
    type: 'number',
    category: '样式'
  },
  {
    key: 'stageStep',
    label: '阶段间距',
    type: 'number',
    category: '布局'
  },
  {
    key: 'depthStep',
    label: '深度间距',
    type: 'number',
    category: '布局'
  }
]

// 状态
const isCollapsed = ref(false)
const selectedParams = ref<string[]>([])
const tempParams = ref<Record<string, any>>({})
const currentValues = ref<Record<string, any>>({})
const searchQuery = ref('')
const expandedCategories = ref<Set<string>>(new Set())

// LocalStorage key
const STORAGE_KEY = 'debug-panel-selected-params'

// 加载保存的参数选择
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      selectedParams.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse saved params:', e)
    }
  }

  // 默认展开所有分类
  availableParams.forEach(param => {
    expandedCategories.value.add(param.category)
  })

  // 初始化临时值
  updateCurrentValues()
})

// 监听参数选择变化，保存到 localStorage
watch(selectedParams, (newParams) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newParams))
  updateCurrentValues()
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

// 过滤后的参数分组
const filteredParamGroups = computed(() => {
  const groups: Record<string, typeof availableParams> = {}

  availableParams.forEach(param => {
    // 搜索过滤
    if (searchQuery.value && !param.label.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return
    }

    if (!groups[param.category]) {
      groups[param.category] = []
    }
    groups[param.category].push(param)
  })

  return groups
})

// 切换参数选择
function toggleParam(key: string) {
  const index = selectedParams.value.indexOf(key)
  if (index > -1) {
    selectedParams.value.splice(index, 1)
  } else {
    selectedParams.value.push(key)
  }
}

// 获取参数标签
function getParamLabel(key: string): string {
  const param = availableParams.find(p => p.key === key)
  return param?.label || key
}

// 获取参数类型
function getParamType(key: string): string {
  const param = availableParams.find(p => p.key === key)
  return param?.type || 'string'
}

// 更新临时参数
function updateTempParam(key: string, value: string) {
  const param = availableParams.find(p => p.key === key)
  if (param?.type === 'number') {
    tempParams.value[key] = parseFloat(value)
  } else {
    tempParams.value[key] = value
  }
}

// 应用临时参数
function applyParams() {
  // 通过自定义事件通知父组件
  window.dispatchEvent(new CustomEvent('debug-apply-params', {
    detail: tempParams.value
  }))
  console.log('Applied params:', tempParams.value)
}

// 重置参数
function resetParams() {
  tempParams.value = {}
  window.dispatchEvent(new CustomEvent('debug-reset-params'))
  console.log('Reset params')
}

// 更新当前值
function updateCurrentValues() {
  // 从全局读取当前值（如果有全局访问方式）
  // 这里暂时使用默认值
  const defaults: Record<string, any> = {
    parallaxStrength: 0.03,
    initialScale: 1.0,
    pointRadius: 12,
    stageStep: 200,
    depthStep: 150
  }
  currentValues.value = { ...defaults }
}

// 获取当前值
function getCurrentValue(key: string): any {
  return currentValues.value[key] || '-'
}

// 格式化值显示
function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  return String(value)
}

// 监听外部值更新事件
window.addEventListener('debug-update-values', ((event: CustomEvent) => {
  currentValues.value = { ...currentValues.value, ...event.detail }
}) as EventListener)
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 280px;
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

.debug-section {
  margin-bottom: 12px;
}

.debug-section:last-child {
  margin-bottom: 0;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 搜索框 */
.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 10px;
  color: #ffffff;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* 参数树 */
.param-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-category {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  user-select: none;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
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
}

.category-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
}

.category-params {
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
}

.checkbox-label input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

/* 紧凑的参数输入 */
.param-inputs-compact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.param-input-compact {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.param-input-compact label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.param-input-compact input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px 8px;
  color: #ffffff;
  font-size: 12px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.param-input-compact input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
}

/* 紧凑的当前值显示 */
.current-values-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.value-display-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 11px;
}

.value-label {
  color: rgba(255, 255, 255, 0.6);
}

.value-value {
  font-family: 'Courier New', monospace;
  color: #ffffff;
  font-weight: 500;
}

/* 操作按钮 */
.btn-apply,
.btn-reset {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 6px;
}

.btn-apply {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.btn-apply:hover {
  background: rgba(255, 255, 255, 0.25);
}

.btn-reset {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.1);
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
