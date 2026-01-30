# 前端环境变量配置说明（线上）

## 目标
让线上 AirDemo 前端通过 API 读取后台管理系统的数据，实现 Demo 与数字伙伴的实时同步。

## 必配变量
- VITE_API_BASE  
  说明：后端 API 基址  
  示例：  
  - 同域：/api  
  - 跨域：https://backend.yourdomain.com/api

- VITE_AILY_CHAT_ENDPOINT  
  说明：首页 AI 助手对话接口  
  示例：  
  - 同域：/api/aily  
  - 跨域：https://backend.yourdomain.com/api/aily

## 可选变量
- VITE_WRITE_VIOLATION_WEBHOOK  
  说明：巡检写回 Webhook 代理  
  示例：  
  - 同域：/api/webhook  
  - 跨域：https://backend.yourdomain.com/api/webhook

## 推荐部署方式
### 方案 A：同域部署（推荐）
前端域名与后台域名一致，通过网关转发 /api
```
VITE_API_BASE=/api
VITE_AILY_CHAT_ENDPOINT=/api/aily
VITE_WRITE_VIOLATION_WEBHOOK=/api/webhook
```

### 方案 B：前后端分离部署
前端与后台不同域名
```
VITE_API_BASE=https://backend.yourdomain.com/api
VITE_AILY_CHAT_ENDPOINT=https://backend.yourdomain.com/api/aily
VITE_WRITE_VIOLATION_WEBHOOK=https://backend.yourdomain.com/api/webhook
```

## 平台配置示例
### Vercel
在 Project Settings → Environment Variables 中添加：
```
VITE_API_BASE=https://backend.yourdomain.com/api
VITE_AILY_CHAT_ENDPOINT=https://backend.yourdomain.com/api/aily
VITE_WRITE_VIOLATION_WEBHOOK=https://backend.yourdomain.com/api/webhook
```

### Nginx 反向代理（同域）
```
location /api/ {
  proxy_pass http://backend:3002/;
}
```

### K8s Ingress（同域）
```
path: /api
pathType: Prefix
backend:
  service:
    name: backend
    port:
      number: 3002
```

## 验证方法
1. 打开浏览器控制台执行：
```
fetch(`${import.meta.env.VITE_API_BASE}/tools`).then(r => r.json())
```
2. 返回 code=0 且 data 有内容，说明连接成功。
