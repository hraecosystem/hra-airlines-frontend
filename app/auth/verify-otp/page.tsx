// app/auth/verify-otp/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Key, RefreshCw } from "lucide-react";
import api from "@/lib/api";

const LOCKOUT_SECONDS = 5 * 60; // 5 minutes

export default function VerifyOtpPage() {
  const router = useRouter();
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // lockout state
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // On mount, grab stored email/userId and focus first input
  useEffect(() => {
    const storedEmail = localStorage.getItem("hra_user_email");
    const storedId = localStorage.getItem("hra_user_id");
    if (!storedEmail || !storedId) {
      router.replace("/auth/register");
      return;
    }
    setEmail(storedEmail);
    setUserId(storedId);
    inputsRef.current[0]?.focus();
  }, [router]);

  // Unlock when countdown reaches zero
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutUntil) {
      timer = setInterval(() => {
        const secsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (secsLeft <= 0) {
          clearInterval(timer);
          setLockoutUntil(null);
          setMessage(null);
        } else {
          setCountdown(secsLeft);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < otp.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d !== "");

  const handleVerify = async () => {
    if (lockoutUntil) return;
    if (!isComplete) {
      setMessage({ text: `Please enter all ${otp.length} digits.`, isError: true });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.post("/auth/verify-otp", {
        email,
        otpCode: otp.join(""),
      });
      // success: clear storage and go to login
      localStorage.removeItem("hra_user_email");
      localStorage.removeItem("hra_user_id");
      router.push("/auth/login");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Verification failed.";
      if (msg.toLowerCase().includes("too many otp")) {
        // start lockout
        setLockoutUntil(Date.now() + LOCKOUT_SECONDS * 1000);
      }
      setMessage({ text: msg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.post("/auth/resend-otp", { email });
      setMessage({ text: data.message, isError: false });
      // reset inputs
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Could not resend OTP.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Verify Your Email</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the {otp.length}-digit code sent to <strong>{email}</strong>
        </p>

        {/* OTP inputs */}
        <div className="flex justify-between mb-4 space-x-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                if (el) inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              disabled={loading || !!lockoutUntil}
              className={`w-12 h-12 text-xl text-center border rounded-lg text-gray-900 ${
                lockoutUntil ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-pink-200 border-gray-300"
              }`}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Lockout notice */}
        {lockoutUntil && (
          <p className="text-center text-red-600 mb-4">
            Too many attempts. Try again in{" "}
            <strong>
              {String(Math.floor(countdown / 60)).padStart(2, "0")}:
              {String(countdown % 60).padStart(2, "0")}
            </strong>
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleVerify}
            disabled={loading || !!lockoutUntil}
            className={`flex-1 py-3 rounded-lg font-semibold text-white transition ${
              loading || lockoutUntil
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
          <button
            onClick={handleResend}
            disabled={loading}
            className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Resending…" : "Resend OTP"}
          </button>
        </div>

        {message && (
          <p
            className={`text-center text-sm ${message.isError ? "text-red-600" : "text-green-600"}`}
          >
            {message.text}
          </p>
        )}

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already verified?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-pink-600 hover:underline"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </main>
  );
}
