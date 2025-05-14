// app/dashboard/booking/[pnr]/reissue/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { motion, AnimatePresence } from "framer-motion";

type Toast = { type: "success" | "error"; message: string };

// shape returned by GET /booking/:pnr
interface BookingDetail {
  bookingId:      string;                        // Mongo _id
  pnr:            string;
  ticketNumbers:  Array<{ passengerIndex: number; ticketNumber: string }>;
  reissueStatus:  "None" | "Requested" | "Completed";
}

type FormState = {
  uniqueId:         string;       // will be booking.bookingId
  ptrUniqueID:      string;       // one of booking.ticketNumbers[].ticketNumber
  PreferenceOption: "1" | "2";
  remark:           string;
};

export default function ReissueRequestPage() {
  const router = useRouter();
  const { pnr: rawPnr } = useParams();
  const pnr = Array.isArray(rawPnr) ? rawPnr[0] : rawPnr || "";

  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [form, setForm] = useState<FormState>({
    uniqueId:         "", 
    ptrUniqueID:      "",
    PreferenceOption: "1",
    remark:           "Kindly reissue the ticket."
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?redirect=/dashboard/booking/${encodeURIComponent(pnr)}/reissue`);
    }
  }, [authLoading, user, router, pnr]);

  // fetch the single booking by PNR
  useEffect(() => {
    if (!user || !pnr) return;
    setBookingLoading(true);
    api.get<{ status: string; data: BookingDetail }>(`/booking/${pnr}`)
      .then(res => {
        const bk = res.data.data;
        setBooking(bk);
        setForm(f => ({
          ...f,
          uniqueId:    bk.bookingId,
          // default to first ticketNumber if present
          ptrUniqueID: bk.ticketNumbers[0]?.ticketNumber || ""
        }));
      })
      .catch(() => {
        setToast({ type: "error", message: "❌ Unable to load booking." });
      })
      .finally(() => setBookingLoading(false));
  }, [user, pnr]);

  const handleChange = <K extends keyof FormState>(key: K, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!form.ptrUniqueID) {
      return setToast({ type: "error", message: "⚠️ Please select a PTR Unique ID." });
    }
    if (booking?.reissueStatus === "Requested") {
      return setToast({ type: "error", message: "⚠️ A reissue is already in process." });
    }

    setSubmitting(true);
    try {
      await api.post("/flights/reissue-request", {
        UniqueID:         form.uniqueId,
        ptrUniqueID:      form.ptrUniqueID,
        PreferenceOption: form.PreferenceOption,
        remark:           form.remark.trim(),
      });
      setToast({ type: "success", message: "✅ Your reissue request has been submitted." });
      // flip local state
      setBooking(b => b && ({ ...b, reissueStatus: "Requested" }));
    } catch (err: any) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ??
          err.response?.data?.error?.ErrorMessage ??
          "❌ Reissue request failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || bookingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={48} />
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
          Booking PNR: <span className="font-semibold">{booking?.pnr}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Unique ID */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Booking Unique ID
            </label>
            <input
              type="text"
              value={form.uniqueId}
              disabled
              className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* PTR Unique ID */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              PTR Unique ID
            </label>
            <select
              value={form.ptrUniqueID}
              onChange={e => handleChange("ptrUniqueID", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">— select your ticket # —</option>
              {booking?.ticketNumbers.map(({ ticketNumber }) => (
                <option key={ticketNumber} value={ticketNumber}>
                  {ticketNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Preference Option */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Preference
            </label>
            <select
              value={form.PreferenceOption}
              onChange={e => handleChange("PreferenceOption", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="1">Same cabin</option>
              <option value="2">Higher cabin</option>
            </select>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Remark (optional)
            </label>
            <textarea
              rows={3}
              value={form.remark}
              onChange={e => handleChange("remark", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || booking?.reissueStatus === "Requested"}
            className={`w-full flex justify-center items-center px-4 py-2 text-white font-semibold rounded-md transition ${
              submitting || booking?.reissueStatus === "Requested"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {submitting ? <Spinner size={16} /> : "Submit Reissue Request"}
          </button>
        </form>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
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
