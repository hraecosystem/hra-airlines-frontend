// app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendOtp = async () => {
    if (!email.trim() || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setMessage("");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.post("/auth/request-reset", { email: email.trim() });
      setMessage("✅ OTP sent! Check your inbox.");
      localStorage.setItem("hra_reset_email", email.trim());
      setTimeout(() => router.push("/auth/reset-password"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password | HRA Airlines</title>
        <meta
          name="description"
          content="Reset your HRA Airlines password by entering your registered email."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-pink-100 p-4 rounded-full mb-4">
              <Mail className="w-6 h-6 text-pink-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Forgot Password
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Enter your registered email to receive a reset OTP.
            </p>
          </div>

          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              error ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-pink-300"
            } mb-4`}
            placeholder="you@example.com"
            disabled={loading}
          />

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm mb-4 text-center">{message}</p>
          )}

          <motion.button
            onClick={handleSendOtp}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mb-2"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {loading ? "Sending OTP…" : "Send OTP"}
          </motion.button>

          <button
            onClick={() => router.push("/auth/login")}
            className="w-full text-center text-sm text-pink-600 hover:underline mt-2"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </>
  );
}
