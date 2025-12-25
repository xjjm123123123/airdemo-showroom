# 飞书多维表格自动化配置指南

本文档介绍如何配置飞书多维表格自动化，实现 AI 巡检分析结果自动写回「人员违规数据表」。

## 整体流程架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  前端选择点位   │───▶│  Webhook 查询    │───▶│  获取点位图像数据   │
│  (AirDemo)      │    │  (多维表格自动化) │    │  (demo数据表)       │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  写入违规记录   │◀───│  Webhook 写入    │◀───│  AI 图像识别        │
│  (人员违规数据表)│    │  (多维表格自动化) │    │  (Gemini Vision)    │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

## 步骤一：创建「查询点位数据」自动化

### 1.1 进入多维表格自动化

1. 打开你的飞书多维表格
2. 点击右上角「自动化」按钮
3. 点击「新建自动化」

### 1.2 配置触发器

1. 选择触发器类型：**Webhook 触发**
2. 复制生成的 Webhook URL（格式类似：`https://open.feishu.cn/base/automation/webhook/xxx`）
3. 保存这个 URL，后面需要配置到前端

### 1.3 配置动作：查询记录

1. 添加动作：**查询记录**
2. 选择数据表：**demo数据**
3. 配置筛选条件：
   - 字段：`点位`
   - 条件：等于
   - 值：`{{trigger.body.filter.点位}}`（从 Webhook 请求体获取）

### 1.4 配置动作：发送 HTTP 请求（返回结果）

1. 添加动作：**发送 HTTP 请求**
2. 请求方式：POST
3. URL：`{{trigger.body.callback_url}}`（可选，如果需要回调）
4. 请求体：
```json
{
  "success": true,
  "data": {
    "id": "{{query.record_id}}",
    "编号": "{{query.编号}}",
    "点位": "{{query.点位}}",
    "图像": "{{query.图像}}"
  }
}
```

---

## 步骤二：创建「写入违规记录」自动化

### 2.1 配置触发器

1. 选择触发器类型：**Webhook 触发**
2. 复制生成的 Webhook URL
3. 保存这个 URL

### 2.2 配置动作：新增记录

1. 添加动作：**新增记录**
2. 选择数据表：**人员违规数据表**
3. 配置字段映射：

| 字段 | 值来源 |
|------|--------|
| 编号 | `{{trigger.body.record.编号}}` |
| 日期 | `{{trigger.body.record.日期}}` |
| 违规情况 | `{{trigger.body.record.违规情况}}` |
| 违规记录 | `{{trigger.body.record.违规记录}}` |
| 抓取时间 | `{{trigger.body.record.抓取时间}}` |
| 位置 | `{{trigger.body.record.位置}}` |
| 部门 | `{{trigger.body.record.部门}}` |
| AI生成 | `{{trigger.body.record.AI生成}}` |

### 2.3 启用自动化

1. 点击右上角「启用」按钮
2. 确认自动化已激活（状态显示为绿色）

---

## 步骤三：配置前端 Webhook URL

### 3.1 创建环境配置文件

在项目根目录创建 `.env.local` 文件：

```bash
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# 飞书多维表格自动化 Webhook URLs
VITE_QUERY_CHECKPOINT_WEBHOOK=https://open.feishu.cn/base/automation/webhook/xxx
VITE_WRITE_VIOLATION_WEBHOOK=https://open.feishu.cn/base/automation/webhook/yyy
```

### 3.2 更新 larkBaseService.ts

修改 `services/larkBaseService.ts` 中的配置读取：

```typescript
const CONFIG = {
  QUERY_CHECKPOINT_WEBHOOK: import.meta.env.VITE_QUERY_CHECKPOINT_WEBHOOK || '',
  WRITE_VIOLATION_WEBHOOK: import.meta.env.VITE_WRITE_VIOLATION_WEBHOOK || '',
};
```

---

## 步骤四：Webhook 请求格式说明

### 查询点位请求格式

```json
{
  "action": "query",
  "filter": {
    "点位": "东门卫-仓库"
  }
}
```

### 写入违规记录请求格式

```json
{
  "action": "create",
  "record": {
    "编号": 11,
    "日期": "2025/12/24",
    "违规情况": "在岗玩手机",
    "违规记录": "https://example.com/image.png",
    "抓取时间": "2025-12-24 10:30:45",
    "位置": "东门卫-仓库",
    "部门": "生产部",
    "AI生成": "AI识别，置信度85.2%"
  }
}
```

---

## 简化方案：使用飞书开放平台 API

如果自动化配置较为复杂，也可以直接使用飞书开放平台的多维表格 API：

### API 端点

- 查询记录：`GET /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records`
- 新增记录：`POST /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records`

### 获取凭证

1. 前往 [飞书开放平台](https://open.feishu.cn/)
2. 创建应用并获取 App ID 和 App Secret
3. 配置多维表格的读写权限

### 示例代码

```typescript
// 使用飞书开放平台 API
const FEISHU_API = {
  APP_ID: 'your_app_id',
  APP_SECRET: 'your_app_secret',
  APP_TOKEN: 'your_bitable_app_token',
  TABLE_ID_DEMO: 'your_demo_table_id',
  TABLE_ID_VIOLATION: 'your_violation_table_id',
};

// 获取 access_token
async function getAccessToken() {
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: FEISHU_API.APP_ID,
      app_secret: FEISHU_API.APP_SECRET,
    }),
  });
  const data = await response.json();
  return data.tenant_access_token;
}

// 写入违规记录
async function writeViolationRecord(record) {
  const token = await getAccessToken();
  const response = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_API.APP_TOKEN}/tables/${FEISHU_API.TABLE_ID_VIOLATION}/records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fields: {
          '编号': record.编号,
          '日期': record.日期,
          '违规情况': record.违规情况,
          '违规记录': [{ url: record.违规记录 }],
          '抓取时间': record.抓取时间,
          '位置': record.位置,
          '部门': record.部门,
        },
      }),
    }
  );
  return response.json();
}
```

---

## 测试清单

- [ ] Webhook「查询点位」自动化已创建并启用
- [ ] Webhook「写入违规记录」自动化已创建并启用
- [ ] 环境变量 `.env.local` 已配置正确的 Webhook URL
- [ ] 前端可以成功调用 Webhook
- [ ] 违规记录成功写入「人员违规数据表」
- [ ] 刷新多维表格可以看到新增的记录

---

## 常见问题

### Q: Webhook 返回 403 错误
A: 检查多维表格的权限设置，确保自动化有读写权限。

### Q: 图像字段无法写入
A: 图像字段需要使用附件格式，传入 `[{ url: "图像URL" }]` 数组格式。

### Q: 日期格式不正确
A: 飞书多维表格日期字段支持多种格式，建议使用 `YYYY/MM/DD` 或时间戳。

---

## 联系支持

如有问题，请联系飞书技术支持或查阅 [飞书开放平台文档](https://open.feishu.cn/document/)。

