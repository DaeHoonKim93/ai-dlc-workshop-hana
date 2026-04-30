import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import TableManagementPage from '@/pages/TableManagementPage';
import MenuManagementPage from '@/pages/MenuManagementPage';
import StaffManagementPage from '@/pages/StaffManagementPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* 인증 필요 라우트 */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tables/:tableId/orders" element={<OrderDetailPage />} />
        <Route path="/tables" element={<TableManagementPage />} />

        {/* MANAGER 전용 */}
        <Route
          path="/menus"
          element={
            <ProtectedRoute requiredRole="MANAGER">
              <MenuManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRole="MANAGER">
              <StaffManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
