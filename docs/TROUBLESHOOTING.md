# AILY 故障排查指南

## 🔍 如何查看详细日志

1. 打开浏览器（推荐 Chrome）
2. 按 F12 打开开发者工具
3. 切换到 "Console" 标签页
4. 刷新页面并进行操作

## 📊 日志说明

### 图像分析日志（点击违规记录图片时）

成功的日志应该显示：
```
🔍 使用中转 API 进行图像分析: https://api.zhizengzeng.com/v1/
📍 分析点位: 东门卫-仓库
🔑 API Key: sk-zk234ba...
📥 正在获取图片: http://...
✅ 图片已转换为 base64，长度: 123456
📤 发送请求到: https://api.zhizengzeng.com/v1/chat/completions
📦 请求模型: gemini-2.0-flash-exp
📨 响应状态: 200 OK
✅ API 响应成功: {...}
📝 AI 返回内容: {"hasViolation": true, ...}
```

### 文本对话日志（AILY 对话框）

成功的日志应该显示：
```
使用中转 API 进行对话: https://api.zhizengzeng.com/v1/
API Key: sk-zk234ba...
请求模型: gemini-2.0-flash-exp
请求体: {...}
响应状态: 200 OK
API 响应数据: {...}
```

## ❌ 常见错误及解决方案

### 错误 1: 未配置 API Key

**日志显示：**
```
未配置 GEMINI_API_KEY，使用模拟分析结果
```

**解决方案：**
1. 检查 `.env` 文件是否存在
2. 确认 `GEMINI_API_KEY` 已正确配置
3. 重启开发服务器

### 错误 2: API 返回 400 Bad Request

**日志显示：**
```
❌ API 错误响应: {"error": "invalid model"}
```

**可能原因：**
- 中转 API 不支持 `gemini-2.0-flash-exp` 模型

**解决方案：**
联系中转 API 提供商，确认支持的模型列表，然后修改代码中的模型名称。

常见的模型名称：
- `gemini-pro`
- `gemini-pro-vision`
- `gpt-4-vision-preview`
- `gpt-4o`

### 错误 3: API 返回 401 Unauthorized

**日志显示：**
```
❌ API 错误响应: {"error": "invalid api key"}
```

**解决方案：**
1. 检查 API Key 是否正确（没有多余空格）
2. 确认 API Key 是否有效（未过期）
3. 联系中转 API 提供商确认 Key 状态

### 错误 4: API 返回 429 Too Many Requests

**日志显示：**
```
❌ API 错误响应: {"error": "rate limit exceeded"}
```

**解决方案：**
- 等待一段时间后重试
- 或联系中转 API 提供商升级配额

### 错误 5: Network Error / CORS Error

**日志显示：**
```
Access to fetch at '...' has been blocked by CORS policy
```

**解决方案：**
1. 确认中转 API 支持浏览器跨域请求
2. 或在 `vite.config.ts` 中添加代理配置

### 错误 6: 图片加载失败

**日志显示：**
```
获取图像失败: Failed to fetch
```

**解决方案：**
- 检查图片 URL 是否可访问
- 确认网络连接正常

## 🧪 测试步骤

### 1. 测试环境变量

在浏览器控制台输入：
```javascript
console.log('API Key:', process.env.GEMINI_API_KEY);
console.log('Base URL:', process.env.GEMINI_BASE_URL);
```

应该显示你配置的值。

### 2. 测试图像分析

1. 进入 "AI 智能巡检" Demo
2. 点击任意违规记录的图片
3. 查看控制台日志
4. 等待 AILY 返回分析结果

### 3. 测试文本对话

1. 在 AILY 对话框输入 "你好"
2. 查看控制台日志
3. 等待 AI 回复

## 🔧 降级方案

如果 API 一直无法正常工作，系统会自动使用模拟数据：

- **图像分析**：随机生成违规类型和描述
- **文本对话**：显示 "AI 响应异常，请重试"

模拟数据不影响演示效果，可以继续使用。

## 📞 获取帮助

如果问题仍未解决，请提供以下信息：

1. 浏览器控制台的完整日志（截图或文本）
2. `.env` 文件配置（隐藏 API Key 的后半部分）
3. 中转 API 提供商的文档链接
4. 具体的操作步骤和错误现象

可以在项目 Issues 中提问，或联系技术支持。
