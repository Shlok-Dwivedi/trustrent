import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './store/useAuthStore';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LandingPage from './pages/shared/LandingPage';
import NotFound from './pages/shared/NotFound';
import TenantDashboard from './pages/tenant/TenantDashboard';
import LandlordDashboard from './pages/landlord/LandlordDashboard';
import AddPropertyPage from './pages/landlord/AddPropertyPage';
import TenantAuthFlow from './pages/auth/TenantAuthFlow';
import LandlordAuthFlow from './pages/auth/LandlordAuthFlow';
import PropertySearch from './pages/Search/PropertySearch';
import PropertyDetail from './pages/PropertyDetail/PropertyDetail';
import SavedProperties from './pages/dashboard/SavedProperties';
import ProfilePage from './pages/dashboard/ProfilePage';
import VisitManagement from './pages/dashboard/VisitManagement';
import MessagesPage from './pages/dashboard/MessagesPage';
import AboutPage from './pages/static/AboutPage';
import HowItWorks from './pages/static/HowItWorks';
import LegalPrivacy from './pages/static/LegalPrivacy';
import LegalTerms from './pages/static/LegalTerms';
import TrustSafetyPage from './pages/static/TrustSafetyPage';
import HelpPage from './pages/static/HelpPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-center"
        gutter={12}
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500' },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }}
      />

      <Routes>
        {/* ── Admin (No MainLayout) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin" redirectTo="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/" element={<MainLayout />}>
          {/* ── Public ── */}
          <Route index element={<LandingPage />} />
          <Route path="search" element={<PropertySearch />} />
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="privacy" element={<LegalPrivacy />} />
          <Route path="terms" element={<LegalTerms />} />
          <Route path="trust-safety" element={<TrustSafetyPage />} />
          <Route path="help" element={<HelpPage />} />

          {/* ── Auth ── */}
          <Route path="auth/tenant"   element={<TenantAuthFlow />} />
          <Route path="auth/landlord" element={<LandlordAuthFlow />} />

          {/* ── Protected: Tenant ── */}
          <Route path="tenant/dashboard" element={
            <ProtectedRoute role="tenant" redirectTo="/auth/tenant">
              <TenantDashboard />
            </ProtectedRoute>
          } />
          <Route path="dashboard/saved" element={
            <ProtectedRoute redirectTo="/auth/tenant">
              <SavedProperties />
            </ProtectedRoute>
          } />
          <Route path="dashboard/profile" element={
            <ProtectedRoute redirectTo="/auth/tenant">
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="dashboard/visits" element={
            <ProtectedRoute redirectTo="/auth/tenant">
              <VisitManagement />
            </ProtectedRoute>
          } />
          <Route path="dashboard/messages" element={
            <ProtectedRoute redirectTo="/auth/tenant">
              <MessagesPage />
            </ProtectedRoute>
          } />

          {/* ── Protected: Landlord ── */}
          <Route path="landlord/dashboard" element={
            <ProtectedRoute role="landlord" redirectTo="/auth/landlord">
              <LandlordDashboard />
            </ProtectedRoute>
          } />
          <Route path="landlord/properties/add" element={
            <ProtectedRoute role="landlord" redirectTo="/auth/landlord">
              <AddPropertyPage />
            </ProtectedRoute>
          } />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
