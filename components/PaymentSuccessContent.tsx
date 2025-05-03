"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

type Status = "loading" | "success" | "error";

export default function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [status, setStatus]     = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(7);

  // 1. Verify payment session
  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("Missing payment session.");
      return;
    }
    api.post<{ bookingId: string }>("/payment/verify-session", { sessionId })
      .then(res => {
        if (res.data.bookingId) setStatus("success");
        else {
          setStatus("error");
          setErrorMsg("Payment could not be confirmed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Failed to verify payment. Try again later.");
      });
  }, [sessionId]);

  // 2a. Decrement countdown once per second (after we switch to "success")
  useEffect(() => {
    if (status !== "success") return;
    const timer = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // 2b. When countdown reaches zero, do the navigation
  useEffect(() => {
    if (status === "success" && countdown <= 0) {
      router.replace("/dashboard/bookings");
    }
  }, [status, countdown, router]);

  // ... your existing JSX below, unchanged ...
  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-green-500 animate-spin" />
            <p className="text-gray-600">Verifying your payment…</p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="text-2xl font-bold text-red-700">Oops!</h2>
            <p className="text-gray-600">{errorMsg}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/payment")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Retry Payment
            </motion.button>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="text-2xl font-bold text-green-700">Payment Successful!</h1>
            <p className="text-gray-700">
              Thank you for your payment. Your booking is confirmed.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your bookings in <strong>{countdown}</strong> second
              {countdown !== 1 && "s"}…
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/bookings")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View My Bookings Now
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
