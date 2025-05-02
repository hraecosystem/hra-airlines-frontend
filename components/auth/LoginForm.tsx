// components/auth/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      const id = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(id);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Both email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);

      // login succeeded → go home
      router.push("/");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Unable to sign in. Please try again.";

      if (msg.toLowerCase().includes("not verified")) {
        // persist for OTP step
        localStorage.setItem("hra_user_email", email.trim());
        // if the backend returns an ID, store that, too:
        if (err.response?.data?.userId) {
          localStorage.setItem("hra_user_id", err.response.data.userId);
        }
        // send them to Verify OTP
        router.push("/auth/verify-otp");
        return;
      }

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8"
    >
      <h1 className="text-center text-3xl font-extrabold text-blue-700 mb-6">
        Welcome Back
      </h1>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={submitting}
            className="absolute right-3 top-3 text-gray-500 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full flex justify-center items-center py-3 rounded-xl font-semibold text-white transition ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          }`}
        >
          {submitting && (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
                className="opacity-75"
              />
            </svg>
          )}
          {submitting ? "Signing in…" : "Sign In"}
        </button>

        <div className="mt-6 flex justify-between text-sm">
          <button
            type="button"
            onClick={() => router.push("/auth/forgot-password")}
            disabled={submitting}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Forgot Password?
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            disabled={submitting}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Create Account
          </button>
        </div>
      </form>
    </motion.section>
  );
}
