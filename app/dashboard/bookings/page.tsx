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
import { Plane, CreditCard, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50
              ${toast.type === "success" 
                ? "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200" 
                : "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200"}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Plane className="text-white transform rotate-45" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-500 mt-1">Manage your flight reservations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
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
          </div>
        </div>

        {/* List or Loader */}
        {loadingBookings ? (
          <div className="space-y-4">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-xl shadow-sm animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : pageSlice.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plane className="text-gray-400 transform rotate-45" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't made any flight reservations yet. Start planning your next adventure!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pageSlice.map((b) => (
              <motion.div
                key={b.uniqueId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Booking Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/20">
                          {b.pnr.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{b.pnr}</p>
                          <p className="text-sm text-gray-500">
                            Booked on {format(new Date(b.createdAt), "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <CreditCard size={18} className="text-gray-400" />
                          <span className="text-gray-700 font-medium">
                            {b.totalPrice.toFixed(2)} {b.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                          b.status === "CONFIRMED"
                            ? "bg-green-50 text-green-700"
                            : b.status === "CANCELLED"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-700"
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
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 font-medium"
                            >
                              {cancelingPnr === b.pnr ? <Spinner className="w-4 h-4" /> : null}
                              Cancel
                            </button>

                            <Link
                              href={`/dashboard/bookings/${b.pnr}/refund`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors duration-200 font-medium"
                            >
                              Refund
                            </Link>

                            <Link
                              href={`/dashboard/bookings/${b.pnr}/reissue`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200 font-medium"
                            >
                              Reissue
                            </Link>

                            <Link
                              href={`/ticket/${b.mongoBookingId}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors duration-200 font-medium"
                            >
                              View Ticket
                            </Link>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">No actions available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loadingBookings && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              &larr; Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              Next &rarr;
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
              className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-red-600" size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Cancellation</h2>
                <p className="text-gray-600">
                  Are you sure you want to cancel booking{" "}
                  <strong className="text-gray-900">{targetPnr}</strong>?
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={doCancel}
                  disabled={!!cancelingPnr}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 font-medium"
                >
                  {cancelingPnr ? <Spinner className="w-4 h-4 inline-block mr-2"/> : null}
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
