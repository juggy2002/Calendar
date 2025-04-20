// packages/web/src/App.js

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import { getMe, logout } from './api';      // <-- import your API helpers
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import CreateUserPage from './CreateUserPage';
import PortalPage from './PortalPage';

function AppRoutes() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // On initial load, check if already logged in
  useEffect(() => {
    getMe()
      .then(u => {
        setUser(u);
        if (window.location.pathname === '/login') {
          navigate('/portal', { replace: true });
        }
      })
      .catch(() => {
        setUser(null);
        if (window.location.pathname.startsWith('/portal')) {
          navigate('/login', { replace: true });
        }
      });
  }, [navigate]);

  // Called by LoginPage when login succeeds
  const handleLogin = userData => {
    setUser(userData);
    navigate('/portal');
  };

  // Called by PortalPage when logout is clicked
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // If not logged in, force show LoginPage
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated routes
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/portal" replace />} />
      <Route path="/portal" element={<PortalPage user={user} onLogout={handleLogout} />} />
      <Route path="/login/admin" element={<HomePage />} />
      <Route path="/login/admin/create-user" element={<CreateUserPage />} />
      <Route path="/login/admin/edit-user/:id" element={<CreateUserPage />} />
      <Route path="*" element={<Navigate to="/portal" replace />} />
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
