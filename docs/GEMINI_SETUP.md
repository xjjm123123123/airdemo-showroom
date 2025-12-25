# Gemini API 配置指南

## 快速开始

### 1. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 使用 Google 账号登录
3. 点击 "Create API Key" 创建新的 API Key
4. 复制生成的 API Key

### 2. 配置环境变量

1. 在项目根目录找到 `.env` 文件（如果没有，复制 `.env.example` 并重命名为 `.env`）
2. 将 `GEMINI_API_KEY` 的值替换为你的实际 API Key：

```bash
GEMINI_API_KEY=AIzaSy...你的实际Key
```

### 3. 重启开发服务器

配置完成后，重启开发服务器使环境变量生效：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

## 验证配置

1. 打开浏览器访问 http://localhost:8080
2. 进入 "AI 智能巡检" Demo
3. 点击任意违规记录的图片
4. 查看 AILY 分析结果

如果配置正确，你应该能看到 AI 生成的分析结果。如果 API Key 未配置或无效，系统会自动使用模拟数据。

## 常见问题

### Q: API Key 无效怎么办？

A: 请检查：
- API Key 是否正确复制（没有多余空格）
- API Key 是否已启用
- 是否重启了开发服务器

### Q: 如何查看 API 调用日志？

A: 打开浏览器开发者工具（F12），查看 Console 标签页，会显示 API 调用的详细日志。

### Q: API 有使用限制吗？

A: Gemini API 有免费额度限制，具体请查看 [Google AI Studio 定价](https://ai.google.dev/pricing)。

## 技术细节

项目使用 `@google/genai` SDK 调用 Gemini 2.0 Flash 模型进行图像分析。

相关代码文件：
- `services/aiVisionService.ts` - AI 视觉分析服务
- `vite.config.ts` - 环境变量配置
