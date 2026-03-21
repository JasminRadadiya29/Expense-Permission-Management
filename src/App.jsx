import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalPointer from './components/GlobalPointer.jsx';
import { ShootingStarsBackground } from './components/ShootingStarsBackground.jsx';
import { ToastProvider } from './components/Toast.jsx';
import Login from './views/Login';
import Signup from './views/Signup';
import ChangePassword from './views/ChangePassword';
import AdminDashboard from './views/AdminDashboard';
import EmployeeExpenses from './views/EmployeeExpenses';
import ManagerDashboard from './views/ManagerDashboard';
import ApprovalRules from './views/ApprovalRules';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* Animated spinner */}
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-700 mb-2">Loading your workspace</p>
          <p className="text-sm text-slate-500">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'Admin') {
    return <AdminDashboard />;
  } else if (user.role === 'Manager') {
    return <ManagerDashboard />;
  } else {
    return <EmployeeExpenses />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <ShootingStarsBackground />
          <GlobalPointer />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  {/* Animated spinner */}
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-lg font-medium text-slate-700 mb-2">Initializing application</p>
                <p className="text-sm text-slate-500">Setting things up for you...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />

              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardRouter />} />

                <Route path="expenses" element={
                  <ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']}>
                    <EmployeeExpenses />
                  </ProtectedRoute>
                } />

                <Route path="approvals" element={
                  <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } />

                <Route path="users" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="approval-rules" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ApprovalRules />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;