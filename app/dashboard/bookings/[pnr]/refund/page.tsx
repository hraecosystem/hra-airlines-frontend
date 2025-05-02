// app/dashboard/booking/[pnr]/refund/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";

// Define the shape of our form state
interface FormState {
  uniqueId: string;
  title: "Mr" | "Mrs" | "Miss" | "Master" | "Baby";
  firstName: string;
  lastName: string;
  eTicket: string;
  remark: string;
  type: "ADT" | "CHD" | "INF";
}

export default function RefundRequestPage() {
  const router = useRouter();
  const params = useParams();
  const rawPnr = params?.pnr;
  const pnr = typeof rawPnr === "string" ? rawPnr : Array.isArray(rawPnr) ? rawPnr[0] : "";

  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState<FormState>({
    uniqueId: pnr,
    title: "Mr",
    firstName: "",
    lastName: "",
    eTicket: "",
    remark: "Kindly share refund quote",
    type: "ADT",
  });
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [alreadyRequested, setAlreadyRequested] = useState(false);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?redirect=/dashboard/booking/${encodeURIComponent(pnr)}/refund`);
    }
  }, [authLoading, user, router, pnr]);

  // Load booking and prefill
  useEffect(() => {
    if (!pnr || !user) return;
    setLoadingBooking(true);
    api
      .get("/booking/history")
      .then(res => {
        const bookings = res.data.data.bookings || [];
        const booking = bookings.find((b: any) => b.pnr === pnr);
        if (!booking) {
          setToast({ type: "error", message: "❌ Booking not found." });
          return;
        }
        // Prefill passenger info
        setForm(f => ({
          ...f,
          uniqueId: booking.bookingId,
          title: booking.passengers?.[0]?.title || f.title,
          firstName: booking.passengers?.[0]?.firstName || f.firstName,
          lastName: booking.passengers?.[0]?.lastName || f.lastName,
        }));
        if (booking.refundStatus === "Requested") {
          setAlreadyRequested(true);
          setToast({ type: "error", message: "🔁 You have already requested a refund." });
        }
      })
      .catch(() => {
        setToast({ type: "error", message: "❌ Unable to load booking details." });
      })
      .finally(() => {
        setLoadingBooking(false);
      });
  }, [pnr, user]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.eTicket.trim()) {
      setToast({ type: "error", message: "⚠️ Please complete all required fields." });
      return;
    }
    if (alreadyRequested) {
      setToast({ type: "error", message: "⚠️ Refund already requested." });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/flights/refund-request", {
        UniqueID: form.uniqueId.trim(),
        paxDetails: [
          {
            type: form.type,
            title: form.title,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            eTicket: form.eTicket.trim(),
          },
        ],
        remark: form.remark.trim(),
      });
      setToast({ type: "success", message: "✅ Your refund request has been submitted." });
      setAlreadyRequested(true);
      setForm(f => ({ ...f, eTicket: "" }));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.ErrorMessage || "❌ Refund request failed.";
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700">Booking ID</span>
              <input
                type="text"
                value={form.uniqueId}
                disabled
                className="mt-1 block w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">E‑Ticket Number *</span>
              <input
                type="text"
                value={form.eTicket}
                onChange={e => handleChange("eTicket", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label>
              <span className="text-gray-700">Passenger Type</span>
              <select
                value={form.type}
                onChange={e => handleChange("type", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ADT">Adult</option>
                <option value="CHD">Child</option>
                <option value="INF">Infant</option>
              </select>
            </label>
            <label>
              <span className="text-gray-700">Title</span>
              <select
                value={form.title}
                onChange={e => handleChange("title", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {['Mr','Mrs','Miss','Master','Baby'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <span className="text-gray-700">First Name *</span>
              <input
                type="text"
                value={form.firstName}
                onChange={e => handleChange("firstName", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </label>
            <label>
              <span className="text-gray-700">Last Name *</span>
              <input
                type="text"
                value={form.lastName}
                onChange={e => handleChange("lastName", e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700">Remark</span>
            <textarea
              rows={3}
              value={form.remark}
              onChange={e => handleChange("remark", e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || alreadyRequested}
            className={`w-full flex justify-center items-center px-4 py-2 font-semibold text-black rounded-md transition-colors ${submitting || alreadyRequested ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}
          >
            {submitting && <Spinner size={20} className="text-white mr-2" />}            
            {submitting ? 'Submitting…' : 'Submit Refund Request'}
          </button>
        </form>

        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-6 p-3 rounded-md text-sm \${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
