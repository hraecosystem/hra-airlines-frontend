// app/auth/verify-otp/page.tsx
"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Key, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("hra_user_email");
    const savedId    = localStorage.getItem("hra_user_id");
    if (!savedEmail || !savedId) {
      router.replace("/auth/register");
      return;
    }
    setEmail(savedEmail);
    setUserId(savedId);
  }, [router]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      setMessage({ text: "Please enter the OTP.", isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post("/auth/verify-otp", { userId, otpCode: otp });
      setMessage({ text: res.data.message, isError: false });
      // cleanup and redirect after a brief pause
      setTimeout(() => {
        localStorage.removeItem("hra_user_email");
        localStorage.removeItem("hra_user_id");
        router.push("/auth/login");
      }, 1500);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Verification failed.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post("/auth/resend-otp", { email });
      setMessage({ text: res.data.message, isError: false });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Resend failed.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verify Your Email | HRA Airlines</title>
        <meta name="description" content="Enter the OTP sent to your email to complete registration." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
        >
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Verify Your Email
          </h1>

          <p className="text-center text-gray-600 mb-6">
            We’ve sent an OTP to <strong>{email}</strong>
          </p>

          {/* OTP Input */}
          <div className="relative mb-4">
            <label htmlFor="otp" className="sr-only">OTP Code</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <Key className="absolute top-3 left-3 text-gray-400" size={20} />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <button
              onClick={handleVerify}
              disabled={loading}
              className="flex-1 flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading && <span className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
              Verify OTP
            </button>
            <button
              onClick={handleResend}
              disabled={loading}
              className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className="mr-2" size={18} /> Resend OTP
            </button>
          </div>

          {/* Message */}
          {message && (
            <p className={`text-center text-sm ${message.isError ? "text-red-600" : "text-green-600"}`}>
              {message.text}
            </p>
          )}

          {/* Already Verified */}
          <p className="mt-6 text-center text-gray-600 text-sm">
            Already verified?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-pink-600 font-medium hover:underline"
            >
              Go to Login
            </button>
          </p>
        </motion.div>
      </div>
    </>
  );
}
