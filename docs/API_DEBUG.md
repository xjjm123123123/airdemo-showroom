# API 调试指南

## 问题排查步骤

### 1. 检查环境变量

确认 `.env` 文件配置正确：

```bash
GEMINI_API_KEY=sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495
GEMINI_BASE_URL=https://api.zhizengzeng.com/v1/
```

### 2. 查看浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签页：

**成功的日志应该显示：**
```
使用中转 API: https://api.zhizengzeng.com/v1/
中转 API 响应: {"hasViolation": true, ...}
```

**如果看到错误：**
- `400 Bad Request` - API 格式不对或参数错误
- `401 Unauthorized` - API Key 无效
- `404 Not Found` - API 地址错误
- `Network Error` - 网络问题或 CORS 问题

### 3. 测试 API 连接

可以使用 curl 测试中转 API 是否正常：

```bash
curl https://api.zhizengzeng.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-zk234bab01427c84ba5f4a0f1f1fa633e336943dce1a4495" \
  -d '{
    "model": "gemini-2.0-flash-exp",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "你好"}
        ]
      }
    ]
  }'
```

### 4. 常见问题解决

#### 问题：400 Bad Request

**原因：** 中转 API 可能不支持 `gemini-2.0-flash-exp` 模型

**解决：** 修改 `.env` 文件，尝试其他模型名称：
```bash
# 可以尝试的模型名称
gemini-pro
gemini-pro-vision
gpt-4-vision-preview
```

然后修改 `services/aiVisionService.ts` 中的模型名称。

#### 问题：401 Unauthorized

**原因：** API Key 无效或过期

**解决：** 
1. 检查 API Key 是否正确复制
2. 联系中转 API 提供商确认 Key 状态
3. 尝试重新生成 API Key

#### 问题：CORS 错误

**原因：** 浏览器跨域限制

**解决：** 
1. 确认中转 API 支持 CORS
2. 或者在 `vite.config.ts` 中添加代理配置

#### 问题：图片太大

**原因：** 图片 base64 编码后超过 API 限制

**解决：** 在 `fetchImageAsBase64` 函数中添加图片压缩逻辑

### 5. 降级方案

如果 API 一直无法正常工作，系统会自动使用模拟数据，不影响演示效果。

模拟数据会随机生成违规类型和描述，置信度在 85%-97% 之间。

## 代码结构

```
services/aiVisionService.ts
├── analyzeImageForViolation()      # 主入口，判断使用哪种 API
├── analyzeWithCustomAPI()          # 中转 API 调用（OpenAI 格式）
├── analyzeWithGeminiSDK()          # 官方 Gemini SDK 调用
├── fetchImageAsBase64()            # 图片转 base64
└── getMockAnalysisResult()         # 模拟数据生成
```

## 联系支持

如果问题仍未解决，请提供以下信息：
1. 浏览器控制台的完整错误日志
2. `.env` 文件配置（隐藏 API Key）
3. 中转 API 提供商的文档链接
