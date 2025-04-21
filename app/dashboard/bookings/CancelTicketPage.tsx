// app/dashboard/bookings/CancelTicketPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function CancelTicketPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/dashboard/bookings/cancel`);
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = bookingId.trim();
    if (!id) {
      return setToast({ type: "error", message: "Please enter a valid Booking ID." });
    }
    if (!confirm(`Cancel booking "${id}"?`)) return;

    setLoading(true);
    setToast(null);
    try {
      const res = await api.post("/flights/cancel", { uniqueId: id });
      const msg = res.data.status === "success"
        ? "✅ Booking cancelled successfully."
        : "⚠️ Cancellation request submitted.";
      setToast({ type: "success", message: msg });
      setBookingId("");
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.ErrorMessage ||
        "❌ Cancellation failed. Please try again.";
      setToast({ type: "error", message: errMsg });
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
          🛑 Cancel a Booking
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your Booking ID below to cancel your flight reservation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="booking-id" className="block text-gray-700 font-medium mb-1">
              Booking ID
            </label>
            <input
              id="booking-id"
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g. TR63202025"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex justify-center items-center px-4 py-2 font-semibold text-white rounded-md transition-colors
              ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"}
            `}
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
            {loading ? "Cancelling…" : "Cancel Booking"}
          </motion.button>
        </form>

        {/* Toast messages */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-6 p-3 rounded-md text-sm ${
                toast.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-700"
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
