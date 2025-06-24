import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}) => {
  const { user, isLoading } = useAuth();

  // Wait for loading to finish before making any redirect decisions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only redirect if loading is done
  if (requireAuth && !user) {
    return <Navigate to="/signin" replace state={{ from: window.location.pathname + window.location.search }} />;
  }

  // Only redirect to dashboard if loading is done and user is on an auth-only route
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Block unverified users from accessing dashboard or protected routes
  if (user && user.role === 'official' && user.verified === false) {
    return <Navigate to="/auth/official-signup" replace state={{ reason: 'not-verified' }} />;
  }

  return <>{children}</>;
};

export default RouteGuard;
