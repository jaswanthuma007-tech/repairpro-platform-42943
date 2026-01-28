import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BookingPage from "./pages/BookingPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardRouter from "./pages/DashboardRouter";
import PlaceholderPage from "./pages/PlaceholderPage";
import ServiceCenterLocatorPage from "./pages/ServiceCenterLocatorPage.jsx";

// PUBLIC_INTERFACE
function App() {
  /** App entry component: routing + providers. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/category/:slug" element={<PlaceholderPage title="Category" subtitle="Coming soon." />} />
          <Route path="/services" element={<PlaceholderPage title="Services" subtitle="Browse services in Book Repair." />} />
          <Route path="/service-centers" element={<ServiceCenterLocatorPage />} />
          <Route path="/cart" element={<PlaceholderPage title="Cart" subtitle="Coming soon." />} />

          <Route element={<ProtectedRoute />}>
            {/*
              Canonical post-login router: role -> correct dashboard.
              (Backwards-compatible: old routes are still defined below.)
            */}
            <Route path="/dashboard" element={<DashboardRouter />} />

            <Route path="/book" element={<BookingPage />} />

            {/* Canonical dashboard paths (authoritative requirement) */}
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />

            <Route element={<RoleRoute allowedRoles={["technician", "admin"]} />}>
              <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Legacy paths (keep working) */}
            <Route path="/my" element={<CustomerDashboard />} />
            <Route element={<RoleRoute allowedRoles={["technician", "admin"]} />}>
              <Route path="/tech" element={<TechnicianDashboard />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<PlaceholderPage title="Not found" subtitle="The page you requested does not exist." />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
