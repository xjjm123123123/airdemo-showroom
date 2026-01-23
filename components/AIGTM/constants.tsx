import React from 'react';
import { Mail, Search, Users, Database, Globe, Sparkles } from 'lucide-react';
import { SuggestionCard, TableRow, EnrichmentTool } from './types';

export const SUGGESTIONS: SuggestionCard[] = [
  {
    id: '1',
    title: '查找邮箱',
    description: '从 LinkedIn URL 获取经过验证的工作邮箱。',
    icon: <Mail className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />,
  },
  {
    id: '2',
    title: '公司调研',
    description: '总结近期新闻和产品发布。',
    icon: <Search className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />,
  },
  {
    id: '3',
    title: '查找人员',
    description: '查找特定职位的联系信息。',
    icon: <Users className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />,
  },
  {
    id: '4',
    title: '验证域名',
    description: '检查网站是否活跃且有效。',
    icon: <Globe className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />,
  }
];

export const MOCK_ROWS: TableRow[] = [
  {
    id: 'row-1',
    company: 'Perplexity AI',
    logo: 'https://logo.clearbit.com/perplexity.ai',
    domain: 'perplexity.ai',
    industry: '科技',
    size: '11-50',
    enrichmentStatus: 'complete',
    enrichmentValue: 'Aravind Srinivas',
  },
  {
    id: 'row-2',
    company: 'Meta',
    logo: 'https://logo.clearbit.com/meta.com',
    domain: 'meta.com',
    industry: '社交媒体',
    size: '10,001+',
    enrichmentStatus: 'complete',
    enrichmentValue: 'Mark Zuckerberg',
  },
  {
    id: 'row-3',
    company: 'Linear',
    logo: 'https://logo.clearbit.com/linear.app',
    domain: 'linear.app',
    industry: '软件',
    size: '11-50',
    enrichmentStatus: 'loading',
    enrichmentValue: '...',
  },
  {
    id: 'row-4',
    company: 'Notion',
    logo: 'https://logo.clearbit.com/notion.so',
    domain: 'notion.so',
    industry: '生产力',
    size: '201-500',
    enrichmentStatus: 'complete',
    enrichmentValue: 'Ivan Zhao',
  },
  {
    id: 'row-5',
    company: 'OpenAI',
    logo: 'https://logo.clearbit.com/openai.com',
    domain: 'openai.com',
    industry: 'AI 研究',
    size: '501-1,000',
    enrichmentStatus: 'pending',
    enrichmentValue: '-',
  },
  {
    id: 'row-6',
    company: 'Anthropic',
    logo: 'https://logo.clearbit.com/anthropic.com',
    domain: 'anthropic.com',
    industry: 'AI 研究',
    size: '201-500',
    enrichmentStatus: 'complete',
    enrichmentValue: 'Dario Amodei',
  },
  {
    id: 'row-7',
    company: 'Stripe',
    logo: 'https://logo.clearbit.com/stripe.com',
    domain: 'stripe.com',
    industry: '金融科技',
    size: '5,001-10,000',
    enrichmentStatus: 'complete',
    enrichmentValue: 'Patrick Collison',
  },
];

export const ENRICHMENT_TOOLS: EnrichmentTool[] = [
  {
    id: 'e1',
    name: '探探',
    description: '互动式调研、自动生成调研总结、实现规模化一线用户调研',
    provider: 'AI客户调研助手',
    icon: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.43.png',
    cost: 3,
    link: 'https://tantan.airdemo.cn/',
    categories: ['获客', '用户反馈']
  },
  {
    id: 'e2',
    name: '参参',
    description: '方案金句推荐、客户干系人及业务研究洞察、汇报故事线及案例推荐',
    provider: 'AI故事线参谋',
    icon: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.37.png',
    cost: 5,
    link: 'https://bytedance.larkoffice.com/share/base/form/shrcn5qfPJUyu3YJwTmWz0idEbf',
    categories: ['商机', '客户培训']
  },
  {
    id: 'e3',
    name: '呆呆',
    description: '一键生成Demo定制化数据、模拟客户真实知识库与飞阅会文档、搭建智能体所需提示词',
    provider: 'AI Demo素材助手',
    icon: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.58.png',
    cost: 10,
    link: 'https://aily.feishu.cn/agents/agent_4j12fz05we0z7',
    categories: ['商机']
  },
  {
    id: 'e4',
    name: '图图',
    description: '生成匹配飞书视觉风格的PPT配图、提升方案展示效果',
    provider: 'AI PPT插图助手',
    icon: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.58.png',
    cost: 2,
    link: 'https://bytedance.larkoffice.com/app/PwQtb3EjOa4nIOsgtnBcxeMQnud?chunked=false&pageId=pgepRQZvt4TG14Kb',
    categories: ['商机']
  },
  {
    id: 'e5',
    name: '蕊蕊',
    description: '对方案汇报进行复盘、给出改进建议、提升销售团队整体水平',
    provider: 'AI汇报复盘助手',
    icon: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.37.png',
    cost: 8,
    link: 'https://ruirui.airdemo.cn/',
    categories: ['签约']
  },
  {
    id: 'e6',
    name: '建联小助手',
    description: '通过结构化搜索客户的高管、股东、上下游信息，与飞书内部资源碰撞后，形成建联策略推荐，输出标准化的《深度建联情报与资源匹配报告》。',
    provider: '易建联小助手',
    icon: '/images/connection-assistant.jpeg',
    cost: 5,
    link: '#',
    categories: ['获客', '商机']
  },
  {
    id: 'e7',
    name: 'gtm小助手',
    description: '辅助 GTM 流程的智能助手',
    provider: 'GTM 智能助手',
    icon: '🚀',
    cost: 5,
    link: '#',
    categories: ['获客', '商机']
  }
];
