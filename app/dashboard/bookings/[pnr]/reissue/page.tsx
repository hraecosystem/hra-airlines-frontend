// app/dashboard/bookings/ReissueRequestPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type FormState = {
  uniqueId: string;
  ptrUniqueID: string;
  preferenceOption: "1" | "2";
  remark: string;
};

export default function ReissueRequestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const pnrFromUrl = params.get("pnr") || "";

  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState<FormState>({
    uniqueId: pnrFromUrl,
    ptrUniqueID: "",
    preferenceOption: "1",
    remark: "Kindly reissue the ticket.",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reissueStatus, setReissueStatus] = useState<null | "Requested">(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/dashboard/bookings/reissue?pnr=${pnrFromUrl}`);
    }
  }, [authLoading, user, router, pnrFromUrl]);

  // Fetch existing reissue status
  useEffect(() => {
    if (!pnrFromUrl) return;
    setBookingLoading(true);
    api
      .get("/booking/history")
      .then((res) => {
        const booking = res.data.bookings.find((b: any) => b.pnr === pnrFromUrl);
        if (booking) {
          setForm((f) => ({
            ...f,
            uniqueId: booking.uniqueId || booking.pnr,
          }));
          if (booking.reissueStatus === "Requested") {
            setReissueStatus("Requested");
            setToast({ type: "error", message: "🔁 A reissue request is already in process." });
          }
        } else {
          setToast({ type: "error", message: "❌ Booking not found." });
        }
      })
      .catch(() => {
        setToast({ type: "error", message: "❌ Unable to fetch booking details." });
      })
      .finally(() => setBookingLoading(false));
  }, [pnrFromUrl]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Basic validation
    if (!form.uniqueId.trim() || !form.ptrUniqueID.trim()) {
      return setToast({ type: "error", message: "⚠️ Please fill in both Booking ID and PTR ID." });
    }

    setSubmitting(true);
    try {
      await api.post("/flights/reissue-request", {
        UniqueID: form.uniqueId.trim(),
        ptrUniqueID: form.ptrUniqueID.trim(),
        PreferenceOption: form.preferenceOption,
        remark: form.remark.trim(),
      });
      setReissueStatus("Requested");
      setToast({ type: "success", message: "✅ Your reissue request has been submitted." });
      setForm((f) => ({ ...f, ptrUniqueID: "" }));
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.ErrorMessage ||
        "❌ Reissue request failed.";
      setToast({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || bookingLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-4 text-center">
          🛫 Reissue Request
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Request a reissue for your flight ticket with updated preferences.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Unique ID */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Booking Unique ID</label>
            <input
              type="text"
              value={form.uniqueId}
              onChange={(e) => handleChange("uniqueId", e.target.value)}
              disabled={Boolean(pnrFromUrl)}
              placeholder="e.g. TR63202025"
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* PTR Unique ID */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">PTR Unique ID</label>
            <input
              type="text"
              value={form.ptrUniqueID}
              onChange={(e) => handleChange("ptrUniqueID", e.target.value)}
              placeholder="e.g. PTR123456"
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Preference Option */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Preference</label>
            <select
              value={form.preferenceOption}
              onChange={(e) => handleChange("preferenceOption", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="1">Reissue in same cabin</option>
              <option value="2">Reissue in higher cabin</option>
            </select>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Remark (optional)</label>
            <textarea
              rows={3}
              value={form.remark}
              onChange={(e) => handleChange("remark", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || reissueStatus === "Requested"}
            className={`w-full flex justify-center items-center px-4 py-2 text-white font-semibold rounded-md transition
              ${
                submitting || reissueStatus === "Requested"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }
            `}
          >
            {submitting ? "Submitting…" : "Submit Reissue Request"}
          </button>
        </form>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key="reissue-toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-6 p-3 rounded-md text-sm ${
                toast.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
