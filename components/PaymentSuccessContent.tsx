// components/PaymentSuccessContent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // TODO: call your backend to verify the sessionId if you need to
    setStatus("success");

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.replace("/dashboard/bookings");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, router]);

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        {status === "loading" && (
          <>
            <motion.div
              className="mx-auto mb-4 animate-spin"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CheckCircle2 className="h-12 w-12 text-green-500 opacity-50" />
            </motion.div>
            <p className="text-gray-600 mb-2">🔄 Verifying your payment…</p>
            <p className="text-sm text-gray-500">Please wait.</p>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div
              className="mx-auto mb-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <AlertCircle className="h-12 w-12 text-red-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">
              We couldn’t verify your payment. Please try again.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/payment")}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Retry Payment
            </motion.button>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              className="mx-auto mb-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-700 mb-2">
              Thank you for your payment. Your booking is confirmed.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to your bookings in <strong>{countdown}</strong> second
              {countdown !== 1 && "s"}…
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/bookings")}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to My Bookings
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
