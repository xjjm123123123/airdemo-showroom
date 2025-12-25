# AILY 分析工作台 LLM 配置说明

## 🎯 配置状态

✅ **已完成配置！** 你的中转 API 已经正确配置。

## ✅ 当前配置

- **API Key**: `sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495`
- **API 地址**: `https://api.zhizengzeng.com/v1/`
- **服务状态**: 运行中 (http://localhost:8080)

## 🚀 立即测试

1. 打开浏览器访问：http://localhost:8080
2. 点击进入 "AI 智能巡检" Demo
3. 点击任意违规记录的图片
4. 查看 AILY 的 AI 分析结果

如果看到详细的 AI 分析（而不是模拟数据），说明配置成功！

## 🔧 已完成的修复

1. ✅ 修复了 Gemini API 调用代码（图像分析）
2. ✅ 修复了 AILY 对话功能（文本对话）
3. ✅ 添加了中转 API 支持（使用 OpenAI 兼容格式）
4. ✅ 配置了你的 API Key 和 BASE_URL
5. ✅ 更新了环境变量配置
6. ✅ 重启了开发服务器
7. ✅ 修复了 400 错误（改用 fetch 直接调用中转 API）
8. ✅ 统一了所有 AI 调用方式（图像分析 + 文本对话）

## 🔍 技术实现

代码会自动检测是否配置了 `GEMINI_BASE_URL`：
- **有配置**: 使用 OpenAI 兼容格式调用中转 API (`/chat/completions` 接口)
- **无配置**: 使用官方 Gemini SDK 调用 Google API

这样既支持中转 API，也支持官方 API，灵活切换。

### 修复的功能点

1. **图像分析** (`services/aiVisionService.ts`)
   - 点击违规记录图片时的 AI 视觉分析
   - 自动识别违规类型、置信度、描述

2. **文本对话** (`views/Workspace.tsx`)
   - AILY 分析工作台的对话功能
   - 支持业务上下文、提示词模板
   - 基于表格数据的深度分析

## 📝 技术细节

- **LLM 模型**：Gemini 2.0 Flash Exp
- **API 方式**：中转 API（支持自定义 BASE_URL）
- **功能**：多模态图像分析，识别工厂违规行为
- **代码位置**：`services/aiVisionService.ts`
- **配置文件**：`.env`（环境变量）、`vite.config.ts`（Vite 配置）

## 🔍 调试方法

如果遇到问题，打开浏览器开发者工具（F12），查看 Console 标签页：
- 会显示 "使用自定义 API 地址: https://api.zhizengzeng.com/v1/"
- 会显示 "Gemini API 响应: ..." 查看 API 返回内容
- 如果有错误会显示详细的错误信息

## 📋 环境变量说明

`.env` 文件配置：
```bash
GEMINI_API_KEY=sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495
GEMINI_BASE_URL=https://api.zhizengzeng.com/v1/
```

- `GEMINI_API_KEY`: 你的中转 API Key
- `GEMINI_BASE_URL`: 中转 API 的基础地址（可选，不配置则使用 Google 官方地址）

## ❓ 常见问题

**Q: 如何确认 API 是否正常工作？**
A: 查看浏览器控制台，如果看到 "Gemini API 响应" 日志且有 JSON 内容，说明 API 调用成功。

**Q: 如果 API 调用失败会怎样？**
A: 系统会自动降级使用模拟数据，不会影响演示效果。

**Q: 如何更换 API Key？**
A: 修改 `.env` 文件中的 `GEMINI_API_KEY`，保存后重启服务器即可。
