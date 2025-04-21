// app/payment-success/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
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
    // TODO: verify sessionId with backend for real
    setStatus("success");

    // start countdown
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
    <>
      <Head>
        <title>
          {status === "success"
            ? "Payment Successful | HRA Airlines"
            : status === "error"
            ? "Payment Error | HRA Airlines"
            : "Processing Payment…"}
        </title>
        <meta
          name="description"
          content={
            status === "success"
              ? "Your payment was successful! Redirecting to your booking dashboard."
              : status === "error"
              ? "There was an issue with your payment. Please try again."
              : "Verifying your payment…"
          }
        />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 p-6"
      >
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 opacity-50" />
              </div>
              <p className="text-gray-600 mb-2">🔄 Verifying your payment…</p>
              <p className="text-sm text-gray-500">Please wait.</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">Payment Error</h2>
              <p className="text-gray-600 mb-6">
                We couldn’t verify your payment. Please try again.
              </p>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/payment"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Retry Payment
              </motion.a>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4 animate-bounce" />
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
    </>
  );
}
