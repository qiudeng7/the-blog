/**
 * 内容数据类型定义
 */

export interface Technology {
  title: string
  icon?: string         // SVG icon路径或内联SVG
  x_axis: string        // 对应开发生命周期阶段 ID
  x_position?: number   // 1-10, 在该阶段内的相对位置（从左到右），默认为 5
  y_axis: number        // 1-5, 抽象深度
  mastery: number       // 0.0-1.0, 掌握程度
  tags: string[]
  description: string
  details: string       // Markdown 内容
}

export interface ParsedContent {
  attributes: Technology
  body: string
}
