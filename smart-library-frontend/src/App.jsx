import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Import Pages
import Login from './pages/Login';
import Layout from './components/Layout';
import PatronDashboard from './pages/PatronDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Circulation from './pages/Circulation';
import PublicSearch from './pages/PublicSearch';
import AiChatbot from './components/AiChatbot';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />; // Chặn không cho vào sai quyền
  return children;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<PublicSearch />} /> {/* Độc giả / Khách vãng lai */}
          
          {/* Protected Routes (Phải đăng nhập) */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            
            {/* Route cho Độc Giả */}
            <Route path="patron-dashboard" element={
              <ProtectedRoute allowedRoles={['patron']}><PatronDashboard /></ProtectedRoute>
            } />

            {/* Route cho Quản lý Thư viện */}
            <Route path="manager-dashboard" element={
              <ProtectedRoute allowedRoles={['library_manager']}><ManagerDashboard /></ProtectedRoute>
            } />

            {/* MỚI: Route cho Admin Hệ thống (IT) */}
            <Route path="admin-dashboard" element={
              <ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>
            } />

            {/* Route cho Thủ thư */}
            <Route path="circulation" element={
              <ProtectedRoute allowedRoles={['super_admin', 'library_manager', 'librarian']}><Circulation /></ProtectedRoute>
            } />

            {/* Chuyển hướng mặc định */}
            <Route index element={<Navigate to="/search" replace />} />
          </Route>
        </Routes>
        {/* Đặt Chatbot ở đây để nó luôn hiển thị trên mọi trang */}
        <AiChatbot />
      </AuthProvider>
    </Router>
  );
}