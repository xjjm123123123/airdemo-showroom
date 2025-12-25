# 生产环境诊断脚本

## 快速诊断

在浏览器控制台（F12 → Console）中运行以下脚本来诊断问题：

```javascript
// ============================================
// AILY 生产环境诊断脚本
// ============================================

console.log('🔍 开始诊断 AILY 生产环境...\n');

// 1. 检查环境变量
console.log('📋 1. 环境变量检查');
console.log('-------------------');
console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ 已配置' : '❌ 未配置');
console.log('Base URL:', process.env.GEMINI_BASE_URL || '❌ 未配置');
console.log('');

// 2. 检查当前域名
console.log('📋 2. 域名检查');
console.log('-------------------');
console.log('当前域名:', window.location.origin);
console.log('当前路径:', window.location.pathname);
console.log('');

// 3. 检查图片资源
console.log('📋 3. 图片资源检查');
console.log('-------------------');
const testImages = [
  '东门卫-仓库',
  '生产车间A区',
  '设备维修室',
  '物资储备库',
  '员工休息区'
];

Promise.all(
  testImages.map(name => 
    fetch(`${window.location.origin}/images/${encodeURIComponent(name)}.png`)
      .then(r => ({ name, status: r.status, ok: r.ok }))
      .catch(e => ({ name, status: 'ERROR', ok: false, error: e.message }))
  )
).then(results => {
  results.forEach(r => {
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} ${r.name}: ${r.status}`);
  });
  console.log('');
  
  // 4. 检查 API 连接
  console.log('📋 4. API 连接检查');
  console.log('-------------------');
  
  const apiKey = process.env.GEMINI_API_KEY;
  const baseURL = process.env.GEMINI_BASE_URL;
  
  if (!apiKey || !baseURL) {
    console.log('❌ API 配置不完整，无法测试连接');
    console.log('');
    printSummary();
    return;
  }
  
  console.log('正在测试 API 连接...');
  fetch(`${baseURL}/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })
  .then(r => {
    console.log(`${r.ok ? '✅' : '❌'} API 连接: ${r.status} ${r.statusText}`);
    return r.text();
  })
  .then(text => {
    console.log('API 响应:', text.substring(0, 200));
    console.log('');
    printSummary();
  })
  .catch(e => {
    console.log('❌ API 连接失败:', e.message);
    console.log('');
    printSummary();
  });
});

// 5. 检查 Webhook 配置
console.log('📋 5. Webhook 配置检查');
console.log('-------------------');
console.log('⚠️ Webhook 配置需要在代码中检查');
console.log('提示：查看 services/larkBaseService.ts 中的 CONFIG 对象');
console.log('');

function printSummary() {
  console.log('📋 诊断总结');
  console.log('===================');
  console.log('');
  console.log('✅ 正常项：');
  console.log('  - 如果所有检查都显示 ✅，说明基础配置正常');
  console.log('');
  console.log('❌ 问题项：');
  console.log('  - 如果有 ❌，请根据上面的提示进行修复');
  console.log('');
  console.log('💡 常见问题：');
  console.log('  1. 图片 404：检查 public/images/ 目录是否包含所有图片');
  console.log('  2. API 连接失败：检查 .env 文件中的 API Key 和 Base URL');
  console.log('  3. CORS 错误：需要配置后端代理或使用演示模式');
  console.log('');
  console.log('📖 详细文档：docs/PRODUCTION_DEPLOYMENT.md');
}
```

## 测试 AI 巡检分析

在控制台运行以下代码来测试完整的 AI 巡检流程：

```javascript
// 测试 AI 巡检分析
async function testInspection() {
  console.log('🧪 开始测试 AI 巡检分析...\n');
  
  const checkpoint = '东门卫-仓库';
  const imageUrl = `${window.location.origin}/images/${encodeURIComponent(checkpoint)}.png`;
  
  console.log('1️⃣ 测试图片加载');
  try {
    const imgResponse = await fetch(imageUrl);
    console.log(`${imgResponse.ok ? '✅' : '❌'} 图片加载: ${imgResponse.status}`);
  } catch (e) {
    console.log('❌ 图片加载失败:', e.message);
    return;
  }
  
  console.log('\n2️⃣ 测试 API 调用');
  const apiKey = process.env.GEMINI_API_KEY;
  const baseURL = process.env.GEMINI_BASE_URL;
  
  if (!apiKey || !baseURL) {
    console.log('❌ API 配置不完整');
    return;
  }
  
  try {
    // 获取图片 base64
    const imgBlob = await fetch(imageUrl).then(r => r.blob());
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(imgBlob);
    });
    
    console.log('✅ 图片已转换为 base64');
    
    // 调用 API
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '这张图片中有什么？' },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
            ],
          },
        ],
      }),
    });
    
    console.log(`${response.ok ? '✅' : '❌'} API 调用: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📝 AI 响应:', data.choices?.[0]?.message?.content?.substring(0, 200));
    } else {
      const error = await response.text();
      console.log('❌ API 错误:', error);
    }
  } catch (e) {
    console.log('❌ API 调用失败:', e.message);
  }
  
  console.log('\n✅ 测试完成');
}

