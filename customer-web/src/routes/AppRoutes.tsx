import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import MenuPage from '@/pages/MenuPage';
import CartPage from '@/pages/CartPage';
import OrderConfirmPage from '@/pages/OrderConfirmPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import OrderHistoryPage from '@/pages/OrderHistoryPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* 인증 필요 라우트 */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order/confirm" element={<OrderConfirmPage />} />
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
