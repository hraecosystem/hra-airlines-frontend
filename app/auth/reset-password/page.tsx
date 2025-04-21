// app/auth/reset-password/page.tsx
"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { Key, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Pull saved email; if missing, bounce back
  useEffect(() => {
    const saved = localStorage.getItem("hra_reset_email");
    if (!saved) {
      router.push("/auth/forgot-password");
    } else {
      setEmail(saved);
    }
  }, [router]);

  const handleReset = async () => {
    if (!otpCode.trim() || !newPassword || !confirmPassword) {
      setMessage({ text: "All fields are required.", isError: true });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await api.post("/auth/reset-password", { email, otpCode, newPassword });
      localStorage.removeItem("hra_reset_email");
      setMessage({ text: "Password reset successful! Redirecting…", isError: false });
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Reset failed. Try again.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | HRA Airlines</title>
        <meta name="description" content="Reset your HRA Airlines account password securely." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Reset Your Password
          </h1>

          {/* OTP */}
          <div className="relative mb-4">
            <label htmlFor="otp" className="sr-only">OTP Code</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter OTP Code"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={loading}
            />
            <Key className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          {/* New Password */}
          <div className="relative mb-4">
            <label htmlFor="new-password" className="sr-only">New Password</label>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative mb-6">
            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          {/* Feedback */}
          {message && (
            <p
              className={`mb-4 text-center text-sm ${
                message.isError ? "text-red-600" : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
              </svg>
            )}
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </motion.div>
      </div>
    </>
  );
}
