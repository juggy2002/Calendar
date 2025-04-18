// packages/web/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import CreateUserPage from './CreateUserPage';
import PortalPage from './PortalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/admin" element={<HomePage />} />
        <Route path="/login/admin/create-user" element={<CreateUserPage />} />
        <Route path="/login/admin/edit-user/:id" element={<CreateUserPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
