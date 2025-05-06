import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import IntegrationDetailPage from './pages/IntegrationDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Componente de rutas principales de la aplicación
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas dentro del layout principal */}
        <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/integrations" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/integrations/:id" element={<MainLayout><IntegrationDetailPage /></MainLayout>} />
        
        {/* Ruta 404 */}
        <Route path="/not-found" element={<MainLayout><NotFoundPage /></MainLayout>} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
