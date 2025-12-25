/**
 * 飞书多维表格 Webhook 服务
 * 用于与飞书多维表格自动化进行交互
 */

// 点位数据结构
export interface CheckpointData {
  id: string;
  编号: number;
  点位: string;
  图像: string;
  附件?: string;
}

// 违规记录数据结构
export interface ViolationRecord {
  编号: number;
  日期: string;
  违规情况: string;
  违规记录?: string; // 图像 URL（可选，附件字段可能不支持）
  抓取时间: string;
  位置: string;
  部门: string;
  AI生成?: string;
}

// Webhook 响应类型
interface WebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// 配置 - Webhook URL（使用代理路径绕过 CORS）
const CONFIG = {
  // 查询点位数据的 Webhook（可选，不配置则使用模拟数据）
  QUERY_CHECKPOINT_WEBHOOK: (import.meta as any).env?.VITE_QUERY_CHECKPOINT_WEBHOOK || '',
  // 写入违规记录的 Webhook
  // 开发环境使用代理: /api/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb
  // 生产环境使用完整 URL（需要配置 VITE_WRITE_VIOLATION_WEBHOOK）
  WRITE_VIOLATION_WEBHOOK: (import.meta as any).env?.VITE_WRITE_VIOLATION_WEBHOOK || '/api/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb',
};

/**
 * 设置 Webhook URL 配置
 */
export const setWebhookConfig = (config: {
  queryCheckpointUrl?: string;
  writeViolationUrl?: string;
}) => {
  if (config.queryCheckpointUrl) {
    CONFIG.QUERY_CHECKPOINT_WEBHOOK = config.queryCheckpointUrl;
  }
  if (config.writeViolationUrl) {
    CONFIG.WRITE_VIOLATION_WEBHOOK = config.writeViolationUrl;
  }
};

/**
 * 从飞书多维表格查询点位记录
 * @param checkpoint 点位名称
 * @returns 点位数据（包含图像URL）
 */
export const queryCheckpointData = async (checkpoint: string): Promise<CheckpointData | null> => {
  // 演示模式：使用模拟数据
  if (!CONFIG.QUERY_CHECKPOINT_WEBHOOK) {
    return getMockCheckpointData(checkpoint);
  }

  try {
    const response = await fetch(CONFIG.QUERY_CHECKPOINT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'query',
        filter: {
          点位: checkpoint,
        },
      }),
    });

    const result: WebhookResponse = await response.json();
    if (result.success && result.data) {
      return result.data as CheckpointData;
    }
    return null;
  } catch (error) {
    console.error('查询点位数据失败:', error);
    return getMockCheckpointData(checkpoint);
  }
};

/**
 * 将违规记录写入飞书多维表格
 * @param record 违规记录
 * @returns 是否成功
 */
export const writeViolationRecord = async (record: ViolationRecord): Promise<boolean> => {
  console.log('📝 [writeViolationRecord] 开始写入违规记录');
  console.log('📦 记录内容:', record);
  console.log('🔧 Webhook URL:', CONFIG.WRITE_VIOLATION_WEBHOOK);
  
  // 演示模式：模拟写入成功
  if (!CONFIG.WRITE_VIOLATION_WEBHOOK) {
    console.log('⚠️ [演示模式] 未配置 Webhook URL，使用演示模式');
    console.log('📝 [演示模式] 写入违规记录:', record);
    return true;
  }

  try {
    // 构建请求体
    const requestBody = {
      action: 'create',
      record: {
        编号: record.编号,
        日期: record.日期,
        违规情况: record.违规情况,
        // 违规记录字段：图像 URL
        ...(record.违规记录 ? { 违规记录: record.违规记录 } : {}),
        抓取时间: record.抓取时间,
        位置: record.位置,
        部门: record.部门,
        // 如果有 AI生成 字段，也一并写入
        ...(record.AI生成 ? { AI生成: record.AI生成 } : {}),
      },
    };

    console.log('📤 发送 Webhook 请求:', CONFIG.WRITE_VIOLATION_WEBHOOK);
    console.log('📦 请求体:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(CONFIG.WRITE_VIOLATION_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📨 响应状态:', response.status, response.statusText);

    // 飞书 Webhook 可能返回空响应或简单状态
    if (response.ok) {
      console.log('✅ Webhook 请求成功');
      return true;
    }

    const result = await response.text();
    console.log('📥 Webhook 响应:', result);
    console.warn('⚠️ Webhook 返回非 2xx 状态码:', response.status);
    return false;
  } catch (error) {
    console.error('❌ 写入违规记录失败:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('💡 提示：可能是 CORS 跨域问题或网络连接失败');
      console.error('💡 解决方案：');
      console.error('   1. 在生产环境配置后端代理服务');
      console.error('   2. 或使用演示模式（不写入真实数据）');
    }
    return false;
  }
};

/**
 * 获取所有可用点位列表
 */
export const getCheckpointList = (): string[] => {
  return [
    '东门卫-仓库',
    '生产车间A区',
    '设备维修室',
    '物资储备库',
    '员工休息区',
  ];
};

/**
 * 获取图片 URL（本地开发使用相对路径）
 */
const getImageUrl = (checkpoint: string): string => {
  // 本地开发环境使用 public 目录下的图片
  const baseUrl = window?.location?.origin || '';
  return `${baseUrl}/images/${encodeURIComponent(checkpoint)}.png`;
};

/**
 * 模拟点位数据（演示用）
 */
const getMockCheckpointData = (checkpoint: string): CheckpointData | null => {
  const checkpoints = ['东门卫-仓库', '生产车间A区', '设备维修室', '物资储备库', '员工休息区'];
  
  if (!checkpoints.includes(checkpoint)) {
    return null;
  }

  const index = checkpoints.indexOf(checkpoint);
  return {
    id: String(index + 1),
    编号: index + 1,
    点位: checkpoint,
    图像: getImageUrl(checkpoint),
  };
};

/**
 * 生成新的编号
 */
export const generateNewId = (existingRecords: any[]): number => {
  if (!existingRecords || existingRecords.length === 0) return 1;
  const maxId = Math.max(...existingRecords.map(r => Number(r.编号) || 0));
  return maxId + 1;
};

/**
 * 获取当前时间戳（格式化）
 */
export const getCurrentTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 获取当前日期
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

