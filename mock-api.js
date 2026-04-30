/**
 * Mock API - 백엔드 없이 프론트엔드 테스트용
 *
 * 테스트 계정:
 *   태블릿 로그인: storeCode=STORE1, tableNumber=A1, password=12345678
 *   관리자 로그인: storeCode=STORE1, username=admin, password=12345678
 */

import { Router } from 'express';

const router = Router();

// --- 데이터 ---
let orderIdSeq = 100;
const orders = [];

const categories = [
  {
    id: 1, name: '메인 메뉴', displayOrder: 1,
    subCategories: [
      { id: 10, name: '찌개류', displayOrder: 1 },
      { id: 11, name: '볶음류', displayOrder: 2 },
    ],
  },
  {
    id: 2, name: '음료', displayOrder: 2,
    subCategories: [
      { id: 20, name: '커피', displayOrder: 1 },
      { id: 21, name: '주스', displayOrder: 2 },
    ],
  },
  {
    id: 3, name: '사이드', displayOrder: 3,
    subCategories: [
      { id: 30, name: '밥/면', displayOrder: 1 },
    ],
  },
];

const menuItems = [
  { id: 1, name: '김치찌개', price: 9000, description: '돼지고기 김치찌개', imageUrl: '/images/menu-kimchi-jjigae.svg', subCategoryId: 10, subCategoryName: '찌개류', categoryId: 1, categoryName: '메인 메뉴', displayOrder: 1, isAvailable: true },
  { id: 2, name: '된장찌개', price: 8000, description: '두부 된장찌개', imageUrl: '/images/menu-doenjang-jjigae.svg', subCategoryId: 10, subCategoryName: '찌개류', categoryId: 1, categoryName: '메인 메뉴', displayOrder: 2, isAvailable: true },
  { id: 3, name: '제육볶음', price: 10000, description: '매콤한 제육볶음', imageUrl: '/images/menu-jeyuk.svg', subCategoryId: 11, subCategoryName: '볶음류', categoryId: 1, categoryName: '메인 메뉴', displayOrder: 1, isAvailable: true },
  { id: 4, name: '오징어볶음', price: 11000, description: '매콤 오징어볶음', imageUrl: '/images/menu-ojingeo.svg', subCategoryId: 11, subCategoryName: '볶음류', categoryId: 1, categoryName: '메인 메뉴', displayOrder: 2, isAvailable: true },
  { id: 5, name: '아메리카노', price: 4500, description: '깊고 진한 에스프레소', imageUrl: '/images/menu-americano.svg', subCategoryId: 20, subCategoryName: '커피', categoryId: 2, categoryName: '음료', displayOrder: 1, isAvailable: true },
  { id: 6, name: '카페라떼', price: 5000, description: '부드러운 우유와 에스프레소', imageUrl: '/images/menu-latte.svg', subCategoryId: 20, subCategoryName: '커피', categoryId: 2, categoryName: '음료', displayOrder: 2, isAvailable: true },
  { id: 7, name: '오렌지주스', price: 6000, description: '생과일 오렌지주스', imageUrl: '/images/menu-orange-juice.svg', subCategoryId: 21, subCategoryName: '주스', categoryId: 2, categoryName: '음료', displayOrder: 1, isAvailable: true },
  { id: 8, name: '공기밥', price: 1000, description: '흰쌀밥', imageUrl: '/images/menu-rice.svg', subCategoryId: 30, subCategoryName: '밥/면', categoryId: 3, categoryName: '사이드', displayOrder: 1, isAvailable: true },
  { id: 9, name: '라면사리', price: 1500, description: '라면 사리 추가', imageUrl: '/images/menu-ramyeon.svg', subCategoryId: 30, subCategoryName: '밥/면', categoryId: 3, categoryName: '사이드', displayOrder: 2, isAvailable: true },
];

const FAKE_TOKEN = 'mock-access-token-12345';
const FAKE_REFRESH = 'mock-refresh-token-67890';

function ok(data) {
  return { success: true, data, message: null };
}

function err(status, message, errorCode) {
  return { status, body: { success: false, data: null, message, errorCode } };
}

// --- Auth ---

// 태블릿 로그인
router.post('/auth/table/login', (req, res) => {
  const { storeCode, tableNumber, password } = req.body;
  if (storeCode === 'STORE1' && tableNumber && password === '12345678') {
    return res.json(ok({
      accessToken: FAKE_TOKEN,
      refreshToken: FAKE_REFRESH,
      role: 'TABLE',
      storeId: 1,
      tableId: 1,
    }));
  }
  return res.status(401).json({ success: false, data: null, error: { code: 'AUTHENTICATION_FAILED', message: '인증 정보가 올바르지 않습니다' } });
});

