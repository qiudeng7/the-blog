/**
 * 软件开发生命周期阶段定义
 * X轴数据：6个主要阶段
 */

export interface DevelopmentStage {
  id: string
  name: string
  nameEn: string  // 英文名称
  order: number
  description: string
  activities: string[]
  deliverables: string[]
  kpis: string[]
}

export const developmentStages: DevelopmentStage[] = [
  {
    id: 'requirements',
    name: '需求分析',
    nameEn: 'Requirements',
    order: 1,
    description: '详细分析和定义系统需求和用户故事',
    activities: [
      '需求收集',
      '用户故事编写',
      '需求优先级排序',
      '验收标准定义',
      '干系人沟通'
    ],
    deliverables: [
      '软件需求规格说明书(SRS)',
      '用户故事地图',
      '验收标准文档',
      '原型设计'
    ],
    kpis: [
      '用户痛点覆盖度',
      '功能完整性',
      '优先级明确性',
      '可测试性'
    ]
  },
  {
    id: 'architecture',
    name: '架构设计',
    nameEn: 'Architecture',
    order: 2,
    description: '设计系统整体架构、模块接口和数据库结构',
    activities: [
      '系统架构设计',
      '技术选型',
      '架构评审',
      '非功能性需求分析',
      '风险评估',
      '模块设计',
      'API 接口设计',
      '数据库详细设计',
      '类设计',
      '时序图设计'
    ],
    deliverables: [
      '架构设计文档(ADD)',
      '技术选型报告',
      '系统架构图',
      '部署架构图',
      '数据库设计文档',
      '详细设计文档(DDD)',
      'API 接口文档',
      '数据库 ER 图',
      '类图和时序图',
      '测试计划'
    ],
    kpis: [
      '模块化与解耦程度',
      '可扩展性',
      '技术栈匹配度',
      '安全性设计'
    ]
  },
  {
    id: 'implementation',
    name: '编码实现',
    nameEn: 'Implementation',
    order: 3,
    description: '编写代码实现系统功能',
    activities: [
      '代码编写',
      '单元测试编写',
      '代码评审',
      '重构优化',
      '技术债务管理'
    ],
    deliverables: [
      '源代码',
      '单元测试代码',
      '代码评审报告',
      '技术文档'
    ],
    kpis: [
      '代码可读性/可维护性',
      '测试覆盖率',
      '性能基准',
      '安全编码规范'
    ]
  },
  {
    id: 'testing',
    name: '测试',
    nameEn: 'Testing',
    order: 4,
    description: '单元测试和集成测试，确保代码质量和系统集成',
    activities: [
      '单元测试编写与执行',
      '集成测试设计',
      '接口测试',
      '端到端测试',
      '性能测试',
      '测试覆盖率分析',
      '缺陷修复与验证'
    ],
    deliverables: [
      '单元测试代码',
      '集成测试用例',
      '测试覆盖率报告',
      '性能测试报告',
      '缺陷报告'
    ],
    kpis: [
      '缺陷密度/趋势',
      '测试通过率',
      '需求达成率',
      '性能达标率'
    ]
  },
  {
    id: 'deployment',
    name: '部署发布',
    nameEn: 'Deployment',
    order: 5,
    description: '将系统部署到生产环境',
    activities: [
      '部署准备',
      '环境配置',
      '数据迁移',
      '灰度发布',
      '发布验证'
    ],
    deliverables: [
      '部署脚本',
      '部署文档',
      '运维手册',
      '发布报告',
      '回滚方案'
    ],
    kpis: [
      '部署成功率',
      '发布频率',
      '平均部署时长',
      '回滚能力与时间'
    ]
  },
  {
    id: 'maintenance',
    name: '运维监控',
    nameEn: 'Maintenance',
    order: 6,
    description: '监控系统运行状态和维护系统',
    activities: [
      '系统监控',
      '日志分析',
      '问题诊断',
      '性能优化',
      '容量规划'
    ],
    deliverables: [
      '监控仪表板',
      '运维报告',
      '问题报告',
      '优化建议',
      '容量规划报告'
    ],
    kpis: [
      '系统可用性(SLA)',
      '平均恢复时间(MTTR)',
      '监控覆盖率',
      '告警准确率'
    ]
  }
]

export function getStageById(id: string): DevelopmentStage | undefined {
  return developmentStages.find(stage => stage.id === id)
}

export function getStageByOrder(order: number): DevelopmentStage | undefined {
  return developmentStages.find(stage => stage.order === order)
}
