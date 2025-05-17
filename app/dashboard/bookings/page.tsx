// app/dashboard/bookings/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/Spinner";

type Booking = {
  bookingId: string;   // your Mongo _id
  pnr: string;         // Trawex UniqueID (kept in state, never displayed)
  status: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
};

type BookingHistoryResponse = {
  status: string;
  data: {
    bookings: Array<{
      bookingId: string;
      pnr: string;
      status: string;
      totalPrice: number;
      currency: string;
      createdAt: string;
    }>;
  };
};

type StatusFilter = "ALL" | "CONFIRMED" | "TICKETED" | "CANCELLED";

export default function BookingHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetPnr, setTargetPnr] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  const itemsPerPage = 5;

  // 1) Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?redirect=/dashboard/bookings`);
    }
  }, [authLoading, user, router]);

  // 2) Fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await api.get<BookingHistoryResponse>("/booking/history");
      setBookings(
        res.data.data.bookings.map((b) => ({
          bookingId:  b.bookingId,
          pnr:        b.pnr,
          status:     b.status,
          totalPrice: b.totalPrice,
          currency:   b.currency,
          createdAt:  b.createdAt,
        }))
      );
    } catch (err: any) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to load bookings." });
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, fetchBookings]);

  // 3) Filter & paginate
  const filtered = bookings.filter((b) =>
    statusFilter === "ALL"
      ? true
      : statusFilter === "CANCELLED"
      ? b.status.toUpperCase() === "CANCELLED"
      : b.status.toUpperCase().includes(statusFilter)
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageSlice = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 4) Open modal (store only the PNR, never display it)
  const confirmCancel = (pnr: string) => {
    setTargetPnr(pnr);
    setModalOpen(true);
  };

  // 5) Perform cancel
  const doCancel = async () => {
    if (!targetPnr) return;
    setCanceling(true);
    setToast(null);

    try {
      await api.post(
        "/flights/cancel",
        { UniqueID: targetPnr },
        { timeout: 30000 } // 30s client‐side timeout
      );
      setToast({ type: "success", message: "✅ Booking cancelled successfully." });
      setModalOpen(false);
      await fetchBookings();
    } catch (err: any) {
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setToast({
          type: "error",
          message: "⚠️ Cancellation is taking longer than expected. Please check again shortly.",
        });
      } else {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error?.ErrorMessage ||
          "❌ Cancellation failed. Please try again.";
        setToast({ type: "error", message: msg });
      }
    } finally {
      setCanceling(false);
    }
  };

  // 6) Loading state
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Verifying session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                {/* replace with your actual icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7...Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  My Bookings
                </h1>
                <p className="text-gray-600 mt-1">Manage your flight reservations</p>
              </div>
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Bookings</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="TICKETED">Ticketed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </header>

        {/* List or Loader */}
        {loadingBookings ? (
          <div className="space-y-4">
            {[...Array(itemsPerPage)].map((_, idx) => (
              <div key={idx} className="h-32 bg-white rounded-xl shadow-sm animate-pulse" />
            ))}
          </div>
        ) : pageSlice.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600">You haven't made any bookings yet.</p>
          </div>
        ) : (
          pageSlice.map((b) => (
            <motion.div
              key={b.bookingId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Booked on</p>
                    <p className="font-medium">{format(new Date(b.createdAt), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-semibold">{b.totalPrice.toFixed(2)} {b.currency}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      b.status === "CONFIRMED"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : b.status === "CANCELLED"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                    {b.status}
                  </span>

                  <div className="flex flex-wrap gap-2">
<button
  onClick={() => confirmCancel(b.pnr)}
  disabled={canceling || b.status === "CANCELLED"}
  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border
    ${b.status === "CANCELLED"
      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
      : canceling
      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
      : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}
  `}
>
  {canceling && <Spinner className="w-4 h-4" />}
  Cancel
</button>


                    <Link href={`/dashboard/bookings/${b.bookingId}/refund`} className="px-4 py-2 text-yellow-600">
                      Refund
                    </Link>
                    <Link href={`/dashboard/bookings/${b.bookingId}/reissue`} className="px-4 py-2 text-blue-600">
                      Reissue
                    </Link>
                    <Link href={`/ticket/${b.bookingId}`} className="px-4 py-2 text-indigo-600">
                      View Ticket
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Pagination */}
        {!loadingBookings && totalPages > 1 && (
          <div className="flex justify-center gap-4 pt-4">
            <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded">
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Confirm Cancellation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-lg font-semibold mb-4">Confirm Cancellation</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900">
                  No, Keep Booking
                </button>
                <button
                  onClick={doCancel}
                  disabled={canceling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:opacity-50"
                >
                  {canceling && <Spinner className="w-4 h-4" />}
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
