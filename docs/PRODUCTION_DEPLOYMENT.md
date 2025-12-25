# 生产环境部署指南

## 问题诊断

### 问题 1: AI 巡检分析选择点位后显示空白

**可能原因：**
1. 图片 URL 在生产环境无法访问（相对路径问题）
2. API 调用失败但错误未正确显示
3. 环境变量未正确配置

**解决方案：**

1. **检查浏览器控制台**
   - 打开开发者工具（F12）
   - 查看 Console 标签页的错误信息
   - 查看 Network 标签页，检查图片和 API 请求是否成功

2. **验证图片 URL**
   ```javascript
   // 在浏览器控制台执行
   console.log(window.location.origin);
   // 应该输出: https://airdemo.cn
   
   // 测试图片是否可访问
   fetch('https://airdemo.cn/images/东门卫-仓库.png')
     .then(r => console.log('图片状态:', r.status))
     .catch(e => console.error('图片加载失败:', e));
   ```

3. **检查环境变量**
   - 确保生产环境已配置 `GEMINI_API_KEY` 和 `GEMINI_BASE_URL`
   - 检查构建时环境变量是否正确注入

### 问题 2: 检查结果未写回多维表格

**可能原因：**
1. Webhook URL 在生产环境未配置或配置错误
2. CORS 跨域问题（生产环境无 Vite 代理）
3. Webhook 权限或认证问题

**解决方案：**

#### 方案 A: 配置生产环境 Webhook URL（推荐）

在生产环境的 `.env` 文件中添加：

```bash
# 生产环境 Webhook 配置
VITE_WRITE_VIOLATION_WEBHOOK=https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb
```

**注意：** 这种方式可能仍然会遇到 CORS 问题，因为飞书 API 不允许跨域请求。

#### 方案 B: 使用服务端代理（推荐用于生产）

创建一个后端服务来代理 Webhook 请求：

```javascript
// 示例：使用 Express.js
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
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

然后在 `.env` 中配置：
```bash
VITE_WRITE_VIOLATION_WEBHOOK=https://your-backend.com/api/webhook/proxy
```

#### 方案 C: 使用演示模式（临时方案）

如果暂时无法解决 Webhook 问题，系统会自动使用演示模式：
- 分析结果会正常显示
- 数据会更新到前端界面
- 但不会真正写入飞书多维表格
- 控制台会显示 "📝 [演示模式] 写入违规记录"

### 调试步骤

1. **启用详细日志**
   
   打开浏览器控制台，查看以下日志：
   - `🔍 使用中转 API 进行图像分析` - API 调用开始
   - `📍 分析点位` - 当前分析的点位
   - `📤 发送请求到` - API 请求 URL
   - `✅ API 响应成功` - API 调用成功
   - `📝 准备写入违规记录` - 准备写入数据
   - `✅ 违规记录写入成功` - 写入成功

2. **测试 Webhook 连接**
   
   在浏览器控制台执行：
   ```javascript
   fetch('/api/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ test: true })
   })
   .then(r => console.log('Webhook 状态:', r.status))
   .catch(e => console.error('Webhook 失败:', e));
   ```

3. **检查网络请求**
   
   - 打开开发者工具 Network 标签
   - 执行一次 AI 巡检分析
   - 查看所有请求的状态码
   - 特别关注 `/api/webhook/` 和 `/chat/completions` 请求

## 生产环境配置清单

### 必需配置

```bash
# .env 文件
GEMINI_API_KEY=sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495
GEMINI_BASE_URL=https://api.zhizengzeng.com/v1/
```

### 可选配置（用于写入多维表格）

```bash
# 如果需要在生产环境写入多维表格，需要配置 Webhook
# 注意：可能需要后端代理来解决 CORS 问题
VITE_WRITE_VIOLATION_WEBHOOK=https://your-backend.com/api/webhook/proxy
```

### 构建命令

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览构建结果（可选）
npm run preview
```

### 部署检查

部署后，访问以下 URL 验证：

1. **主页访问**: `https://airdemo.cn`
2. **图片资源**: `https://airdemo.cn/images/东门卫-仓库.png`
3. **API 配置**: 在控制台检查 `process.env.GEMINI_API_KEY` 是否已注入

## 常见问题

### Q: 为什么开发环境正常，生产环境不行？

A: 主要原因是 Vite 的开发服务器提供了代理功能，可以绕过 CORS 限制。生产环境是静态文件，没有代理服务器，所以需要：
- 配置后端代理服务
- 或使用演示模式（不写入真实数据）

### Q: 如何验证环境变量是否生效？

A: 在浏览器控制台执行：
```javascript
console.log('API Key:', process.env.GEMINI_API_KEY);
console.log('Base URL:', process.env.GEMINI_BASE_URL);
```

### Q: 图片为什么加载不出来？

A: 检查图片路径：
- 开发环境：`/images/xxx.png` → `http://localhost:8080/images/xxx.png`
- 生产环境：`/images/xxx.png` → `https://airdemo.cn/images/xxx.png`

确保图片文件在 `public/images/` 目录下，构建时会自动复制到输出目录。

## 监控和日志

生产环境建议添加错误监控：

```javascript
// 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  // 可以发送到错误监控服务
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 错误:', event.reason);
  // 可以发送到错误监控服务
});
```

## 联系支持

如果问题仍未解决，请提供以下信息：
1. 浏览器控制台的完整错误日志
2. Network 标签页的请求详情（截图）
3. 当前的环境变量配置（隐藏敏感信息）
4. 复现步骤
