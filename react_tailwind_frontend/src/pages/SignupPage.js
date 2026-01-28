import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { supabase } from "../lib/supabaseClient";

// PUBLIC_INTERFACE
export default function SignupPage() {
  /** Sign-up page for Supabase Auth. */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const redirectTo = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

  async function onSignup(e) {
    e.preventDefault();
    setStatus({ type: "loading", message: "" });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo }
      });
      if (error) throw error;
      setStatus({
        type: "success",
        message: "Account created. If email confirmation is enabled, check your inbox."
      });
    } catch (err) {
      setStatus({ type: "error", message: err?.message || "Signup failed." });
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-samsung border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
          <p className="mt-2 text-sm text-gray-600">New users default to customer role.</p>

          <form onSubmit={onSignup} className="mt-5 space-y-3">
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

            <label className="block">
              <div className="text-sm font-medium text-gray-700">Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </label>

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
              Create account
            </button>
          </form>

          <div className="mt-5 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-700 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
