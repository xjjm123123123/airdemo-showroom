# Vercel 部署指南 - 完整配置

## 📋 部署前准备

确保你已经：
- ✅ 有 Vercel 账号
- ✅ 项目已推送到 GitHub
- ✅ 有飞书多维表格的 Webhook URL

## 🚀 部署步骤

### 第一步：在 Vercel 创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择你的 GitHub 仓库：`xjjm123123123/airdemo-showroom`
4. 点击 "Import"

### 第二步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量

1. **GEMINI_API_KEY**
   ```
   sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495
   ```

2. **GEMINI_BASE_URL**
   ```
   https://api.zhizengzeng.com/v1/
   ```

3. **VITE_WRITE_VIOLATION_WEBHOOK**
   ```
   https://airdemo.cn/api/webhook
   ```
   ⚠️ **重要**：将 `airdemo.cn` 替换为你的实际 Vercel 域名

4. **FEISHU_WEBHOOK_URL** (后端环境变量)
   ```
   https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb
   ```

#### 在 Vercel 控制台配置步骤

1. 进入项目 → Settings → Environment Variables
2. 添加每个环境变量：
   - Key: 变量名（如 `GEMINI_API_KEY`）
   - Value: 变量值
   - Environment: 选择 `Production`, `Preview`, `Development`（全选）
3. 点击 "Save"

### 第三步：配置自定义域名（可选）

如果你想使用 `airdemo.cn` 域名：

1. 进入项目 → Settings → Domains
2. 添加域名：`airdemo.cn`
3. 按照提示配置 DNS 记录：
   - 类型：A 记录或 CNAME
   - 指向：Vercel 提供的地址

### 第四步：部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，访问你的域名

## 🔧 项目结构说明

```
airdemo-showroom/
├── api/
│   └── webhook.js          # Vercel Serverless 函数（Webhook 代理）
├── vercel.json             # Vercel 配置文件
├── .env                    # 本地开发环境变量
└── vite.config.ts          # Vite 配置（开发环境代理）
```

### 工作原理

**开发环境（localhost:8080）：**
```
前端 → /api/webhook/event/xxx → Vite 代理 → 飞书 API
```

**生产环境（Vercel）：**
```
前端 → https://airdemo.cn/api/webhook → Vercel Serverless 函数 → 飞书 API
```

## ✅ 验证部署

### 1. 检查环境变量

访问你的网站，打开浏览器控制台（F12），执行：

```javascript
console.log('API Key:', process.env.GEMINI_API_KEY ? '已配置' : '未配置');
console.log('Base URL:', process.env.GEMINI_BASE_URL);
console.log('Webhook URL:', process.env.VITE_WRITE_VIOLATION_WEBHOOK);
```

应该看到：
```
API Key: 已配置
Base URL: https://api.zhizengzeng.com/v1/
Webhook URL: https://airdemo.cn/api/webhook
```

### 2. 测试 Serverless 函数

在控制台执行：

```javascript
fetch('https://airdemo.cn/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    record: {
      编号: 999,
      日期: '2025/12/25',
      违规情况: '测试',
      抓取时间: '2025-12-25 10:00:00',
      位置: '测试点位',
      部门: '测试部门',
    }
  })
})
.then(r => r.json())
.then(data => console.log('测试结果:', data))
.catch(e => console.error('测试失败:', e));
```

应该看到：
```javascript
测试结果: {
  success: true,
  message: "数据已成功写入飞书多维表格",
  data: {...}
}
```

### 3. 完整的 AI 巡检测试

1. 访问 https://airdemo.cn
2. 切换到"多维表格"或"应用模式"
3. 在右侧 Aily 工作台选择一个点位
4. 点击"开始分析"
5. 观察控制台日志：

```
🔍 使用中转 API 进行图像分析
📍 分析点位: 东门卫-仓库
✅ 图片已转换为 base64
📤 发送请求到 API
✅ API 响应成功
📝 [writeViolationRecord] 开始写入违规记录
🔧 Webhook URL: https://airdemo.cn/api/webhook
📤 发送 Webhook 请求
✅ Webhook 请求成功
✅ 违规记录已自动写入「人员违规数据表」
```

6. 检查飞书多维表格，应该能看到新增的违规记录

## 🐛 常见问题排查

### 问题 1: 环境变量未生效

