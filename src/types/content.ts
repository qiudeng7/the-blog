/**
 * 内容数据类型定义
 */

export interface Technology {
  title: string
  x_axis: string        // 对应开发生命周期阶段 ID
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
