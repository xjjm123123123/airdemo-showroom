import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import lark from '@larksuiteoapi/node-sdk';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// 解析JSON请求体
app.use(express.json());

// 处理 /api/aily 请求
app.post('/api/aily', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing message parameter' 
      });
    }

    // 验证环境变量
    const { LARK_APP_ID, LARK_APP_SECRET, AILY_APP_ID } = process.env;

    if (!LARK_APP_ID || !LARK_APP_SECRET || !AILY_APP_ID) {
      return res.status(500).json({
        success: false,
        error: 'Missing required environment variables'
      });
    }

    // 初始化飞书客户端
    const client = new lark.Client({
      appId: LARK_APP_ID,
      appSecret: LARK_APP_SECRET,
    });

    // 创建Aily实例
    const aily = new lark.Aily({ client });

    // 调用Aily对话API
    const resp = await aily.completions.create({
      message,
      ailyAppId: AILY_APP_ID,
    });

    // 提取答案
    const answer =
      (typeof resp?.content === 'string' && resp.content) ||
      (typeof resp?.data?.content === 'string' && resp.data.content) ||
      (typeof resp?.data?.message === 'string' && resp.data.message) ||
      '';

    res.json({
      success: true,
      answer: answer || '（Aily 未返回文本内容）',
    });

  } catch (error) {
    console.error('❌ [Aily Proxy] 调用失败:', error);
    console.error('错误详情:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get response from Aily',
      details: error?.response?.data || error?.response?.body,
    });
  }
});

// 创建Vite服务器
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

// 使用Vite的中间件
app.use(vite.middlewares);

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 开发服务器已启动`);
  console.log(`📦 前端: http://localhost:${PORT}`);
  console.log(`🤖 API:  http://localhost:${PORT}/api/aily`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});
