import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleRouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({ allowedRoles, children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-2xl shadow-xs max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shadow-2xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
          Your active account is registered as <strong className="capitalize text-slate-800 font-semibold">{currentUser.role}</strong>. 
          You do not have authorization to view this module. Role-based URL access control is enforced to prevent unauthorized access.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <span>Switch Role Account</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};
