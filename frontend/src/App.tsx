import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Lazy loading pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').catch(() => ({ default: () => <div>Dashboard placeholder</div> })));
const JobListPage = React.lazy(() => import('./pages/JobListPage').catch(() => ({ default: () => <div>Job List placeholder</div> })));
const KanbanPage = React.lazy(() => import('./pages/KanbanPage').catch(() => ({ default: () => <div>Kanban placeholder</div> })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').catch(() => ({ default: () => <div>Profile placeholder</div> })));

/** Show LandingPage when logged-out, Dashboard when logged-in */
function RootRoute() {
  const { user, loading } = useAuthContext();
  if (loading) return null;
  return user ? <DashboardPage /> : <LandingPage />;
}

/** Hide navbar on certain public pages */
const NAVBAR_HIDDEN_PATHS = ['/', '/login', '/register', '/verify-email'];

function AppLayout() {
  const location = useLocation();
  const { user } = useAuthContext();
  
  // Show navbar only when logged in, OR when on a protected page
  const showNavbar = user && !NAVBAR_HIDDEN_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {showNavbar && <Navbar />}
      <main>
        <React.Suspense fallback={
          <div className="flex h-[calc(100vh-64px)] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--color-coral)', borderTopColor: 'transparent' }}></div>
          </div>
        }>
          <Routes>
            {/* Smart root: LandingPage or Dashboard */}
            <Route path="/" element={<RootRoute />} />

            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/kanban" element={<KanbanPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
