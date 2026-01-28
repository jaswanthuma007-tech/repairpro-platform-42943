import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
export default function DashboardRouter() {
  /** Redirects to the correct dashboard based on role. */
  const { role } = useAuth();

  // Canonical dashboard routes (per requirements).
  if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
  if (role === "technician") return <Navigate to="/technician-dashboard" replace />;
  return <Navigate to="/customer-dashboard" replace />;
}
