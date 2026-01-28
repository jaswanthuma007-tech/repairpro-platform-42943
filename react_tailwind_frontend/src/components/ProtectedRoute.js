import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
export function ProtectedRoute() {
  /** Requires authenticated session; otherwise redirects to /login. */
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// PUBLIC_INTERFACE
export function RoleRoute({ allowedRoles }) {
  /** Requires user role in allowedRoles; otherwise redirects to a safe dashboard. */
  const { loading, session, role } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (!allowedRoles?.includes(role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
