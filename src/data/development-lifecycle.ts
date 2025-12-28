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
    id: 'exploration',
    name: '探索与定义',
    nameEn: 'Exploration & Definition',
    order: 1,
    description: '市场调研、商业论证、利益相关者识别',
    activities: [
      '市场调研',
      '商业论证',
      '利益相关者识别'
    ],
    deliverables: [
      '商业案例',
      '项目章程',
      '愿景文档'
    ],
    kpis: [
      '市场机会大小',
      '投资回报率',
      '战略契合度',
      '利益相关者支持'
    ]
  },
  {
    id: 'feasibility',
    name: '可行性分析',
    nameEn: 'Feasibility Analysis',
    order: 2,
    description: '技术/运营/经济可行性研究，风险评估',
    activities: [
      '技术可行性研究',
      '运营可行性研究',
      '经济可行性研究',
      '风险评估'
    ],
    deliverables: [
      '可行性分析报告',
      '风险评估矩阵'
    ],
    kpis: [
      '技术能力匹配',
      '时间与成本估算精度',
      '合规与安全风险'
    ]
  },
  {
    id: 'requirements',
    name: '需求分析',
    nameEn: 'Requirements',
    order: 3,
    description: '需求收集、分析、建模、优先级排序',
    activities: [
      '需求收集',
      '需求分析',
      '需求建模',
      '优先级排序'
    ],
    deliverables: [
      '需求规格说明书',
      '用户故事地图',
      '原型'
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
    name: '系统设计',
    nameEn: 'System Design',
    order: 4,
    description: '架构设计、技术选型、接口设计、数据模型设计',
    activities: [
      '架构设计',
      '技术选型',
      '接口设计',
      '数据模型设计'
    ],
    deliverables: [
      '系统架构图',
      '技术方案文档',
      'API规范',
      '数据库Schema'
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
    name: '详细设计与实现',
    nameEn: 'Detailed Design & Implementation',
    order: 5,
    description: '模块详细设计、编码、单元测试、代码评审',
    activities: [
      '模块详细设计',
      '编码',
      '单元测试',
      '代码评审'
    ],
    deliverables: [
      '可工作的软件',
      '详细设计文档',
      '单元测试用例'
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
    order: 6,
    description: '集成测试、系统测试、性能测试、用户验收测试',
    activities: [
      '集成测试',
      '系统测试',
      '性能测试',
      '用户验收测试'
    ],
    deliverables: [
      '测试报告',
      '缺陷跟踪列表',
      '质量评估报告'
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
    name: '部署与发布',
    nameEn: 'Deployment & Release',
    order: 7,
    description: '环境准备、CI/CD流水线执行、上线部署、验证',
    activities: [
      '环境准备',
      'CI/CD流水线执行',
      '上线部署',
      '验证'
    ],
    deliverables: [
      '线上运行的系统',
      '发布记录',
      '部署脚本'
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
    name: '运营与监控',
    nameEn: 'Operations & Monitoring',
    order: 8,
    description: '系统监控、日志分析、故障响应、性能调优、容量规划',
    activities: [
      '系统监控',
      '日志分析',
      '故障响应',
      '性能调优',
      '容量规划'
    ],
    deliverables: [
      '系统仪表盘',
      '运维SOP',
      '事故报告',
      '容量计划'
    ],
    kpis: [
      '系统可用性(SLA)',
      '平均恢复时间(MTTR)',
      '监控覆盖率',
      '告警准确率'
    ]
  },
  {
    id: 'evolution',
    name: '维护与演进',
    nameEn: 'Maintenance & Evolution',
    order: 9,
    description: 'Bug修复、功能迭代、技术重构、文档更新',
    activities: [
      'Bug修复',
      '功能迭代',
      '技术重构',
      '文档更新'
    ],
    deliverables: [
      '软件新版本',
      '技术债看板',
      '用户反馈报告'
    ],
    kpis: [
      '变更成功率',
      '技术债水平',
      '演进成本',
      '用户满意度'
    ]
  },
  {
    id: 'termination',
    name: '终止',
    nameEn: 'Termination',
    order: 10,
    description: '数据迁移与归档、服务下线、知识转移、资源回收',
    activities: [
      '数据迁移与归档',
      '服务下线',
      '知识转移',
      '资源回收'
    ],
    deliverables: [
      '系统退役报告',
      '归档数据',
      '经验教训总结'
    ],
    kpis: [
      '数据合规性',
      '资源释放完整性',
      '知识留存度'
    ]
  }
]

export function getStageById(id: string): DevelopmentStage | undefined {
  return developmentStages.find(stage => stage.id === id)
}

export function getStageByOrder(order: number): DevelopmentStage | undefined {
  return developmentStages.find(stage => stage.order === order)
}
