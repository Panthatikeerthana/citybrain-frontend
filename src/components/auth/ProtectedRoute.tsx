import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Radio } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-[#173D35] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Radio className="w-6 h-6 text-[#188568]" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#202B29]">
          <span className="w-2 h-2 rounded-full bg-[#188568] animate-ping" />
          <span>Verifying City Brain Command Session...</span>
        </div>
        <p className="text-xs text-[#697773] mt-1 font-mono">Hyderabad Sector Operations</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to /login and preserve destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * For routes like /login and /register.
 * Redirects already authenticated users directly to the dashboard.
 */
export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#188568] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
