// app/payment-cancel/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentCancelPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Countdown and then redirect
  useEffect(() => {
    if (countdown <= 0) {
      router.replace("/booking");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <>
      <Head>
        <title>Payment Cancelled | HRA Airlines</title>
        <meta
          name="description"
          content="Your payment was cancelled. You will be redirected back to the booking page shortly."
        />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-6"
      >
        <div className="w-full max-w-md bg-white border border-red-200 p-8 rounded-2xl shadow-lg text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-4">
            Your payment did not complete successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting back to booking in <strong>{countdown}</strong> second
            {countdown === 1 ? "" : "s"}…
          </p>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/booking"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            🔁 Go Back Now
          </motion.a>
        </div>
      </motion.div>
    </>
  );
}
