<template>
  <div class="debug-panel" :class="{ collapsed: isCollapsed }">
    <div class="debug-header" @click="toggleCollapse">
      <span>Debug Panel</span>
      <button class="toggle-btn">{{ isCollapsed ? '+' : '−' }}</button>
    </div>

    <div v-if="!isCollapsed" class="debug-content">
      <!-- 参数选择 -->
      <div class="debug-section">
        <h4>显示参数</h4>
        <div class="checkbox-group">
          <label v-for="param in availableParams" :key="param.key" class="checkbox-label">
            <input
              type="checkbox"
              :checked="selectedParams.includes(param.key)"
              @change="toggleParam(param.key)"
            />
            {{ param.label }}
          </label>
        </div>
      </div>

      <!-- 临时参数设置 -->
      <div class="debug-section">
        <h4>临时参数</h4>
        <div class="param-inputs">
          <div v-for="key in selectedParams" :key="key" class="param-input">
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

      <!-- 当前值显示 -->
      <div class="debug-section">
        <h4>当前值</h4>
        <div class="current-values">
          <div v-for="key in selectedParams" :key="key" class="value-display">
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
import { ref, onMounted, watch } from 'vue'

// 可用的参数定义
const availableParams = [
  { key: 'parallaxStrength', label: '视差强度', type: 'number' },
  { key: 'initialScale', label: '初始缩放', type: 'number' },
  { key: 'pointRadius', label: '点半径', type: 'number' },
  { key: 'stageStep', label: '阶段间距', type: 'number' },
  { key: 'depthStep', label: '深度间距', type: 'number' }
]

// 状态
const isCollapsed = ref(false)
const selectedParams = ref<string[]>([])
const tempParams = ref<Record<string, any>>({})
const currentValues = ref<Record<string, any>>({})

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
    parallaxStrength: 0.08,
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
  width: 320px;
  background-color: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
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
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  user-select: none;
}

.debug-header span {
  font-weight: 600;
  font-size: 16px;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
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
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.debug-section {
  margin-bottom: 16px;
}

.debug-section:last-child {
  margin-bottom: 0;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.param-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.param-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-input label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.param-input input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.param-input input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
}

.current-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.value-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.value-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.value-value {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}

.btn-apply,
.btn-reset {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
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
  width: 6px;
}

.debug-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.debug-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.debug-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