// 관리자 로그인
router.post('/auth/admin/login', (req, res) => {
  const { storeCode, username, password } = req.body;
  if (storeCode === 'STORE1' && username === 'admin' && password === '12345678') {
    return res.json(ok({
      accessToken: FAKE_TOKEN,
      refreshToken: FAKE_REFRESH,
      role: 'MANAGER',
      storeId: 1,
      staffId: 1,
    }));
  }
  return res.status(401).json({ success: false, data: null, error: { code: 'AUTHENTICATION_FAILED', message: '인증 정보가 올바르지 않습니다' } });
});

// 토큰 갱신
router.post('/auth/refresh', (_req, res) => {
  res.json(ok({ accessToken: FAKE_TOKEN, refreshToken: FAKE_REFRESH }));
});

// 로그아웃
router.post('/auth/logout', (_req, res) => {
  res.json(ok({ message: '로그아웃 되었습니다' }));
});

// --- Category ---
router.get('/stores/:storeId/categories', (_req, res) => {
  res.json(ok(categories));
});

// --- Menu ---
router.get('/stores/:storeId/menus', (req, res) => {
  const subCategoryId = req.query.subCategoryId ? Number(req.query.subCategoryId) : null;
  const filtered = subCategoryId
    ? menuItems.filter((m) => m.subCategoryId === subCategoryId)
    : menuItems;
  res.json(ok(filtered));
});

router.get('/stores/:storeId/menus/:menuId', (req, res) => {
  const item = menuItems.find((m) => m.id === Number(req.params.menuId));
  if (!item) return res.status(404).json({ success: false, data: null, message: '메뉴를 찾을 수 없습니다', errorCode: 'NOT_FOUND' });
  res.json(ok(item));
});

// --- Order ---
router.post('/stores/:storeId/orders', (req, res) => {
  const { tableId, items } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, data: null, message: '주문 항목이 비어있습니다', errorCode: 'VALIDATION_ERROR' });
  }

  const id = ++orderIdSeq;
  const now = new Date().toISOString();
  const orderNumber = `${now.slice(0, 10).replace(/-/g, '')}-${now.slice(11, 19).replace(/:/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const orderItems = items.map((item, idx) => {
    const menu = menuItems.find((m) => m.id === item.menuItemId);
    return {
      id: id * 100 + idx,
      menuItemId: item.menuItemId,
      menuName: menu?.name ?? 'Unknown',
      quantity: item.quantity,
      unitPrice: menu?.price ?? 0,
      subtotal: (menu?.price ?? 0) * item.quantity,
    };
  });

  const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

  const order = {
    id,
    orderNumber,
    tableId: tableId ?? 1,
    tableNumber: 'A1',
    sessionId: 10,
    status: 'PENDING',
    items: orderItems,
    totalAmount,
    createdAt: now,
  };

  orders.unshift(order);
  res.status(201).json(ok(order));
});

router.get('/stores/:storeId/orders', (req, res) => {
  const page = Number(req.query.page ?? 0);
  const size = Number(req.query.size ?? 20);
  const start = page * size;
  const content = orders.slice(start, start + size);

  res.json(ok({
    content,
    page,
    size,
    totalElements: orders.length,
    totalPages: Math.ceil(orders.length / size),
    last: start + size >= orders.length,
  }));
});

// --- Dashboard (admin) ---
router.get('/stores/:storeId/dashboard', (_req, res) => {
  const tableOrders = orders.filter((o) => o.tableId === 1);
  res.json(ok({
    tables: [
      {
        tableId: 1,
        tableNumber: 'A1',
        hasActiveSession: tableOrders.length > 0,
        totalOrderAmount: tableOrders.reduce((s, o) => s + o.totalAmount, 0),
        orderCount: tableOrders.length,
        latestOrders: tableOrders.slice(0, 3).map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmount: o.totalAmount,
          itemSummary: o.items.map((i) => `${i.menuName} x${i.quantity}`).join(', '),
          createdAt: o.createdAt,
        })),
      },
      { tableId: 2, tableNumber: 'A2', hasActiveSession: false, totalOrderAmount: 0, orderCount: 0, latestOrders: [] },
      { tableId: 3, tableNumber: 'B1', hasActiveSession: false, totalOrderAmount: 0, orderCount: 0, latestOrders: [] },
    ],
  }));
});

// --- SSE (stub) ---
router.get('/stores/:storeId/orders/subscribe', (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write('event: HEARTBEAT\ndata: {"timestamp":"' + new Date().toISOString() + '"}\n\n');
});

export default router;
