/**
 * Vercel Serverless 函数 - 飞书 Aily 对话代理
 * 目的：前端首页对话不直接暴露密钥，统一走后端安全调用 Aily OpenAPI。
 *
 * 依赖：@larksuiteoapi/node-sdk
 * 参考：飞书 aily 开放能力快速上手（completions.create）
 */

import lark from '@larksuiteoapi/node-sdk';

export default async function handler(req, res) {
  // 允许预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: '只支持 POST 请求',
    });
  }

  const LARK_APP_ID = process.env.LARK_APP_ID;
  const LARK_APP_SECRET = process.env.LARK_APP_SECRET;
  const AILY_APP_ID = process.env.AILY_APP_ID;

  if (!LARK_APP_ID || !LARK_APP_SECRET || !AILY_APP_ID) {
    return res.status(500).json({
      success: false,
      error: 'Missing server config',
      message: '缺少服务端环境变量：LARK_APP_ID / LARK_APP_SECRET / AILY_APP_ID',
    });
  }

  const body = req.body || {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Bad request',
      message: 'message 不能为空',
    });
  }

  try {
    const client = new lark.Client({
      appId: LARK_APP_ID,
      appSecret: LARK_APP_SECRET,
    });

    const aily = new lark.aily({ client });

    const resp = await aily.completions.create({
      message,
      ailyAppId: AILY_APP_ID,
    });

    const answer =
      (typeof resp?.content === 'string' && resp.content) ||
      (typeof resp?.data?.content === 'string' && resp.data.content) ||
      (typeof resp?.data?.message === 'string' && resp.data.message) ||
      '';

    return res.status(200).json({
      success: true,
      answer: answer || '（Aily 未返回文本内容）',
    });
  } catch (error) {
    console.error('❌ [Aily Proxy] 调用失败:', error);
    return res.status(500).json({
      success: false,
      error: 'Aily request failed',
      message: error?.message || String(error),
    });
  }
}

