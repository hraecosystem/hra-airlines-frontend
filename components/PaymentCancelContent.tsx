// components/PaymentCancelContent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentCancelContent() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // 1️⃣ Clear out any stored bookingId so the user starts fresh
  useEffect(() => {
    localStorage.removeItem("bookingId");
  }, []);

  // 2️⃣ Start the countdown → redirect when it reaches zero
  useEffect(() => {
    if (countdown <= 0) {
      router.replace("/booking");  // back to the booking start
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-md bg-white border border-red-200 p-8 rounded-2xl shadow-lg text-center space-y-4">
        <XCircle className="mx-auto h-16 w-16 text-red-600" />
        <h1 className="text-2xl font-bold text-red-700">Payment Cancelled</h1>
        <p className="text-gray-600">
          Your payment did not complete successfully.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting back to booking in <strong>{countdown}</strong> second
          {countdown !== 1 && "s"}…
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.replace("/booking")}
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          🔁 Go Back Now
        </motion.button>
      </div>
    </motion.div>
  );
}
