// app/dashboard/bookings/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/Spinner"; // assume you have a small spinner component

type Booking = {
  uniqueId: string;
  pnr: string;
  status: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  mongoBookingId: string;
};

type BookingHistoryResponse = {
  status: string;
  data: {
    total: number;
    page: number;
    pages: number;
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
  const [cancelingPnr, setCancelingPnr] = useState<string | null>(null);

  const itemsPerPage = 5;

  // redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?redirect=/dashboard/bookings`);
    }
  }, [authLoading, user, router]);

  // fetch & map
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await api.get<BookingHistoryResponse>("/booking/history");
      const raw = res.data.data.bookings;
      setBookings(
        raw.map((b) => ({
          uniqueId:       b.bookingId,
          mongoBookingId: b.bookingId,
          pnr:            b.pnr,
          status:         b.status,
          totalPrice:     b.totalPrice,
          currency:       b.currency,
          createdAt:      b.createdAt,
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

  // filtered + paginated
  const filtered = bookings.filter((b) =>
    statusFilter === "ALL"
      ? true
      : statusFilter === "CANCELLED"
      ? b.status.toUpperCase() === "CANCELLED"
      : b.status.toUpperCase().includes(statusFilter)
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageSlice = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // kick off a cancel
  const confirmCancel = (pnr: string) => {
    setTargetPnr(pnr);
    setModalOpen(true);
  };

  const doCancel = async () => {
    if (!targetPnr) return;
    setCancelingPnr(targetPnr);
    try {
      await api.post("/flights/cancel", { UniqueID: targetPnr });
      setToast({ type: "success", message: `Booking ${targetPnr} cancelled.` });
      setModalOpen(false);
      await fetchBookings();
    } catch (err: any) {
      setToast({ type: "error", message: err.response?.data?.message || "Cancellation failed." });
    } finally {
      setCancelingPnr(null);
    }
  };

  // render
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Verifying session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50
              ${toast.type === "success" 
                ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200" 
                : "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200"}`}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">My Bookings</h1>
                <p className="text-gray-600 mt-1">Manage your flight reservations</p>
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
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
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-xl shadow-sm animate-pulse" />
            ))}
          </div>
        ) : pageSlice.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">You haven't made any bookings yet.</p>
          </div>
        ) : (
          pageSlice.map((b) => (
            <motion.div
              key={b.uniqueId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <span className="text-blue-600 font-semibold">{b.pnr}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Booked on</p>
                        <p className="font-medium">{format(new Date(b.createdAt), "PPP")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-green-600 font-semibold">{b.totalPrice.toFixed(2)} {b.currency}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        b.status === "CONFIRMED"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : b.status === "CANCELLED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {b.status}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {b.status !== "CANCELLED" ? (
                        <>
                          <button
                            onClick={() => confirmCancel(b.pnr)}
                            disabled={!!cancelingPnr}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 flex items-center gap-2 border border-red-200"
                          >
                            {cancelingPnr === b.pnr ? <Spinner className="w-4 h-4" /> : null}
                            Cancel
                          </button>

                          <Link
                            href={`/dashboard/bookings/${b.pnr}/refund`}
                            className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 border border-yellow-200"
                          >
                            Refund
                          </Link>

                          <Link
                            href={`/dashboard/bookings/${b.pnr}/reissue`}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 border border-blue-200"
                          >
                            Reissue
                          </Link>

                          <Link
                            href={`/ticket/${b.mongoBookingId}`}
                            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 border border-indigo-200"
                          >
                            View Ticket
                          </Link>
                        </>
                      ) : (
                        <div className="bg-gray-50 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Booking Cancelled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Pagination */}
        {!loadingBookings && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white flex items-center gap-2"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Confirm Cancellation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Confirm Cancellation</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel booking <span className="font-semibold text-gray-900">{targetPnr}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={doCancel}
                  disabled={!!cancelingPnr}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelingPnr ? <Spinner className="w-4 h-4" /> : null}
                  Yes, Cancel Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