// 运行测试
testInspection();
```

## 测试 Webhook 写入

```javascript
// 测试 Webhook 写入
async function testWebhook() {
  console.log('🧪 开始测试 Webhook 写入...\n');
  
  // 注意：需要替换为实际的 Webhook URL
  const webhookUrl = '/api/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb';
  
  const testRecord = {
    action: 'create',
    record: {
      编号: 999,
      日期: '2025/12/25',
      违规情况: '测试违规',
      抓取时间: '2025-12-25 10:00:00',
      位置: '测试点位',
      部门: '测试部门',
      AI生成: '测试数据',
    },
  };
  
  console.log('📤 发送测试数据:', testRecord);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRecord),
    });
    
    console.log(`${response.ok ? '✅' : '❌'} Webhook 响应: ${response.status}`);
    
    const result = await response.text();
    console.log('📥 响应内容:', result);
  } catch (e) {
    console.log('❌ Webhook 调用失败:', e.message);
    
    if (e.message.includes('fetch')) {
      console.log('\n💡 提示：这可能是 CORS 跨域问题');
      console.log('解决方案：');
      console.log('  1. 配置后端代理服务');
      console.log('  2. 或使用演示模式（不写入真实数据）');
    }
  }
  
  console.log('\n✅ 测试完成');
}

// 运行测试
testWebhook();
```

## 查看实时日志

在进行 AI 巡检分析时，打开控制台可以看到详细的日志输出：

```
🔍 使用中转 API 进行图像分析: https://api.zhizengzeng.com/v1/
📍 分析点位: 东门卫-仓库
🔑 API Key: sk-zk234ba...
📥 正在获取图片: https://airdemo.cn/images/东门卫-仓库.png
✅ 图片已转换为 base64，长度: 123456
📤 发送请求到: https://api.zhizengzeng.com/v1/chat/completions
📦 请求模型: gemini-2.0-flash-exp
📨 响应状态: 200 OK
✅ API 响应成功
📝 AI 返回内容: {...}
📝 [writeViolationRecord] 开始写入违规记录
📦 记录内容: {...}
🔧 Webhook URL: /api/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb
📤 发送 Webhook 请求: /api/webhook/event/Oo1MaNfsZwEpMMhIMGBcQEIqnYb
📦 请求体: {...}
📨 响应状态: 200 OK
✅ Webhook 请求成功
```

## 常见错误及解决方案

### 错误 1: `process.env.GEMINI_API_KEY is undefined`

**原因：** 环境变量未正确注入到构建中

**解决：**
1. 检查 `.env` 文件是否存在且包含正确的配置
2. 重新构建项目：`npm run build`
3. 确保 `vite.config.ts` 中的 `define` 配置正确

### 错误 2: `Failed to fetch` 或 `CORS error`

**原因：** 跨域请求被浏览器阻止

**解决：**
1. 开发环境：Vite 代理会自动处理
2. 生产环境：需要配置后端代理服务
3. 临时方案：使用演示模式（不写入真实数据）

### 错误 3: 图片 404

**原因：** 图片文件不存在或路径错误

**解决：**
1. 确保所有图片在 `public/images/` 目录下
2. 检查文件名是否正确（包括中文字符）
3. 构建后检查 `dist/images/` 目录

### 错误 4: API 返回 400 或 401

**原因：** API Key 无效或请求格式错误

**解决：**
1. 验证 API Key 是否正确
2. 检查 Base URL 是否正确
3. 查看 API 响应的详细错误信息
