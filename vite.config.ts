import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 8080,
        host: 'localhost',
        strictPort: true,
        // 代理配置，解决 CORS 跨域问题
        proxy: {
          '/api/webhook': {
            target: 'https://bytedance.larkoffice.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/webhook/, '/base/automation/webhook'),
            secure: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_BASE_URL': JSON.stringify(env.GEMINI_BASE_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
