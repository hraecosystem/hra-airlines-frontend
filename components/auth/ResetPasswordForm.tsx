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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6"
        role="form"
        aria-labelledby="reset-heading"
      >
        <h1
          id="reset-heading"
          className="text-3xl font-bold text-gray-800 text-center"
        >
          Reset Your Password
        </h1>

        {/* Show the email */}
        <div className="text-center text-sm text-gray-600 mb-2">
          Resetting for: <strong>{email}</strong>
        </div>

        {/* OTP */}
        <div className="relative">
          <label htmlFor="otp" className="sr-only">
            OTP Code
          </label>
          <Key className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            inputMode="numeric"
            maxLength={6}
            disabled={loading}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* New Password */}
        <div className="relative">
          <label htmlFor="new-password" className="sr-only">
            New Password
          </label>
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            disabled={loading}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label htmlFor="confirm-password" className="sr-only">
            Confirm Password
          </label>
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            disabled={loading}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <p
            role="alert"
            className={`text-center text-sm font-medium ${
              feedback.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {feedback.text}
          </p>
        )}

        {/* Submit */}
        <motion.button
          onClick={handleReset}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-50 transition"
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
          {loading ? "Resetting…" : "Reset Password"}
        </motion.button>
      </motion.section>
    </main>
  );
}
