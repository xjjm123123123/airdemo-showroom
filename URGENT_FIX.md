# 🚨 紧急修复指南 - 两个问题

## 问题 1: Webhook 404 错误
## 问题 2: 使用 Mock Data（API 未调用）

---

## 🎯 根本原因

### 问题 1: Vercel Serverless 函数未部署
- `api/webhook.js` 文件存在但 Vercel 没有识别
- 需要手动触发重新部署

### 问题 2: 环境变量未注入
- Vercel 环境变量配置了，但没有生效
- 需要检查变量名和重新部署

---

## ⚡ 快速修复（10分钟）

### 第一步：检查 Vercel 环境变量（3分钟）

1. **访问 Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **进入项目设置**
   - 找到 `airdemo-showroom` 项目
   - 点击 **Settings**
   - 点击 **Environment Variables**

3. **确认以下 4 个变量存在且正确**

   | 变量名 | 值 | Environment |
   |--------|-----|-------------|
   | `GEMINI_API_KEY` | `sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495` | ✅ Production ✅ Preview ✅ Development |
   | `GEMINI_BASE_URL` | `https://api.zhizengzeng.com/v1/` | ✅ Production ✅ Preview ✅ Development |
   | `VITE_WRITE_VIOLATION_WEBHOOK` | `https://airdemo.cn/api/webhook` | ✅ Production ✅ Preview ✅ Development |
   | `FEISHU_WEBHOOK_URL` | `https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb` | ✅ Production ✅ Preview ✅ Development |

4. **⚠️ 重要检查点**
   - 变量名**完全一致**（区分大小写）
   - 值**没有多余空格**
   - 每个变量都选择了 **3 个环境**（Production + Preview + Development）

---

### 第二步：强制重新部署（2分钟）

#### 方法 A: 在 Vercel Dashboard 重新部署

1. 点击 **Deployments** 标签
2. 找到最新的部署记录
3. 点击右上角的 **"..."** 按钮
4. 选择 **"Redeploy"**
5. 勾选 **"Use existing Build Cache"** 取消勾选（强制重新构建）
6. 点击 **"Redeploy"**

#### 方法 B: 通过 Git 触发部署（推荐）

在本地项目目录执行：

```bash
# 创建一个空提交来触发部署
git commit --allow-empty -m "chore: 强制触发 Vercel 重新部署"

# 推送到 GitHub
git push origin main
```

---

### 第三步：等待部署完成（2-3分钟）

1. 在 Vercel Dashboard 查看部署进度
2. 等待状态变为 **"Ready"**
3. 查看构建日志，确认没有错误

---

### 第四步：验证修复（2分钟）

#### 1. 访问你的网站

```
https://airdemo.cn
```

#### 2. 打开浏览器控制台（F12）

#### 3. 运行完整诊断脚本

复制以下代码到控制台执行：

```javascript
console.log('🔍 开始诊断...\n');

// 1. 检查环境变量
console.log('📋 1. 环境变量检查');
console.log('-------------------');
const apiKey = process.env.GEMINI_API_KEY;
const baseURL = process.env.GEMINI_BASE_URL;
const webhookURL = process.env.VITE_WRITE_VIOLATION_WEBHOOK;

console.log('API Key:', apiKey ? `✅ 已配置 (${apiKey.substring(0, 10)}...)` : '❌ 未配置');
console.log('Base URL:', baseURL || '❌ 未配置');
console.log('Webhook URL:', webhookURL || '❌ 未配置');
console.log('');

// 2. 测试 Serverless 函数
console.log('📋 2. Serverless 函数测试');
console.log('-------------------');

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
    }
  })
})
.then(r => {
  console.log('Webhook 状态码:', r.status);
  if (r.status === 200) {
    console.log('✅ Serverless 函数工作正常');
  } else if (r.status === 404) {
    console.log('❌ Serverless 函数不存在（404）');
    console.log('💡 解决方案：在 Vercel 重新部署项目');
  }
  return r.json();
})
.then(data => {
  console.log('Webhook 响应:', data);
  console.log('');
  
  // 3. 测试 API 调用
  console.log('📋 3. Gemini API 测试');
  console.log('-------------------');
  
  if (!apiKey || !baseURL) {
    console.log('❌ API 配置不完整，无法测试');
    console.log('💡 解决方案：在 Vercel 配置环境变量并重新部署');
    return;
  }
  
  console.log('正在测试 API 连接...');
  
  return fetch(`${baseURL}/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })
  .then(r => {
    console.log('API 状态码:', r.status);
    if (r.status === 200) {
      console.log('✅ Gemini API 连接正常');
    } else {
      console.log('❌ API 连接失败');
    }
    return r.text();
  })
  .then(text => {
    console.log('API 响应:', text.substring(0, 100));
  });
})
.catch(e => {
  console.error('❌ 测试失败:', e);
})
.finally(() => {
  console.log('\n📊 诊断完成');
  console.log('===================');
  console.log('如果看到 ✅，说明该项正常');
  console.log('如果看到 ❌，请按照提示修复');
});
```

#### 4. 查看结果

**✅ 成功的输出应该是：**

```
🔍 开始诊断...

