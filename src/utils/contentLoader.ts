/**
 * Markdown 内容加载工具
 * 使用 Vite 的 import.meta.glob 加载 markdown 文件
 */

import fm from 'front-matter'
import type { Technology } from '../types/content'

interface MarkdownModule {
  default?: string
  [key: string]: any
}

/**
 * 加载所有技术栈内容
 */
export async function loadTechnologies(): Promise<Technology[]> {
  try {
    // 使用 Vite 的 glob 导入所有 markdown 文件
    const modules = import.meta.glob('../../content/technologies/*.md', {
      query: '?raw',
      import: 'default'
    })

    const technologies: Technology[] = []

    for (const path in modules) {
      const content = await modules[path]()
      const parsed = fm<Technology>(content as string)

      technologies.push({
        ...parsed.attributes,
        details: parsed.body
      })
    }

    return technologies
  } catch (error) {
    console.error('Failed to load technologies:', error)
    return []
  }
}

/**
 * 根据 ID 获取单个技术
 */
export async function getTechnologyById(title: string): Promise<Technology | null> {
  const technologies = await loadTechnologies()
  return technologies.find(tech => tech.title === title) || null
}

/**
 * 根据阶段获取技术列表
 */
export async function getTechnologiesByStage(stageId: string): Promise<Technology[]> {
  const technologies = await loadTechnologies()
  return technologies.filter(tech => tech.x_axis === stageId)
}

/**
 * 根据 Y 轴深度获取技术列表
 */
export async function getTechnologiesByDepth(depth: number): Promise<Technology[]> {
  const technologies = await loadTechnologies()
  return technologies.filter(tech => tech.y_axis === depth)
}
