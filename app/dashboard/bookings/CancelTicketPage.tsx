// app/dashboard/bookings/CancelTicketPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

type CancelResponse = {
  CancelBookingResponse: {
    CancelBookingResult: {
      Errors: "" | { ErrorCode: string; ErrorMessage: string };
      Success: "true" | "false";
      Target: string;
      UniqueID: string;
    };
  };
};

export default function CancelTicketPage() {
  const router = useRouter();
  const params = useSearchParams();
  const pnrFromQuery = params.get("pnr") || "";

  const { user, loading: authLoading } = useAuth();
  const [pnr, setPnr] = useState(pnrFromQuery);

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1) Redirect unauthenticated to login (preserve pnr)
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(
        `/auth/login?redirect=/dashboard/bookings/cancel${pnr ? `?pnr=${encodeURIComponent(pnr)}` : ""}`
      );
    }
  }, [authLoading, user, router, pnr]);

  // 2) Redirect back if no pnr
  useEffect(() => {
    if (!authLoading && user && !pnr) {
      router.replace("/dashboard/bookings");
    }
  }, [authLoading, user, pnr, router]);

  // 3) Sync if URL changes
  useEffect(() => {
    setPnr(pnrFromQuery);
  }, [pnrFromQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnr || disabled) return;

    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const apiRes = await api.post<CancelResponse>(
        "/flights/cancel",
        { UniqueID: pnr },
        { timeout: 30000 }
      );
      const result = apiRes.data.CancelBookingResponse.CancelBookingResult;

      if (result.Success === "true") {
        setToast({ type: "success", message: "✅ Booking cancelled successfully." });
        setTimeout(() => router.push("/dashboard/bookings"), 800);
      } else {
        // Safe-read the error message
        const errObj = result.Errors;
        const msg =
          typeof errObj === "object" && errObj.ErrorMessage
            ? errObj.ErrorMessage
            : "⚠️ Cancellation failed on server. Please contact support.";
        setToast({ type: "error", message: msg });
        setDisabled(true);
      }
    } catch (err: any) {
      let message = "❌ Cancellation failed. Please try again.";
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        message = "⚠️ Cancellation is taking longer than expected. Check back soon.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      setToast({ type: "error", message });
      setDisabled(true);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Verifying session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-red-600 text-center mb-4">
          🛑 Cancel Booking
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Confirm cancellation of your booking. This action cannot be undone.
        </p>

        <form onSubmit={handleSubmit}>
          <motion.button
            type="submit"
            disabled={loading || disabled}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex justify-center items-center px-4 py-2 font-semibold text-white rounded-md transition-colors ${
              loading || disabled ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {disabled ? "Cancelled" : loading ? "Cancelling…" : "Confirm Cancel"}
          </motion.button>
        </form>

        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-6 p-3 rounded-md text-sm ${
                toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
              }`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
