// app/dashboard/booking/[pnr]/refund/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";

interface BookingDetail {
  bookingId:    string;   // Mongo _id
  pnr:          string;
  passengers: Array<{
    type:      "ADT" | "CHD" | "INF";
    title:     "Mr" | "Mrs" | "Miss" | "Master" | "Baby";
    firstName: string;
    lastName:  string;
    eTicket?:  string;
  }>;
  refundStatus?: "None" | "Requested" | "Completed";
}

interface FormState {
  uniqueId:  string;
  title:     "Mr" | "Mrs" | "Miss" | "Master" | "Baby";
  firstName: string;
  lastName:  string;
  eTicket:   string;
  remark:    string;
  type:      "ADT" | "CHD" | "INF";
}

export default function RefundRequestPage() {
  const router = useRouter();
  const { pnr: rawPnr } = useParams();
  const pnr = typeof rawPnr === "string" ? rawPnr : Array.isArray(rawPnr) ? rawPnr[0] : "";

  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  const [form, setForm] = useState<FormState>({
    uniqueId:  "",
    title:     "Mr",
    firstName: "",
    lastName:  "",
    eTicket:   "",
    remark:    "Kindly share refund quote",
    type:      "ADT",
  });

  const [submitting, setSubmitting] = useState(false);
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1) Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const dest = encodeURIComponent(`/dashboard/booking/${pnr}/refund`);
      router.replace(`/auth/login?redirect=${dest}`);
    }
  }, [authLoading, user, router, pnr]);

  // 2) If we have a user but no pnr, go back
  useEffect(() => {
    if (!authLoading && user && !pnr) {
      router.replace("/dashboard/bookings");
    }
  }, [authLoading, user, pnr, router]);

  // 3) Fetch the booking by PNR
  useEffect(() => {
    if (!user || !pnr) return;
    setLoadingBooking(true);
    api
      .get<{ status: string; data: BookingDetail }>(`/booking/${pnr}`)
      .then((res) => {
        const bk = res.data.data;
        setBooking(bk);
        // seed the form from the first passenger
        const pax = bk.passengers[0] || {};
        setForm((f) => ({
          ...f,
          uniqueId:  bk.bookingId,
          title:     pax.title  || f.title,
          firstName: pax.firstName || f.firstName,
          lastName:  pax.lastName  || f.lastName,
          type:      pax.type   || f.type,
        }));
        if (bk.refundStatus === "Requested") {
          setAlreadyRequested(true);
        }
      })
      .catch(() => {
        setToast({ type: "error", message: "❌ Unable to load booking details." });
      })
      .finally(() => {
        setLoadingBooking(false);
      });
  }, [user, pnr]);

  const handleChange = <K extends keyof FormState>(key: K, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    if (alreadyRequested) {
      setToast({ type: "error", message: "⚠️ Refund already requested." });
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim() || !form.eTicket.trim()) {
      setToast({ type: "error", message: "⚠️ Please complete all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      await api.post(
        "/flights/refund-request",
        {
          UniqueID:   form.uniqueId.trim(),
          paxDetails: [
            {
              type:      form.type,
              title:     form.title,
              firstName: form.firstName.trim(),
              lastName:  form.lastName.trim(),
              eTicket:   form.eTicket.trim(),
            },
          ],
          remark: form.remark.trim(),
        },
        { timeout: 30000 }
      );

      setToast({ type: "success", message: "✅ Your refund request has been submitted." });
      setAlreadyRequested(true);
      setForm((f) => ({ ...f, eTicket: "" }));
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.ErrorMessage ||
        "❌ Refund request failed.";
      setToast({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingBooking) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <Spinner size={32} className="text-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">💸 Refund Request</h1>
        <p className="text-center text-gray-600 mb-6">Provide your ticket details to request a refund.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking ID (readonly) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Booking ID</label>
            <input
              type="text"
              value={form.uniqueId}
              disabled
              className="mt-1 block w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* E-Ticket Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">E-Ticket Number *</label>
            <input
              type="text"
              value={form.eTicket}
              onChange={(e) => handleChange("eTicket", e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Passenger Type / Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-gray-700">Passenger Type</span>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ADT">Adult</option>
                <option value="CHD">Child</option>
                <option value="INF">Infant</option>
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700">Title</span>
              <select
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {["Mr", "Mrs", "Miss", "Master", "Baby"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700">First Name *</span>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Last Name *</span>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </label>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Remark</label>
            <textarea
              rows={3}
              value={form.remark}
              onChange={(e) => handleChange("remark", e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || alreadyRequested}
            className={`w-full flex justify-center items-center px-4 py-2 font-semibold text-black rounded-md transition-colors ${
              submitting || alreadyRequested
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {submitting && <Spinner size={20} className="text-white mr-2" />}
            {submitting ? "Submitting…" : "Submit Refund Request"}
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
