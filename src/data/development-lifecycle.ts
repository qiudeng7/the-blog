/**
 * 软件开发生命周期阶段定义
 * X轴数据：10个主要阶段
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
    id: 'exploration',
    name: '需求探索',
    nameEn: 'Exploration',
    order: 1,
    description: '发现和定义商业机会，初步了解用户需求',
    activities: [
      '市场调研',
      '用户访谈',
      '竞品分析',
      '可行性评估',
      '商业价值分析'
    ],
    deliverables: [
      '市场需求文档',
      '机会分析报告',
      '初步预算估算',
      '项目建议书'
    ],
    kpis: [
      '机会识别准确率',
      '调研覆盖率',
      '需求理解深度'
    ]
  },
  {
    id: 'requirements',
    name: '需求分析',
    nameEn: 'Requirements',
    order: 2,
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
      '需求完整性',
      '需求一致性',
      '用户满意度预测'
    ]
  },
  {
    id: 'architecture',
    name: '架构设计',
    nameEn: 'Architecture',
    order: 3,
    description: '设计系统整体架构和技术选型',
    activities: [
      '系统架构设计',
      '技术选型',
      '架构评审',
      '非功能性需求分析',
      '风险评估'
    ],
    deliverables: [
      '架构设计文档(ADD)',
      '技术选型报告',
      '系统架构图',
      '部署架构图',
      '数据库设计文档'
    ],
    kpis: [
      '架构可扩展性',
      '性能可预测性',
      '技术风险控制'
    ]
  },
  {
    id: 'detailed-design',
    name: '详细设计',
    nameEn: 'Detailed Design',
    order: 4,
    description: '设计模块接口、类和数据库结构',
    activities: [
      '模块设计',
      'API 接口设计',
      '数据库详细设计',
      '类设计',
      '时序图设计'
    ],
    deliverables: [
      '详细设计文档(DDD)',
      'API 接口文档',
      '数据库 ER 图',
      '类图和时序图',
      '测试计划'
    ],
    kpis: [
      '设计覆盖率',
      '接口一致性',
      '设计可维护性'
    ]
  },
  {
    id: 'implementation',
    name: '编码实现',
    nameEn: 'Implementation',
    order: 5,
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
      '代码质量',
      '测试覆盖率',
      '开发效率',
      '缺陷密度'
    ]
  },
  {
    id: 'unit-testing',
    name: '单元测试',
    nameEn: 'Unit Testing',
    order: 6,
    description: '对代码单元进行独立测试',
    activities: [
      '测试用例设计',
      '单元测试执行',
      '测试覆盖率分析',
      '缺陷修复',
      '测试报告编写'
    ],
    deliverables: [
      '单元测试用例',
      '测试覆盖率报告',
      '缺陷报告',
      '测试总结报告'
    ],
    kpis: [
      '测试覆盖率',
      '缺陷发现率',
      '测试执行效率'
    ]
  },
  {
    id: 'integration-testing',
    name: '集成测试',
    nameEn: 'Integration Testing',
    order: 7,
    description: '测试模块间的集成和系统功能',
    activities: [
      '集成测试用例设计',
      '接口测试',
      '系统集成',
      '端到端测试',
      '性能测试'
    ],
    deliverables: [
      '集成测试用例',
      '集成测试报告',
      '性能测试报告',
      '缺陷修复记录'
    ],
    kpis: [
      '集成成功率',
      '性能达标率',
      '缺陷修复率'
    ]
  },
  {
    id: 'deployment',
    name: '部署发布',
    nameEn: 'Deployment',
    order: 8,
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
      '发布时间',
      '回滚率',
      '服务可用性'
    ]
  },
  {
    id: 'maintenance',
    name: '运维监控',
    nameEn: 'Maintenance',
    order: 9,
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
      '系统可用性',
      '平均响应时间',
      '故障恢复时间',
      '资源利用率'
    ]
  },
  {
    id: 'termination',
    name: '项目终止',
    nameEn: 'Termination',
    order: 10,
    description: '项目生命周期结束或系统下线',
    activities: [
      '项目总结',
      '经验归档',
      '数据归档',
      '资源释放',
      '知识转移'
    ],
    deliverables: [
      '项目总结报告',
      '经验教训文档',
      '归档数据',
      '知识库文档',
      '资产处置报告'
    ],
    kpis: [
      '知识沉淀率',
      '资源回收率',
      '项目成功率',
      '团队成长度'
    ]
  }
]

export function getStageById(id: string): DevelopmentStage | undefined {
  return developmentStages.find(stage => stage.id === id)
}

export function getStageByOrder(order: number): DevelopmentStage | undefined {
  return developmentStages.find(stage => stage.order === order)
}
