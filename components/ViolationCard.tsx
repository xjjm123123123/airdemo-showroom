import React from 'react';
import { AlertTriangle, MapPin, Clock, ShieldAlert } from 'lucide-react';

interface ViolationCardProps {
  imageUrl: string;
  violationType: string;
  confidence: number;
  description: string;
  location: string;
  department: string;
  date: string;
  time: string;
  onViewDetails?: () => void;
}

const ViolationCard: React.FC<ViolationCardProps> = ({
  imageUrl,
  violationType,
  confidence,
  description,
  location,
  department,
  date,
  time,
  onViewDetails,
}) => {
  const confidencePercent = (confidence * 100).toFixed(1);
  
  // 根据违规类型生成具体的违规行为细则
  const getViolationDetails = (type: string): string[] => {
    const detailsMap: Record<string, string[]> = {
      '在岗玩手机': [
        '员工在工作岗位使用手机，存在安全隐患',
        '违反《员工行为规范》第3.2条：工作时间禁止使用个人手机',
        '可能导致注意力分散，影响生产安全和工作效率'
      ],
      '走路玩手机': [
        '员工在行走过程中使用手机，存在碰撞和跌倒风险',
        '违反《安全生产管理规定》第5.1条：厂区内行走需保持注意力集中',
        '可能造成人身伤害或设备损坏'
      ],
      '睡岗': [
        '员工在岗位睡觉，严重影响工作效率和安全生产',
        '违反《员工行为规范》第2.1条：工作时间必须保持清醒状态',
        '可能导致安全事故和生产延误'
      ],
      '不符合5s标准': [
        '现场环境存在脏乱情况，物品摆放不规范',
        '违反《5S管理标准》：整理、整顿、清扫、清洁、素养',
        '影响工作效率和现场安全，需立即整改'
      ],
      '违规翻越围栏': [
        '人员违规翻越安全围栏，存在重大安全隐患',
        '违反《安全生产管理规定》第4.3条：禁止翻越安全防护设施',
        '可能造成高空坠落或其他严重安全事故'
      ],
      '未佩戴安全帽': [
        '员工在生产区域未佩戴安全帽',
        '违反《劳动防护用品管理规定》第2.1条：进入生产区域必须佩戴安全帽',
        '存在头部受伤风险，需立即整改'
      ],
      '未穿工作服': [
        '员工未按规定穿着工作服',
        '违反《员工着装管理规定》第1.2条：工作时间必须穿着统一工作服',
        '影响企业形象和现场管理规范'
      ],
      '通道堵塞': [
        '消防通道或安全通道被物品堵塞',
        '违反《消防安全管理规定》第3.4条：保持消防通道畅通',
        '存在重大安全隐患，影响紧急疏散'
      ],
      '设备未定期维护': [
        '设备未按计划进行定期维护保养',
        '违反《设备管理规定》第6.2条：设备必须按周期进行维护',
        '可能导致设备故障和生产事故'
      ],
      '电气线路老化': [
        '电气线路存在老化现象，存在安全隐患',
        '违反《电气安全管理规定》第4.1条：及时更换老化线路',
        '可能引发火灾或触电事故'
      ],
      '废水废气违规排放': [
        '废水废气排放不符合环保标准',
        '违反《环境保护管理规定》第5.3条：排放必须达标',
        '可能造成环境污染和法律责任'
      ]
    };
    
    return detailsMap[type] || [
      `检测到${type}违规行为`,
      '违反相关安全生产管理规定',
      '建议立即整改并加强现场管理'
    ];
  };
  
  const violationDetails = getViolationDetails(violationType);
  
  return (
    <div className="bg-white rounded-[var(--radius-lg)] overflow-hidden shadow-sm border border-gray-200 my-3 animate-fadeIn">
      {/* 头部 - 蓝色背景 */}
      <div className="bg-[#E8F3FF] px-4 py-3 border-b border-[#D0E7FF]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#3370FF]" />
          <span className="text-[#3370FF] font-semibold text-sm">AI 巡检违规识别</span>
        </div>
      </div>

      {/* 图片区域 */}
      <div className="p-0">
        <img 
          src={imageUrl} 
          alt="违规图像" 
          className="w-full h-48 object-cover"
        />
      </div>

      {/* 内容区域 */}
      <div className="p-4 space-y-3">
        {/* 违规情况卡片 - 蓝色背景 */}
        <div className="bg-[#E8F3FF] rounded-[var(--radius-md)] p-3 border border-[#D0E7FF]">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-[#3370FF]" />
            <span className="text-[#3370FF] font-semibold text-xs">{violationType}</span>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed space-y-1">
            {violationDetails.map((detail, index) => (
              <div key={index}>• {detail}</div>
            ))}
          </div>
        </div>

        {/* 位置信息卡片 - 浅蓝色背景 */}
        <div className="bg-[#F0F8FF] rounded-[var(--radius-md)] p-3 border border-[#D9ECFF]">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-[#5B8FF9]" />
            <span className="text-[#5B8FF9] font-semibold text-xs">位置信息</span>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed space-y-1">
            <div>• 点位：{location}</div>
            <div>• 部门：{department}</div>
            <div>• AI置信度：{confidencePercent}%</div>
          </div>
        </div>

        {/* 时间信息卡片 - 青色背景 */}
        <div className="bg-[#E6F7FF] rounded-[var(--radius-md)] p-3 border border-[#BAE7FF]">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-[#1890FF]" />
            <span className="text-[#1890FF] font-semibold text-xs">时间信息</span>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed space-y-1">
            <div>• 日期：{date}</div>
            <div>• 抓取时间：{time}</div>
            <div>• 详细描述：{description}</div>
          </div>
        </div>

        {/* 操作按钮 - 蓝色填充 */}
        <button 
          onClick={onViewDetails}
          className="w-full bg-[#3370FF] hover:bg-[#2B5DD1] text-white py-2.5 rounded-[var(--radius-md)] text-xs font-medium transition-all shadow-sm"
        >
          立即查看详情
        </button>
      </div>
    </div>
  );
};

export default ViolationCard;
