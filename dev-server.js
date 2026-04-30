/**
 * 통합 개발 서버
 *
 * - /api/*    → Mock API (백엔드 없이 테스트) 또는 백엔드 프록시
 * - /admin/*  → admin-web (Vite dev server)
 * - /*        → customer-web (Vite dev server)
 *
 * 하나의 포트(3000)에서 두 앱을 동시에 서빙합니다.
 *
 * 테스트 계정:
 *   태블릿: storeCode=STORE1, tableNumber=A1, password=12345678
 *   관리자: storeCode=STORE1, username=admin, password=12345678
 */

import { createServer as createViteServer } from 'vite';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mockApi from './mock-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const USE_MOCK = !process.env.BACKEND_URL;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

async function startServer() {
  const app = express();

  // JSON 파싱
  app.use(express.json());

  // API: Mock 또는 프록시
  if (USE_MOCK) {
    console.log('  📦 Mock API 모드 (백엔드 없이 테스트)');
    app.use('/api', mockApi);
  } else {
    console.log(`  🔗 프록시 모드 → ${BACKEND_URL}`);
    const { createProxyMiddleware } = await import('http-proxy-middleware');
    app.use('/api', createProxyMiddleware({ target: BACKEND_URL, changeOrigin: true }));
  }

  // admin-web Vite dev server
  const adminVite = await createViteServer({
    root: path.resolve(__dirname, 'admin-web'),
    server: { middlewareMode: true },
    appType: 'spa',
    base: '/admin/',
  });

  // customer-web Vite dev server
  const customerVite = await createViteServer({
    root: path.resolve(__dirname, 'customer-web'),
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // /admin/* → admin-web
  app.use('/admin', adminVite.middlewares);

  // /* → customer-web
  app.use(customerVite.middlewares);

  app.listen(PORT, () => {
    console.log('');
    console.log('  🚀 통합 개발 서버 시작');
    console.log(`  ├─ 고객 태블릿:  http://localhost:${PORT}/`);
    console.log(`  ├─ 관리자:       http://localhost:${PORT}/admin`);
    console.log(`  └─ API:          ${USE_MOCK ? 'Mock API' : `프록시 → ${BACKEND_URL}`}`);
    console.log('');
    if (USE_MOCK) {
      console.log('  📋 테스트 계정:');
      console.log('     태블릿: storeCode=STORE1, tableNumber=A1, password=12345678');
      console.log('     관리자: storeCode=STORE1, username=admin, password=12345678');
      console.log('');
      console.log('  💡 실제 백엔드 연결: BACKEND_URL=http://localhost:8080 node dev-server.js');
      console.log('');
    }
  });
}

startServer().catch(console.error);
