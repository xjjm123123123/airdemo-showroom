# 修复 404 错误 - Webhook 写入失败

## 🔍 错误信息

```
📨 响应状态: 404
📥 Webhook 响应: The page could not be found
⚠️ Webhook 返回非 2xx 状态码: 404
⚠️ 违规记录写入失败（可能是演示模式或网络问题）
```

## 🎯 问题原因

Vercel 返回 404，说明 `/api/webhook` 路由不存在。可能的原因：

1. ✅ 代码已推送到 GitHub
2. ❌ Vercel 还没有检测到新文件并重新部署
3. ❌ 或者 Vercel 部署失败

## 🚀 解决方案

### 方案 1: 手动触发 Vercel 重新部署（推荐）

#### 步骤 1: 访问 Vercel Dashboard

1. 打开：https://vercel.com/dashboard
2. 找到你的项目：`airdemo-showroom`
3. 点击进入项目

#### 步骤 2: 查看最新部署

1. 点击 **Deployments** 标签
2. 查看最新的部署记录
3. 检查部署时间是否是最近的（应该是几分钟前）

#### 步骤 3: 手动重新部署

1. 点击最新的部署记录
2. 点击右上角的 **"..."** 按钮
3. 选择 **"Redeploy"**
4. 确认重新部署

#### 步骤 4: 等待部署完成

- 等待 2-3 分钟
- 部署状态变为 "Ready"

#### 步骤 5: 验证修复

在浏览器控制台执行：

```javascript
fetch('https://airdemo.cn/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
})
.then(r => {
  console.log('状态码:', r.status);
  return r.json();
})
.then(data => console.log('响应:', data))
.catch(e => console.error('错误:', e));
```

**期望结果：**
```
状态码: 200
响应: {success: true, message: "数据已成功写入飞书多维表格", ...}
```

---

### 方案 2: 检查 Vercel 部署日志

#### 步骤 1: 查看构建日志

1. Vercel Dashboard → 项目 → Deployments
2. 点击最新的部署
3. 查看 **"Building"** 部分的日志

#### 步骤 2: 检查是否有错误

查找以下内容：
- ✅ `api/webhook.js` 是否被识别
- ✅ 是否有构建错误
- ✅ 是否有警告信息

#### 步骤 3: 查看函数日志

1. 点击 **"Functions"** 标签
2. 应该能看到 `api/webhook.js`
3. 如果看不到，说明函数没有被正确部署

---

### 方案 3: 检查文件结构

确保你的项目结构是这样的：

```
airdemo-showroom/
├── api/
│   └── webhook.js          ← 必须在这里
├── vercel.json             ← 必须存在
├── package.json
├── vite.config.ts
└── ...
```

在本地执行：

```bash
# 检查文件是否存在
ls -la api/webhook.js
ls -la vercel.json

# 查看文件内容
cat api/webhook.js | head -20
```

---

### 方案 4: 强制推送并重新部署

如果以上方案都不行，尝试强制推送：

```bash
# 添加一个空提交来触发部署
git commit --allow-empty -m "chore: 触发 Vercel 重新部署"
git push origin main
```

然后等待 Vercel 自动部署（2-3 分钟）

---

### 方案 5: 临时使用演示模式

如果急需演示，可以暂时使用演示模式：

#### 在 Vercel 环境变量中

1. 删除或注释掉 `VITE_WRITE_VIOLATION_WEBHOOK`
2. 重新部署

这样系统会使用演示模式：
- ✅ AI 分析功能正常
- ✅ 违规卡片正常显示
- ⚠️ 不会真正写入飞书表格
- ⚠️ 控制台会显示 "[演示模式]"

---

## 🔧 详细诊断步骤

### 1. 检查 Vercel 项目设置

访问：https://vercel.com/dashboard → 项目 → Settings

#### 检查 Build & Development Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build` 或 `vite build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 检查 Functions

- **Functions Region**: 选择离你最近的区域
- **Node.js Version**: 18.x 或更高

### 2. 检查环境变量

Settings → Environment Variables

确保以下变量存在：

```
✅ GEMINI_API_KEY
✅ GEMINI_BASE_URL
✅ VITE_WRITE_VIOLATION_WEBHOOK = https://airdemo.cn/api/webhook
✅ FEISHU_WEBHOOK_URL
```

### 3. 测试 Serverless 函数

在浏览器控制台执行完整测试：

```javascript
// 测试 1: 检查函数是否存在
fetch('https://airdemo.cn/api/webhook', {
  method: 'GET'
})
.then(r => {
  console.log('GET 请求状态:', r.status);
  // 应该返回 405 (Method not allowed)，说明函数存在
  if (r.status === 405) {
    console.log('✅ Serverless 函数存在');
  } else if (r.status === 404) {
    console.log('❌ Serverless 函数不存在，需要重新部署');
  }
});

// 测试 2: 测试 POST 请求
fetch('https://airdemo.cn/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    record: {
      编号: 999,
      日期: '2025/12/25',
      违规情况: '测试',
      抓取时间: '2025-12-25 12:00:00',
      位置: '测试点位',
      部门: '测试部门',
    }
  })
})
.then(r => {
  console.log('POST 请求状态:', r.status);
  return r.json();
})
.then(data => {
  console.log('响应数据:', data);
  if (data.success) {
    console.log('✅ Webhook 代理工作正常');
  }
})
.catch(e => console.error('❌ 请求失败:', e));
```

---

## 📊 预期结果对比

### ❌ 当前状态（404 错误）

```
请求: POST https://airdemo.cn/api/webhook
响应: 404 Not Found
内容: The page could not be found
```

### ✅ 修复后的状态

```
请求: POST https://airdemo.cn/api/webhook
响应: 200 OK
内容: {
  "success": true,
  "message": "数据已成功写入飞书多维表格",
  "data": {...}
}
```

---

## 🎯 快速修复（5分钟）

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard

2. **找到项目并重新部署**
   - Deployments → 最新部署 → ... → Redeploy

3. **等待部署完成**
   - 约 2-3 分钟

4. **测试修复**
   - 运行上面的测试脚本

5. **如果还是 404**
   - 检查 `api/webhook.js` 文件是否存在
   - 查看 Vercel 构建日志
   - 尝试方案 4（强制推送）

---

## 💡 为什么会出现 404？

Vercel Serverless 函数的工作原理：

1. **文件位置**: `api/webhook.js`
2. **自动路由**: Vercel 自动将 `api/webhook.js` 映射到 `/api/webhook`
3. **部署时机**: 只有在部署时才会创建路由

如果出现 404，说明：
- 文件不在正确位置
- 或者 Vercel 还没有部署这个文件
- 或者部署失败

---

## 🆘 仍然无法解决？

提供以下信息以便进一步诊断：

1. **Vercel 部署日志截图**
   - Dashboard → Deployments → 最新部署 → Building 日志

2. **Functions 标签截图**
   - Dashboard → Deployments → 最新部署 → Functions

3. **环境变量截图**
   - Settings → Environment Variables

4. **本地文件结构**
   ```bash
   ls -la api/
   cat api/webhook.js | head -10
   ```

5. **浏览器控制台完整错误日志**

---

## 📚 相关文档

- `VERCEL_QUICK_START.md` - 快速配置指南
- `VERCEL_CONFIG_CHECKLIST.md` - 配置清单
- `docs/VERCEL_DEPLOYMENT.md` - 详细部署文档
