# Vercel 快速配置指南 ⚡

## 🎯 目标

让 AI 巡检分析的结果真正写入飞书多维表格

## ⏱️ 预计时间：10 分钟

---

## 第一步：在 Vercel 配置环境变量（5分钟）

### 1. 登录 Vercel

访问：https://vercel.com/dashboard

### 2. 进入项目设置

找到你的项目 `airdemo-showroom` → 点击 **Settings** → 点击 **Environment Variables**

### 3. 添加以下 4 个环境变量

#### 变量 1: GEMINI_API_KEY
```
Key:   GEMINI_API_KEY
Value: sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495
Environment: ✅ Production  ✅ Preview  ✅ Development
```

#### 变量 2: GEMINI_BASE_URL
```
Key:   GEMINI_BASE_URL
Value: https://api.zhizengzeng.com/v1/
Environment: ✅ Production  ✅ Preview  ✅ Development
```

#### 变量 3: VITE_WRITE_VIOLATION_WEBHOOK
```
Key:   VITE_WRITE_VIOLATION_WEBHOOK
Value: https://airdemo.cn/api/webhook
Environment: ✅ Production  ✅ Preview  ✅ Development
```
⚠️ **重要**：如果你的域名不是 `airdemo.cn`，请替换为你的实际域名

#### 变量 4: FEISHU_WEBHOOK_URL
```
Key:   FEISHU_WEBHOOK_URL
Value: https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb
Environment: ✅ Production  ✅ Preview  ✅ Development
```

### 4. 保存

点击每个变量的 **Save** 按钮

---

## 第二步：推送代码到 GitHub（2分钟）

在本地项目目录执行：

```bash
# 添加所有文件
git add .

# 提交
git commit -m "feat: 添加 Vercel Serverless 函数支持真实数据写入"

# 推送到 GitHub
git push origin main
```

---

## 第三步：等待 Vercel 自动部署（2-3分钟）

1. Vercel 会自动检测到 GitHub 的更新
2. 自动开始构建和部署
3. 你可以在 Vercel Dashboard → Deployments 查看进度

---

## 第四步：验证部署（1分钟）

### 1. 访问你的网站

打开：https://airdemo.cn

### 2. 打开浏览器控制台

按 **F12** 键，切换到 **Console** 标签

### 3. 执行测试

在控制台粘贴并执行：

```javascript
// 测试环境变量
console.log('✅ 环境变量检查:');
console.log('API Key:', process.env.GEMINI_API_KEY ? '已配置' : '❌ 未配置');
console.log('Base URL:', process.env.GEMINI_BASE_URL || '❌ 未配置');
console.log('Webhook:', process.env.VITE_WRITE_VIOLATION_WEBHOOK || '❌ 未配置');

// 测试 Webhook 代理
console.log('\n✅ 测试 Webhook 代理:');
fetch('https://airdemo.cn/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    record: {
      编号: 999,
      日期: '2025/12/25',
      违规情况: '测试数据',
      抓取时间: '2025-12-25 12:00:00',
      位置: '测试点位',
      部门: '测试部门',
      AI生成: '这是一条测试数据'
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Webhook 测试成功:', data);
  if (data.success) {
    console.log('🎉 数据已成功写入飞书多维表格！');
  }
})
.catch(e => console.error('❌ Webhook 测试失败:', e));
```

### 4. 查看结果

应该看到类似输出：

```
✅ 环境变量检查:
API Key: 已配置
Base URL: https://api.zhizengzeng.com/v1/
Webhook: https://airdemo.cn/api/webhook

✅ 测试 Webhook 代理:
✅ Webhook 测试成功: {success: true, message: "数据已成功写入飞书多维表格", ...}
🎉 数据已成功写入飞书多维表格！
```

### 5. 检查飞书多维表格

打开你的飞书多维表格，应该能看到刚才的测试数据（编号 999）

---

## 第五步：完整功能测试（1分钟）

### 1. 在网站上进行 AI 巡检

1. 切换到"多维表格"或"应用模式"
2. 在右侧 Aily 工作台选择一个点位（如：东门卫-仓库）
3. 点击"开始分析"按钮

### 2. 观察控制台日志

应该看到完整的流程日志：

```
🔍 使用中转 API 进行图像分析
📍 分析点位: 东门卫-仓库
✅ 图片已转换为 base64
📤 发送请求到 API
✅ API 响应成功
📝 [writeViolationRecord] 开始写入违规记录
🔧 Webhook URL: https://airdemo.cn/api/webhook
📤 发送 Webhook 请求
📨 响应状态: 200 OK
✅ Webhook 请求成功
✅ 违规记录已自动写入「人员违规数据表」
```

### 3. 查看违规卡片

页面上应该显示蓝色的违规卡片，包含：
- 违规图片
- 违规类型和详细说明
- 位置、部门、时间信息
- AI 置信度

### 4. 检查飞书多维表格

刷新飞书多维表格，应该能看到新增的违规记录

---

## ✅ 完成！

如果所有步骤都成功，你的 AI 巡检系统现在可以：

- ✅ 分析监控图像
- ✅ 识别违规行为
- ✅ 显示详细结果卡片
- ✅ **真正写入飞书多维表格** 🎉

---

## 🐛 遇到问题？

### 问题 1: 环境变量显示"未配置"

**解决：**
1. 检查 Vercel 控制台的环境变量是否正确添加
2. 确保选择了所有环境（Production, Preview, Development）
3. 重新部署：Vercel Dashboard → Deployments → 最新部署 → Redeploy

### 问题 2: Webhook 测试失败

**解决：**
1. 检查 `FEISHU_WEBHOOK_URL` 是否正确配置
2. 查看 Vercel 函数日志：Dashboard → Deployments → Functions → api/webhook.js
3. 确认飞书 Webhook 是否可用

### 问题 3: 数据没有写入表格

**解决：**
1. 检查飞书 Webhook URL 是否正确
2. 在飞书多维表格中测试 Webhook 是否正常工作
3. 查看 Vercel 函数日志，确认请求是否发送成功

---

## 📚 详细文档

- **完整部署指南**：`docs/VERCEL_DEPLOYMENT.md`
- **诊断脚本**：`docs/DIAGNOSTIC_SCRIPT.md`
- **故障排除**：`docs/TROUBLESHOOTING.md`

---

## 🎯 关键文件说明

| 文件 | 作用 |
|------|------|
| `api/webhook.js` | Vercel Serverless 函数，代理飞书 Webhook 请求 |
| `vercel.json` | Vercel 配置文件，设置路由和 CORS |
| `.env` | 本地开发环境变量 |
| `vite.config.ts` | Vite 配置，开发环境代理 |

---

## 💡 工作原理

```
┌─────────────────────────────────────────────────────────┐
│                    开发环境                              │
│  前端 → Vite 代理 → 飞书 API                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    生产环境（Vercel）                    │
│  前端 → Vercel Serverless 函数 → 飞书 API              │
│         (api/webhook.js)                                │
└─────────────────────────────────────────────────────────┘
```

**为什么需要代理？**
- 飞书 API 不允许跨域请求（CORS）
- 浏览器会阻止直接调用飞书 API
- 通过后端代理可以绕过 CORS 限制

---

## 🎉 恭喜！

你已经成功配置了完整的 AI 巡检系统，现在可以真正地将分析结果写入飞书多维表格了！
