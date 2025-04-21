// app/dashboard/bookings/RefundRequestPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type FormState = {
  uniqueId: string;
  title: "Mr" | "Mrs" | "Miss" | "Master" | "Baby";
  firstName: string;
  lastName: string;
  eTicket: string;
  remark: string;
  type: "ADT" | "CHD" | "INF";
};

export default function RefundRequestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const pnrFromUrl = params.get("pnr") || "";

  const [form, setForm] = useState<FormState>({
    uniqueId: pnrFromUrl,
    title: "Mr",
    firstName: "",
    lastName: "",
    eTicket: "",
    remark: "Kindly share refund quote",
    type: "ADT",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [refundStatus, setRefundStatus] = useState<null | "Requested">(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/dashboard/bookings/refund?pnr=${form.uniqueId}`);
    }
  }, [authLoading, user, router, form.uniqueId]);

  // Fetch booking details if pnr provided
  useEffect(() => {
    if (!pnrFromUrl) return;
    setBookingLoading(true);
    api.get("/booking/history")
      .then((res) => {
        const booking = res.data.bookings.find((b: any) => b.pnr === pnrFromUrl);
        if (booking) {
          const pax = booking.passengers?.[0] || {};
          setForm((f) => ({
            ...f,
            uniqueId: booking.uniqueId || booking.pnr,
            firstName: pax.firstName || "",
            lastName: pax.lastName || "",
            title: pax.title || "Mr",
          }));
          if (booking.refundStatus === "Requested") {
            setRefundStatus("Requested");
            setToast({ type: "error", message: "🔁 A refund request is already in process." });
          }
        } else {
          setToast({ type: "error", message: "❌ Booking not found." });
        }
      })
      .catch(() => {
        setToast({ type: "error", message: "❌ Unable to load booking details." });
      })
      .finally(() => setBookingLoading(false));
  }, [pnrFromUrl]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Basic client‑side validation
    if (!form.uniqueId || !form.firstName || !form.lastName || !form.eTicket) {
      return setToast({ type: "error", message: "⚠️ Please fill in all required fields." });
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
      setRefundStatus("Requested");
      setToast({ type: "success", message: "✅ Your refund request has been submitted." });
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

  if (authLoading || bookingLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">
          💸 Refund Request
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Provide your ticket details to request a refund.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking & Ticket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Booking ID</label>
              <input
                type="text"
                value={form.uniqueId}
                onChange={(e) => handleChange("uniqueId", e.target.value)}
                disabled={Boolean(pnrFromUrl)}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">E‑Ticket Number</label>
              <input
                type="text"
                value={form.eTicket}
                onChange={(e) => handleChange("eTicket", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Passenger Type</label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ADT">Adult</option>
                <option value="CHD">Child</option>
                <option value="INF">Infant</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Title</label>
              <select
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {["Mr", "Mrs", "Miss", "Master", "Baby"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Remark</label>
            <textarea
              rows={2}
              value={form.remark}
              onChange={(e) => handleChange("remark", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || refundStatus === "Requested"}
            className={`w-full flex justify-center items-center px-4 py-2 text-white font-semibold rounded-md transition
              ${submitting || refundStatus === "Requested"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"}
            `}
          >
            {submitting ? "Submitting…" : "Submit Refund Request"}
          </button>
        </form>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key="refund-toast"
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
