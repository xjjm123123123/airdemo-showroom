# 🎯 修复 CORS 跨域问题 - www 域名冲突

## 🔍 问题诊断

### 错误信息
```
Access to fetch at 'https://airdemo.cn/api/webhook' 
from origin 'https://www.airdemo.cn' 
has been blocked by CORS policy: 
Redirect is not allowed for a preflight request.
```

### 根本原因

你的网站有两个域名：
- ✅ `https://airdemo.cn` （没有 www）
- ✅ `https://www.airdemo.cn` （有 www）

当前访问的是 `www.airdemo.cn`，但环境变量配置的 Webhook URL 是 `https://airdemo.cn/api/webhook`，导致跨域请求被阻止。

## ✅ 解决方案：使用相对路径

### 修改环境变量

将 Webhook URL 从**绝对路径**改为**相对路径**：

**❌ 错误配置（绝对路径）：**
```
VITE_WRITE_VIOLATION_WEBHOOK=https://airdemo.cn/api/webhook
```

**✅ 正确配置（相对路径）：**
```
VITE_WRITE_VIOLATION_WEBHOOK=/api/webhook
```

### 为什么相对路径可以解决问题？

使用相对路径后：
- 访问 `https://airdemo.cn` → 请求 `https://airdemo.cn/api/webhook` ✅
- 访问 `https://www.airdemo.cn` → 请求 `https://www.airdemo.cn/api/webhook` ✅

自动适配当前域名，不会产生跨域问题！

---

## 🚀 立即修复（5分钟）

### 步骤 1: 更新 Vercel 环境变量（2分钟）

1. **访问 Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **进入项目设置**
   - 找到 `airdemo-showroom` 项目
   - 点击 **Settings**
   - 点击 **Environment Variables**

3. **修改 VITE_WRITE_VIOLATION_WEBHOOK**
   
   找到这个变量，点击编辑：
   
   **旧值：**
   ```
   https://airdemo.cn/api/webhook
   ```
   
   **新值：**
   ```
   /api/webhook
   ```
   
   确保选择了所有环境：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **保存**

### 步骤 2: 重新部署（1分钟）

在本地项目目录执行：

```bash
git add .env .env.example
git commit -m "fix: 使用相对路径解决 www 域名 CORS 问题"
git push origin main
```

### 步骤 3: 等待部署完成（2分钟）

Vercel 会自动检测到更新并重新部署

### 步骤 4: 验证修复（1分钟）

1. **访问你的网站**（任意一个域名都可以）
   - https://airdemo.cn
   - https://www.airdemo.cn

2. **打开浏览器控制台（F12）**

3. **进行 AI 巡检分析**
   - 选择一个点位
   - 点击"开始分析"

4. **查看控制台日志**

应该看到：
```
📝 [writeViolationRecord] 开始写入违规记录
🔧 Webhook URL: /api/webhook
📤 发送 Webhook 请求: /api/webhook
📨 响应状态: 200 OK
✅ Webhook 请求成功
✅ 违规记录已自动写入「人员违规数据表」
```

5. **检查飞书多维表格**
   - 应该能看到新增的违规记录

---

## 🎯 完整的环境变量配置

### 在 Vercel 控制台配置这 4 个变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | `sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495` | Gemini API 密钥 |
| `GEMINI_BASE_URL` | `https://api.zhizengzeng.com/v1/` | API 中转地址 |
| `VITE_WRITE_VIOLATION_WEBHOOK` | `/api/webhook` | ⭐ 使用相对路径 |
| `FEISHU_WEBHOOK_URL` | `https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb` | 飞书 Webhook |

---

## 🔧 其他解决方案（可选）

### 方案 2: 配置域名重定向

在 Vercel 项目设置中：

1. **Settings** → **Domains**
2. 将 `www.airdemo.cn` 重定向到 `airdemo.cn`
3. 或者将 `airdemo.cn` 重定向到 `www.airdemo.cn`

这样用户只会访问一个域名，避免跨域问题。

### 方案 3: 更新 vercel.json CORS 配置

如果使用相对路径后仍有问题，可以增强 CORS 配置：

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        },
        {
          "key": "Access-Control-Max-Age",
          "value": "86400"
        }
      ]
    }
  ]
}
```

---

## 📊 修复前后对比

### ❌ 修复前

```
当前页面: https://www.airdemo.cn
请求 URL:  https://airdemo.cn/api/webhook
结果:      ❌ CORS 错误（跨域）
```

### ✅ 修复后

```
当前页面: https://www.airdemo.cn
请求 URL:  https://www.airdemo.cn/api/webhook (自动适配)
结果:      ✅ 成功
```

```
当前页面: https://airdemo.cn
请求 URL:  https://airdemo.cn/api/webhook (自动适配)
结果:      ✅ 成功
```

---

## 🎉 预期结果

修复后，无论访问哪个域名，AI 巡检分析都能正常工作：

1. ✅ AI 模型调用成功
2. ✅ 违规卡片正常显示
3. ✅ 数据成功写入飞书多维表格
4. ✅ 控制台无 CORS 错误

---

## 💡 技术说明

### 为什么会有 www 和非 www 两个域名？

这是 DNS 配置的结果：
- `airdemo.cn` - 根域名
- `www.airdemo.cn` - 子域名

两者在浏览器看来是不同的源（origin），所以会产生跨域问题。

### 相对路径的工作原理

```javascript
// 绝对路径
fetch('https://airdemo.cn/api/webhook')  // 固定域名

// 相对路径
fetch('/api/webhook')  // 自动使用当前页面的域名
```

浏览器会自动将相对路径转换为完整 URL：
- 在 `https://www.airdemo.cn` 页面 → `https://www.airdemo.cn/api/webhook`
- 在 `https://airdemo.cn` 页面 → `https://airdemo.cn/api/webhook`

---

## 🆘 如果还有问题

### 清除浏览器缓存

1. 按 `Ctrl + Shift + Delete`（Windows）或 `Cmd + Shift + Delete`（Mac）
2. 选择"缓存的图像和文件"
3. 清除缓存
4. 刷新页面（`Ctrl + F5` 或 `Cmd + Shift + R`）

### 检查 Vercel 部署

1. 确认环境变量已更新
2. 确认部署成功（状态为 "Ready"）
3. 查看部署日志，确认没有错误

### 测试 Serverless 函数

在控制台执行：

```javascript
fetch('/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
})
.then(r => r.json())
.then(data => console.log('测试结果:', data))
.catch(e => console.error('测试失败:', e));
```

---

## 📚 相关文档

- `URGENT_FIX.md` - 紧急修复指南
- `VERCEL_QUICK_START.md` - 快速配置指南
- `VERCEL_CONFIG_CHECKLIST.md` - 配置清单

---

立即修改环境变量并重新部署，问题就能解决！🚀
