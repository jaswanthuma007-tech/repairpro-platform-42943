import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
export default function DashboardRouter() {
  /** Redirects to the correct dashboard based on role. */
  const { role } = useAuth();

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "technician") return <Navigate to="/tech" replace />;
  return <Navigate to="/my" replace />;
}