📋 1. 环境变量检查
-------------------
API Key: ✅ 已配置 (sk-zk234ba...)
Base URL: https://api.zhizengzeng.com/v1/
Webhook URL: https://airdemo.cn/api/webhook

📋 2. Serverless 函数测试
-------------------
Webhook 状态码: 200
✅ Serverless 函数工作正常
Webhook 响应: {success: true, message: "数据已成功写入飞书多维表格", ...}

📋 3. Gemini API 测试
-------------------
正在测试 API 连接...
API 状态码: 200
✅ Gemini API 连接正常
API 响应: {...}

📊 诊断完成
```

---

### 第五步：完整功能测试（1分钟）

1. **在网站上进行 AI 巡检**
   - 选择一个点位（如：东门卫-仓库）
   - 点击"开始分析"

2. **观察控制台日志**
   - 应该看到真实的 API 调用，而不是 Mock Data
   - 应该看到 Webhook 成功写入

3. **检查飞书多维表格**
   - 应该能看到新增的违规记录

---

## 🐛 如果还是有问题

### 问题 A: 环境变量显示"未配置"

**原因：** Vercel 环境变量没有正确注入

**解决：**

1. **检查变量名前缀**
   - 前端变量必须以 `VITE_` 开头（除了 `GEMINI_API_KEY` 和 `GEMINI_BASE_URL`）
   - 后端变量（Serverless 函数）不需要前缀

2. **重新添加环境变量**
   - 删除现有的变量
   - 重新添加，确保没有拼写错误
   - 确保选择了所有环境

3. **强制重新部署**
   ```bash
   git commit --allow-empty -m "chore: 重新部署"
   git push origin main
   ```

### 问题 B: Webhook 仍然返回 404

**原因：** Serverless 函数没有被正确部署

**解决：**

1. **检查文件位置**
   ```bash
   ls -la api/webhook.js
   ```
   确保文件存在

2. **查看 Vercel 构建日志**
   - Dashboard → Deployments → 最新部署 → Building
   - 查找是否有错误信息

3. **检查 Functions 标签**
   - Dashboard → Deployments → 最新部署 → Functions
   - 应该能看到 `api/webhook.js`
   - 如果看不到，说明函数没有被识别

4. **尝试简化 vercel.json**
   
   临时删除 `vercel.json` 文件，让 Vercel 使用默认配置：
   
   ```bash
   git mv vercel.json vercel.json.backup
   git commit -m "test: 临时移除 vercel.json"
   git push origin main
   ```

### 问题 C: 使用 Mock Data

**原因：** API Key 或 Base URL 未正确配置

**解决：**

1. **在控制台检查**
   ```javascript
   console.log('API Key:', process.env.GEMINI_API_KEY);
   console.log('Base URL:', process.env.GEMINI_BASE_URL);
   ```

2. **如果显示 undefined**
   - 说明环境变量没有注入
   - 检查 Vercel 环境变量配置
   - 确保变量名完全正确
   - 重新部署

3. **检查 vite.config.ts**
   
   确保环境变量正确定义：
   
   ```typescript
   define: {
     'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
     'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
     'process.env.GEMINI_BASE_URL': JSON.stringify(env.GEMINI_BASE_URL)
   }
   ```

---

## 📞 需要进一步帮助？

如果以上步骤都无法解决问题，请提供：

1. **Vercel 环境变量截图**
   - Settings → Environment Variables

2. **Vercel 部署日志**
   - Deployments → 最新部署 → Building 日志

3. **Vercel Functions 截图**
   - Deployments → 最新部署 → Functions

4. **浏览器控制台诊断结果**
   - 运行上面的诊断脚本的完整输出

5. **本地文件确认**
   ```bash
   ls -la api/
   cat api/webhook.js | head -20
   cat vercel.json
   ```

---

## 🎯 预期的完整工作流程

修复后，AI 巡检分析应该是这样的：

```
1. 用户选择点位：东门卫-仓库
2. 点击"开始分析"

控制台日志：
🔍 使用中转 API 进行图像分析: https://api.zhizengzeng.com/v1/
📍 分析点位: 东门卫-仓库
📥 正在获取图片: https://airdemo.cn/images/东门卫-仓库.png
✅ 图片已转换为 base64，长度: 123456
📤 发送请求到: https://api.zhizengzeng.com/v1/chat/completions
📨 响应状态: 200 OK
✅ API 响应成功
📝 AI 返回内容: {...}
📝 [writeViolationRecord] 开始写入违规记录
🔧 Webhook URL: https://airdemo.cn/api/webhook
📤 发送 Webhook 请求
📨 响应状态: 200 OK
✅ Webhook 请求成功
✅ 违规记录已自动写入「人员违规数据表」

3. 页面显示蓝色违规卡片
4. 飞书多维表格新增一条记录
```

---

## ⏱️ 时间估算

- 检查环境变量：3 分钟
- 重新部署：2 分钟
- 等待部署：2-3 分钟
- 验证测试：2 分钟

**总计：约 10 分钟**

---

立即开始修复吧！💪
