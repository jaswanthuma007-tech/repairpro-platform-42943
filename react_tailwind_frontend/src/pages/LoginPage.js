import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { supabase } from "../lib/supabaseClient";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Sign-in page for Supabase Auth. */
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("password"); // password | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const redirectTo = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
  const from = location.state?.from?.pathname || "/dashboard";

  async function onLogin(e) {
    e.preventDefault();
    setStatus({ type: "loading", message: "" });
    try {
      const { error } =
        mode === "password"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signInWithOtp({
              email,
              options: { emailRedirectTo: redirectTo }
            });

      if (error) throw error;

      if (mode === "magic") {
        setStatus({ type: "success", message: "Check your email for the login link." });
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setStatus({ type: "error", message: err?.message || "Login failed." });
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-samsung border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-2 text-sm text-gray-600">
            Use your account to book repairs and track status in realtime.
          </p>

          <div className="mt-5 flex rounded-full border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={[
                "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
                mode === "password" ? "bg-white shadow text-gray-900" : "text-gray-600"
              ].join(" ")}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={[
                "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
                mode === "magic" ? "bg-white shadow text-gray-900" : "text-gray-600"
              ].join(" ")}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={onLogin} className="mt-5 space-y-3">
            <label className="block">
              <div className="text-sm font-medium text-gray-700">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </label>

            {mode === "password" && (
              <label className="block">
                <div className="text-sm font-medium text-gray-700">Password</div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </label>
            )}

            {status.type === "error" && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {status.message}
              </div>
            )}
            {status.type === "success" && (
              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={status.type === "loading"}
              className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition"
            >
              {mode === "password" ? "Sign in" : "Send magic link"}
            </button>
          </form>

          <div className="mt-5 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="font-semibold text-blue-700 hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
