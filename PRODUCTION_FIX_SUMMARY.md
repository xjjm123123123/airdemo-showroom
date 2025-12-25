# 生产环境问题修复总结

## 问题描述

线上环境（airdemo.cn）存在两个问题：
1. **AI 巡检分析选择点位后显示空白**
2. **检查结果没有写回多维表格**

## 根本原因分析

### 问题 1: 选择点位后显示空白

可能的原因：
- API 调用失败但错误信息未正确显示
- 图片 URL 在生产环境无法访问
- 环境变量未正确配置

### 问题 2: 未写回多维表格

**核心原因：** Vite 开发服务器的代理功能在生产环境不可用

- **开发环境**：Vite 提供代理服务器，可以绕过 CORS 限制
  ```
  前端 → /api/webhook/xxx → Vite 代理 → 飞书 API
  ```

- **生产环境**：只有静态文件，没有代理服务器
  ```
  前端 → /api/webhook/xxx → 404 (代理不存在)
  或
  前端 → 飞书 API → CORS 错误 (跨域被阻止)
  ```

## 已实施的修复

### 1. 添加环境变量支持

修改了 `services/larkBaseService.ts`，支持通过环境变量配置 Webhook URL：

```typescript
const CONFIG = {
  QUERY_CHECKPOINT_WEBHOOK: import.meta.env.VITE_QUERY_CHECKPOINT_WEBHOOK || '',
  WRITE_VIOLATION_WEBHOOK: import.meta.env.VITE_WRITE_VIOLATION_WEBHOOK || '/api/webhook/event/...',
};
```

### 2. 改进错误处理和日志

- 添加详细的控制台日志，便于诊断问题
- 改进错误提示，明确告知用户问题原因
- 在 Webhook 调用失败时提供解决方案提示

### 3. 创建诊断文档

- `docs/PRODUCTION_DEPLOYMENT.md` - 生产环境部署指南
- `docs/DIAGNOSTIC_SCRIPT.md` - 浏览器控制台诊断脚本

## 生产环境解决方案

### 方案 A: 使用演示模式（推荐，快速）

**优点：**
- 无需额外配置
- 分析功能完全正常
- 结果会显示在前端界面

**缺点：**
- 不会真正写入飞书多维表格
- 刷新页面后数据会丢失

**实施步骤：**
1. 不配置 `VITE_WRITE_VIOLATION_WEBHOOK` 环境变量
2. 系统会自动使用演示模式
3. 控制台会显示 "⚠️ [演示模式] 未配置 Webhook URL"

### 方案 B: 配置后端代理服务（推荐，生产）

**优点：**
- 可以真正写入飞书多维表格
- 解决 CORS 跨域问题
- 更安全（可以在后端验证和过滤请求）

**实施步骤：**

1. **创建后端代理服务**（示例使用 Express.js）

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// 代理 Webhook 请求
app.post('/api/webhook/proxy', async (req, res) => {
  try {
    const response = await fetch(
      'https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      }
    );
    
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Webhook 代理失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 静态文件服务
app.use(express.static('dist'));

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

2. **配置环境变量**

在生产环境的 `.env` 文件中添加：

```bash
VITE_WRITE_VIOLATION_WEBHOOK=https://your-domain.com/api/webhook/proxy
```

3. **重新构建和部署**

```bash
npm run build
node server.js
```

### 方案 C: 使用 Serverless 函数（推荐，云部署）

如果使用 Vercel、Netlify 等平台，可以创建 Serverless 函数：

**Vercel 示例：**

```javascript
// api/webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      'https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

然后配置：
```bash
VITE_WRITE_VIOLATION_WEBHOOK=https://your-app.vercel.app/api/webhook
```

## 如何诊断生产环境问题

### 1. 打开浏览器控制台

访问 https://airdemo.cn，按 F12 打开开发者工具

### 2. 运行诊断脚本

复制 `docs/DIAGNOSTIC_SCRIPT.md` 中的脚本到控制台运行

### 3. 查看日志输出

进行一次 AI 巡检分析，观察控制台日志：

```
✅ 正常流程：
🔍 使用中转 API 进行图像分析
📍 分析点位: 东门卫-仓库
📥 正在获取图片
✅ 图片已转换为 base64
📤 发送请求到 API
📨 响应状态: 200 OK
✅ API 响应成功
📝 开始写入违规记录
✅ Webhook 请求成功

❌ 问题流程：
🔍 使用中转 API 进行图像分析
📍 分析点位: 东门卫-仓库
❌ 获取图像失败: 404
或
📝 开始写入违规记录
❌ 写入违规记录失败: CORS error
💡 提示：可能是 CORS 跨域问题
```

### 4. 检查关键配置

在控制台执行：

```javascript
// 检查环境变量
console.log('API Key:', process.env.GEMINI_API_KEY ? '已配置' : '未配置');
console.log('Base URL:', process.env.GEMINI_BASE_URL);

// 检查图片
fetch('/images/东门卫-仓库.png').then(r => console.log('图片状态:', r.status));

// 检查 Webhook
fetch('/api/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
}).then(r => console.log('Webhook 状态:', r.status));
```

## 立即行动步骤

### 快速修复（5分钟）

1. **拉取最新代码**
   ```bash
   git pull origin main
   ```

2. **重新构建**
   ```bash
   npm run build
   ```

3. **部署到生产环境**
   - 上传 `dist/` 目录到服务器
   - 或使用 CI/CD 自动部署

4. **验证修复**
   - 访问 https://airdemo.cn
   - 打开控制台（F12）
   - 进行一次 AI 巡检分析
   - 查看日志输出

### 完整修复（30分钟）

如果需要真正写入多维表格：

1. **选择方案**（推荐方案 B 或 C）

2. **实施后端代理**
   - 创建代理服务器或 Serverless 函数
   - 配置环境变量
   - 重新部署

3. **测试验证**
   - 运行诊断脚本
   - 执行完整的 AI 巡检流程
   - 检查飞书多维表格是否有新记录

## 预期结果

### 修复后的正常流程

1. **用户操作**
   - 选择点位：东门卫-仓库
   - 点击"开始分析"

2. **系统响应**
   - 显示思考过程（带转圈动画）
   - 调用人员违规判断工作流
   - 正在查询点位图像数据
   - 正在进行 AI 视觉分析

3. **结果展示**
   - 显示蓝色违规卡片
   - 包含图片、违规类型、置信度等信息
   - 显示成功写入提示（或演示模式提示）

4. **数据写入**
   - 方案 A：仅前端显示，不写入表格
   - 方案 B/C：成功写入飞书多维表格

## 技术支持

如果问题仍未解决，请提供：

1. **浏览器控制台完整日志**（截图或文本）
2. **Network 标签页的请求详情**（截图）
3. **当前环境变量配置**（隐藏敏感信息）
4. **复现步骤**

联系方式：查看项目 README.md

## 相关文档

- `docs/PRODUCTION_DEPLOYMENT.md` - 详细的生产环境部署指南
- `docs/DIAGNOSTIC_SCRIPT.md` - 浏览器控制台诊断脚本
- `docs/TROUBLESHOOTING.md` - 常见问题排查指南
- `.env.example` - 环境变量配置示例

## 更新日志

**2025-12-25**
- ✅ 添加环境变量支持
- ✅ 改进错误处理和日志
- ✅ 创建生产环境部署文档
- ✅ 创建诊断脚本
- ✅ 提交代码到 GitHub

**下一步计划**
- 根据生产环境实际情况选择并实施解决方案
- 验证修复效果
- 优化用户体验
