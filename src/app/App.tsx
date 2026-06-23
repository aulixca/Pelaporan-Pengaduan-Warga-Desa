import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { initializeMockData } from '../utils/mockData';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

import WargaDashboard from '../pages/warga/WargaDashboard';
import CreateReport from '../pages/warga/CreateReport';
import ReportHistory from '../pages/warga/ReportHistory';
import ReportDetail from '../pages/warga/ReportDetail';
import EditReportPage from '../pages/warga/EditReportPage';
import ProfilePage from '../pages/warga/ProfilePage';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminReports from '../pages/admin/AdminReports';
import AdminReportDetail from '../pages/admin/AdminReportDetail';
import CategoryManagement from '../pages/admin/CategoryManagement';
import AdminAccountPage from '../pages/admin/AdminAccountPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    initializeMockData();
  }, []);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/laporan" element={<AdminReports />} />
        <Route path="/admin/laporan/:id" element={<AdminReportDetail />} />
        <Route path="/admin/kategori" element={<CategoryManagement />} />
        <Route path="/admin/akun" element={<AdminAccountPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/warga" replace />} />
      <Route path="/warga" element={<WargaDashboard />} />
      <Route path="/warga/buat-laporan" element={<CreateReport />} />
      <Route path="/warga/riwayat" element={<ReportHistory />} />
      <Route path="/warga/laporan/:id" element={<ReportDetail />} />
      <Route path="/warga/laporan/:id/edit" element={<EditReportPage />} />
      <Route path="/warga/profil" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/warga" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}
