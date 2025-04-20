// packages/web/src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';

import { getMe, logout } from './api';
import LoginPage from './LoginPage';
import HomePage from './HomePage';             // admin dashboard
import CreateUserPage from './CreateUserPage';
import PortalPage from './PortalPage';         // regular user portal

function AppRoutes() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then(u => {
        setUser(u);
        // redirect to the correct landing
        if (window.location.pathname === '/login') {
          navigate(u.role === 'admin' ? '/admin' : '/portal', { replace: true });
        }
      })
      .catch(() => setUser(null));
  }, [navigate]);

  const handleLogin = (u) => {
    setUser(u);
    navigate(u.role === 'admin' ? '/admin' : '/portal');
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
  };

  // Not logged in → only /login allowed
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="*"    element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged in → show role‑specific routes
  return (
    <Routes>
      {/* Prevent returning to /login when authed */}
      <Route path="/login" element={<Navigate to={user.role === 'admin' ? '/admin' : '/portal'} replace />} />

      {user.role === 'admin' ? (
        <>
          {/* Admin dashboard */}
          <Route path="/admin"                   element={<HomePage />} />
          <Route path="/admin/create-user"       element={<CreateUserPage />} />
          <Route path="/admin/edit-user/:id"     element={<CreateUserPage />} />

          {/* Any other path for admin goes to /admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </>
      ) : (
        <>
          {/* Regular user portal */}
          <Route
            path="/portal"
            element={<PortalPage user={user} onLogout={handleLogout} />}
          />

          {/* Catch-all for users */}
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
