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
      className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-all duration-300"
    >
      <h1 className="text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
        Welcome Back
      </h1>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative group">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <Mail className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-800 transition-all duration-200 hover:border-blue-300"
          />
        </div>

        <div className="relative group">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <Lock className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-800 transition-all duration-200 hover:border-blue-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={submitting}
            className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
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
