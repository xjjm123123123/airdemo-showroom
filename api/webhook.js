/**
 * Vercel Serverless 函数 - 飞书 Webhook 代理
 * 用于绕过 CORS 限制，将违规记录写入飞书多维表格
 */

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: '只支持 POST 请求' 
    });
  }

  // 飞书 Webhook URL（从环境变量读取）
  const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL || 
    'https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb';

  console.log('📤 [Webhook 代理] 收到请求');
  console.log('📦 请求体:', JSON.stringify(req.body, null, 2));

  try {
    // 转发请求到飞书 Webhook
    const response = await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    console.log('📨 飞书响应状态:', response.status, response.statusText);

    // 获取响应内容
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('📥 飞书响应内容:', data);

    // 返回响应
    if (response.ok) {
      console.log('✅ Webhook 调用成功');
      return res.status(200).json({
        success: true,
        message: '数据已成功写入飞书多维表格',
        data: data,
      });
    } else {
      console.error('❌ 飞书返回错误:', response.status);
      return res.status(response.status).json({
        success: false,
        error: '飞书 API 返回错误',
        status: response.status,
        data: data,
      });
    }
  } catch (error) {
    console.error('❌ Webhook 代理失败:', error);
    return res.status(500).json({
      success: false,
      error: 'Webhook 调用失败',
      message: error.message,
    });
  }
}
