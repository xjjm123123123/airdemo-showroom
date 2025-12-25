# ✅ Vercel 配置清单

## 📋 在 Vercel 控制台需要配置的环境变量

访问：https://vercel.com/dashboard → 你的项目 → Settings → Environment Variables

---

### 1️⃣ GEMINI_API_KEY

```
Key:   GEMINI_API_KEY
Value: sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495
```

**Environment（环境）：**
- ✅ Production
- ✅ Preview  
- ✅ Development

---

### 2️⃣ GEMINI_BASE_URL

```
Key:   GEMINI_BASE_URL
Value: https://api.zhizengzeng.com/v1/
```

**Environment（环境）：**
- ✅ Production
- ✅ Preview
- ✅ Development

---

### 3️⃣ VITE_WRITE_VIOLATION_WEBHOOK

```
Key:   VITE_WRITE_VIOLATION_WEBHOOK
Value: https://airdemo.cn/api/webhook
```

⚠️ **重要**：将 `airdemo.cn` 替换为你的实际 Vercel 域名

**Environment（环境）：**
- ✅ Production
- ✅ Preview
- ✅ Development

---

### 4️⃣ FEISHU_WEBHOOK_URL

```
Key:   FEISHU_WEBHOOK_URL
Value: https://bytedance.larkoffice.com/base/automation/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb
```

**Environment（环境）：**
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🎯 配置完成后

1. **保存所有变量**
2. **重新部署项目**
   - 方式 1：推送新代码到 GitHub（自动部署）
   - 方式 2：Vercel Dashboard → Deployments → Redeploy

3. **等待部署完成**（约 2-3 分钟）

4. **验证配置**
   - 访问你的网站
   - 按 F12 打开控制台
   - 运行测试脚本（见 `VERCEL_QUICK_START.md`）

---

## 📸 配置截图示例

### 添加环境变量的界面应该是这样的：

```
┌─────────────────────────────────────────────────────────┐
│ Environment Variables                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Key                                                      │
│ ┌────────────────────────────────────────────────────┐ │
│ │ GEMINI_API_KEY                                     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Value                                                    │
│ ┌────────────────────────────────────────────────────┐ │
│ │ sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495│ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Environment                                              │
│ ☑ Production  ☑ Preview  ☑ Development                 │
│                                                          │
│                                    [Save]                │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ 验证清单

配置完成后，确认以下项目：

- [ ] 4 个环境变量都已添加
- [ ] 每个变量都选择了 3 个环境（Production, Preview, Development）
- [ ] `VITE_WRITE_VIOLATION_WEBHOOK` 的域名是你的实际域名
- [ ] 已保存所有变量
- [ ] 已重新部署项目
- [ ] 部署成功（无错误）
- [ ] 网站可以正常访问
- [ ] 运行测试脚本成功
- [ ] AI 巡检分析功能正常
- [ ] 数据成功写入飞书多维表格

---

## 🔗 快速链接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **项目 GitHub**: https://github.com/xjjm123123123/airdemo-showroom
- **快速配置指南**: `VERCEL_QUICK_START.md`
- **详细部署文档**: `docs/VERCEL_DEPLOYMENT.md`

---

## 💡 提示

1. **环境变量名区分大小写**，请完全按照上面的格式输入
2. **Value 值不要有多余的空格**
3. **VITE_ 前缀的变量**会被注入到前端代码
4. **无 VITE_ 前缀的变量**只能在 Serverless 函数中访问
5. 修改环境变量后需要**重新部署**才能生效

---

## 🎉 完成后

你的 AI 巡检系统将能够：

✅ 分析监控图像  
✅ 识别违规行为  
✅ 显示详细结果卡片  
✅ **真正写入飞书多维表格**  

享受你的 AI 巡检系统吧！🚀
