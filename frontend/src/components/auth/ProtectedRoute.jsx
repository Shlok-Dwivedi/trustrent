import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

/**
 * Wraps a route and redirects to login if the user is not authenticated.
 * Optional `role` prop restricts access to users with that role.
 * redirectTo: where to send unauthenticated users (defaults to /auth/tenant)
 */
export default function ProtectedRoute({ children, role, redirectTo = '/auth/tenant' }) {
  const { isAuthenticated, user, isChecking } = useAuthStore();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Handle incomplete profiles
  if (!user?.is_profile_complete && !window.location.pathname.startsWith('/auth')) {
    const authPath = user?.role === 'landlord' ? '/auth/landlord' : '/auth/tenant';
    return <Navigate to={authPath} replace />;
  }

  if (role && user?.role !== role) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    
    // Wrong role — send to their own dashboard
    const correctDash = user?.role === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard';
    return <Navigate to={correctDash} replace />;
  }

  return children;
}
