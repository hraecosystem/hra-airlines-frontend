// app/dashboard/booking/[pnr]/reissue/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { motion, AnimatePresence } from "framer-motion";

interface BookingDetail {
  pnr: string;
  ticketNumbers: Array<{ passengerIndex: number; ticketNumber: string }>;
  reissueStatus: "None" | "Requested" | "Completed";
}

type Toast = { type: "success" | "error"; message: string };

export default function ReissueRequestPage() {
  const router = useRouter();
  const { pnr: rawPnr } = useParams();
  const pnr = Array.isArray(rawPnr) ? rawPnr[0] : rawPnr || "";

  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  const [ptrUniqueID, setPtrUniqueID] = useState("");
  const [preference, setPreference] = useState<"1" | "2">("1");
  const [remark, setRemark] = useState("Kindly reissue the ticket.");

  const [submitting, setSubmitting] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const dest = encodeURIComponent(`/dashboard/booking/${pnr}/reissue`);
      router.replace(`/auth/login?redirect=${dest}`);
    }
  }, [authLoading, user, router, pnr]);

  // redirect back if missing pnr
  useEffect(() => {
    if (!authLoading && user && !pnr) {
      router.replace("/dashboard/bookings");
    }
  }, [authLoading, user, pnr, router]);

  // fetch booking details
  useEffect(() => {
    if (!user || !pnr) return;
    setBookingLoading(true);
    api
      .get<{ status: string; data: BookingDetail }>(`/booking/${pnr}`)
      .then((res) => {
        const bk = res.data.data;
        setBooking(bk);
        setPtrUniqueID(bk.ticketNumbers[0]?.ticketNumber || "");
      })
      .catch(() => {
        setToast({ type: "error", message: "❌ Unable to load booking details." });
      })
      .finally(() => {
        setBookingLoading(false);
      });
  }, [user, pnr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    if (disabled) return;

    if (!ptrUniqueID) {
      setToast({ type: "error", message: "⚠️ Please select a ticket to reissue." });
      return;
    }
    if (booking?.reissueStatus === "Requested") {
      setToast({ type: "error", message: "⚠️ A reissue is already in process." });
      return;
    }

    setSubmitting(true);
    try {
      // Only send the needed fields; backend attaches credentials
      const res = await api.post<any>(
        "/flights/reissue-ticket",
        {
          UniqueID:         pnr,
          ptrUniqueID,
          PreferenceOption: preference,
          remark:           remark.trim(),
        },
        { timeout: 30000 }
      );

      // Check for nested Errors
      if (res.data.Errors) {
        throw new Error(res.data.Errors.ErrorMessage || "Reissue failed.");
      }

      const result = res.data.ReissueResponse?.ReissueResult;
      if (result?.Success === "true") {
        setToast({ type: "success", message: "✅ Reissue completed." });
        setDisabled(true);
        setBooking((b) => b && ({ ...b, reissueStatus: "Completed" }));
      } else {
        const errMsg =
          typeof result?.Errors === "object"
            ? result.Errors.ErrorMessage
            : "❌ Reissue request failed.";
        setToast({ type: "error", message: errMsg });
        setDisabled(true);
        setBooking((b) => b && ({ ...b, reissueStatus: "Requested" }));
      }
    } catch (err: any) {
      const msg =
        err.message || err.response?.data?.message || "❌ Reissue request failed.";
      setToast({ type: "error", message: msg });
      setDisabled(true);
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
        <h1 className="text-3xl font-bold text-purple-700 mb-4 text-center">🛫 Reissue Ticket</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PTR Unique ID */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Ticket Number (PTR Unique ID)</label>
            <select
              value={ptrUniqueID}
              onChange={(e) => setPtrUniqueID(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">— select ticket # —</option>
              {booking?.ticketNumbers.map((t) => (
                <option key={t.ticketNumber} value={t.ticketNumber}>
                  {t.ticketNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Preference Option */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Preference</label>
            <select
              value={preference}
              onChange={(e) => setPreference(e.target.value as "1" | "2")}
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="1">Same cabin</option>
              <option value="2">Higher cabin</option>
            </select>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Remark (optional)</label>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || disabled || booking?.reissueStatus === "Requested"}
            className={`w-full flex justify-center items-center px-4 py-2 text-white font-semibold rounded-md transition ${
              submitting || disabled || booking?.reissueStatus === "Requested"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {submitting && <Spinner className="w-5 h-5 mr-2 text-white" />}
            {booking?.reissueStatus === "Completed"
              ? "Reissued"
              : submitting
              ? "Submitting…"
              : booking?.reissueStatus === "Requested"
              ? "Requested"
              : "Submit Reissue"}
          </button>
        </form>

        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-6 p-3 rounded-md text-sm ${
                toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
