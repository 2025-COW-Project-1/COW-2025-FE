import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 기존 로컬 백엔드용 (유지)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      // ✅ 원격 서버 테스트용 추가
      // 호출은 /remote/api/admin/login 이런 식으로 함
      '/remote': {
        target: 'https://recruit.bluerack.org',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/remote/, ''),
        cookieDomainRewrite: {
          'recruit.bluerack.org': 'localhost',
        },
      },
    },
  },
});
