"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CreditCard, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

type Method = "stripe" | "hra-coin";

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [selected, setSelected] = useState<Method>("stripe");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login?redirect=/payment");
    }
  }, [authLoading, user, router]);

  // Fetch Stripe Checkout Session
  useEffect(() => {
    const fetchPaymentUrl = async () => {
      if (!user || selected !== "stripe") return;

      setLoading(true);
      setError("");
      try {
        const { data } = await api.post("/payment/create-checkout-session");
        if (!data?.url) throw new Error("Missing Stripe URL.");
        setPaymentUrl(data.url);
      } catch (err: any) {
        console.error("❌ Stripe checkout error:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to initiate Stripe checkout.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentUrl();
  }, [authLoading, user, selected]);

  const handlePay = () => {
    if (selected === "stripe") {
      if (!paymentUrl) {
        alert("Stripe session is not ready. Try again or contact support.");
        return;
      }
      window.location.href = paymentUrl;
    } else {
      alert("🚀 HRA‑Coin payments are coming soon!");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Checking authentication…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment | HRA Airlines</title>
        <meta
          name="description"
          content="Complete your flight booking payment securely using Stripe or HRA‑Coin."
        />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-extrabold text-center text-blue-800 mb-6">
            💳 Choose Payment Method
          </h1>

          {/* Toggle buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setSelected("stripe")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                selected === "stripe"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <CreditCard className={selected === "stripe" ? "text-white" : "text-gray-600"} />
              Stripe
            </button>

            <button
              onClick={() => setSelected("hra-coin")}
              disabled
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                selected === "hra-coin"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 cursor-not-allowed"
              }`}
              title="Coming soon"
            >
              <DollarSign className="text-gray-600" />
              HRA‑Coin
            </button>
          </div>

          {/* Payment Content */}
          {loading ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span>Preparing checkout…</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center">
              {error}
              <div className="mt-2">
                <button
                  onClick={() => router.push("/dashboard/bookings")}
                  className="underline text-sm text-blue-600 hover:text-blue-800"
                >
                  View My Bookings
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-600 mb-6">
                {selected === "stripe"
                  ? "You will be redirected to Stripe to complete your payment."
                  : "HRA‑Coin payments will be enabled soon."}
              </p>

              <button
                onClick={handlePay}
                disabled={selected === "stripe" && !paymentUrl}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {selected === "stripe" ? "Pay Now with Stripe" : "Coming Soon"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
