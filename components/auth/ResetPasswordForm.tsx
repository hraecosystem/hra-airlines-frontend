// components/auth/ResetPasswordForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Key } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // On mount: grab saved email or redirect back
  useEffect(() => {
    const saved = localStorage.getItem("hra_reset_email");
    if (!saved) {
      router.replace("/auth/forgot-password");
    } else {
      setEmail(saved);
    }
  }, [router]);

  const handleReset = async () => {
    // validations
    if (!otpCode.trim() || !newPassword || !confirmPassword) {
      setFeedback({ type: "error", text: "All fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      await api.post("/auth/reset-password", {
        email,
        token: otpCode.trim(),
        newPassword,
      });
      localStorage.removeItem("hra_reset_email");
      setFeedback({
        type: "success",
        text: "Password reset successful! Redirecting to login…",
      });
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Reset failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-all duration-300"
      >
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
          Reset Your Password
        </h1>

        {/* Show the email */}
        <div className="text-center text-sm text-gray-600 mb-2">
          Resetting for: <strong>{email}</strong>
        </div>

        {feedback && (
          <div
            role="alert"
            className={`${
              feedback.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            } px-4 py-3 rounded-lg mb-6 border animate-fade-in`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleReset(); }} className="space-y-5">
          <div className="relative group">
            <label htmlFor="otp" className="sr-only">
              OTP Code
            </label>
            <input
              id="otp"
              type="text"
              placeholder="Enter OTP Code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition-all duration-200 hover:border-blue-300"
            />
            <Key className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
          </div>

          <div className="relative group">
            <label htmlFor="new-password" className="sr-only">
              New Password
            </label>
            <Lock className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              disabled={loading}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition-all duration-200 hover:border-blue-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative group">
            <label htmlFor="confirm-password" className="sr-only">
              Confirm Password
            </label>
            <Lock className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              disabled={loading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition-all duration-200 hover:border-blue-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting password...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </motion.section>
    </main>
  );
}