**症状：** 控制台显示 `process.env.GEMINI_API_KEY` 为 `undefined`

**解决：**
1. 检查 Vercel 控制台的环境变量是否正确配置
2. 确保变量名前缀正确：
   - 前端变量：`VITE_` 开头（如 `VITE_WRITE_VIOLATION_WEBHOOK`）
   - 后端变量：无前缀（如 `FEISHU_WEBHOOK_URL`）
3. 重新部署项目（Settings → Deployments → 最新部署 → Redeploy）

### 问题 2: Webhook 调用失败

**症状：** 控制台显示 `❌ 写入违规记录失败`

**排查步骤：**

1. **检查 Serverless 函数日志**
   - Vercel Dashboard → 项目 → Deployments → 最新部署 → Functions
   - 点击 `api/webhook.js` 查看日志

2. **测试 Serverless 函数**
   ```javascript
   fetch('https://airdemo.cn/api/webhook', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ test: true })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error);
   ```

3. **检查飞书 Webhook URL**
   - 确保 `FEISHU_WEBHOOK_URL` 配置正确
   - 在飞书多维表格中测试 Webhook 是否可用

### 问题 3: CORS 错误

**症状：** 控制台显示 `Access-Control-Allow-Origin` 错误

**解决：**
- 检查 `vercel.json` 文件是否存在
- 确保 CORS 头配置正确
- 重新部署项目

### 问题 4: 图片加载失败

**症状：** 违规卡片中的图片显示不出来

**解决：**
1. 检查 `public/images/` 目录是否包含所有图片
2. 确保图片文件名正确（包括中文字符）
3. 在控制台测试：
   ```javascript
   fetch('https://airdemo.cn/images/东门卫-仓库.png')
     .then(r => console.log('图片状态:', r.status));
   ```

## 📊 监控和日志

### Vercel 函数日志

查看 Serverless 函数的执行日志：

1. Vercel Dashboard → 项目 → Deployments
2. 点击最新的部署
3. 点击 "Functions" 标签
4. 选择 `api/webhook.js`
5. 查看实时日志

### 浏览器控制台日志

前端会输出详细的日志：

```
📝 [writeViolationRecord] 开始写入违规记录
📦 记录内容: {...}
🔧 Webhook URL: https://airdemo.cn/api/webhook
📤 发送 Webhook 请求
📦 请求体: {...}
📨 响应状态: 200 OK
✅ Webhook 请求成功
```

## 🔄 更新部署

当你修改代码后：

1. **提交到 GitHub**
   ```bash
   git add .
   git commit -m "更新说明"
   git push origin main
   ```

2. **自动部署**
   - Vercel 会自动检测到 GitHub 的更新
   - 自动触发新的部署
   - 约 2-3 分钟后完成

3. **手动重新部署**
   - Vercel Dashboard → 项目 → Deployments
   - 选择一个部署 → "Redeploy"

## 📝 环境变量清单

### 前端环境变量（VITE_ 前缀）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | `sk-zk234bab...` | Gemini API 密钥 |
| `GEMINI_BASE_URL` | `https://api.zhizengzeng.com/v1/` | API 中转地址 |
| `VITE_WRITE_VIOLATION_WEBHOOK` | `https://airdemo.cn/api/webhook` | Webhook 代理地址 |

### 后端环境变量（Serverless 函数）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `FEISHU_WEBHOOK_URL` | `https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb` | 飞书 Webhook 地址 |

## 🎯 最终检查清单

部署完成后，确认以下项目：

- [ ] 网站可以正常访问
- [ ] 环境变量已正确配置
- [ ] AI 巡检分析功能正常
- [ ] 违规卡片正常显示
- [ ] 数据成功写入飞书多维表格
- [ ] 控制台无错误日志
- [ ] Serverless 函数日志正常

## 🆘 需要帮助？

如果遇到问题：

1. 查看 Vercel 函数日志
2. 查看浏览器控制台日志
3. 运行诊断脚本（`docs/DIAGNOSTIC_SCRIPT.md`）
4. 查看故障排除文档（`docs/TROUBLESHOOTING.md`）

## 🔗 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Vercel Serverless 函数](https://vercel.com/docs/functions/serverless-functions)
- [Vercel 环境变量](https://vercel.com/docs/projects/environment-variables)
- [项目 GitHub](https://github.com/xjjm123123123/airdemo-showroom)
