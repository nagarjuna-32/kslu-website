import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Notes from './pages/Notes';
import Papers from './pages/Papers';
import MaterialDetail from './pages/MaterialDetail';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminModeration from './pages/Admin/Moderation';
import AdminContent from './pages/Admin/ContentManagement';
import AdminUsers from './pages/Admin/UserManagement';
import AdminAnnouncements from './pages/Admin/Announcements';
import AdminAnalytics from './pages/Admin/Analytics';
import AdminLogs from './pages/Admin/ActivityLogs';
import AdminSettings from './pages/Admin/Settings';

// Helper auth guard component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      
      {/* Conditionally render navbar/footer only if not inside admin layout */}
      <Routes>
        {/* Admin layout path overrides global navbar/footer */}
        <Route path="/admin/*" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>

      <div className="flex-grow">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/materials/:id" element={<MaterialDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* User Protected Views */}
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Nested Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback navigation */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*" element={<Footer />} />
      </Routes>

    </div>
  );
};

export default AppRoutes;
