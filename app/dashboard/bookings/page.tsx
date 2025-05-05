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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow 
              ${toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-800">My Bookings</h1>
          <select
            className="border rounded px-3 py-1"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="TICKETED">Ticketed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </header>

        {/* List or Loader */}
        {loadingBookings ? (
          <div className="space-y-4">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : pageSlice.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No bookings found.</div>
        ) : (
          pageSlice.map((b) => (
            <motion.div
              key={b.uniqueId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:justify-between gap-4"
            >
              <div className="flex-1 space-y-1">
                <p><span className="font-semibold">PNR:</span> {b.pnr}</p>
                <p><span className="font-semibold">Booked On:</span>{" "}
                  {format(new Date(b.createdAt), "PPP")}
                </p>
                <p><span className="font-semibold">Total:</span>{" "}
                  {b.totalPrice.toFixed(2)} {b.currency}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    b.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : b.status === "CANCELLED"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-800"
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
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 flex items-center"
                      >
                        {cancelingPnr === b.pnr ? <Spinner className="w-4 h-4 mr-1" /> : null}
                        Cancel
                      </button>

                      <Link
                        href={`/dashboard/bookings/${b.pnr}/refund`}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                      >
                        Refund
                      </Link>

                      <Link
                        href={`/dashboard/bookings/${b.pnr}/reissue`}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Reissue
                      </Link>

                      <Link
                        href={`/ticket/${b.mongoBookingId}`}
                        className="bg-indigo-500 text-white px-3 py-1 rounded text-xs hover:bg-indigo-600"
                      >
                        View Ticket
                      </Link>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
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
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              &larr; Prev
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
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
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-lg font-bold mb-4">Confirm Cancellation</h2>
              <p className="mb-6">
                Are you sure you want to cancel booking{" "}
                <strong>{targetPnr}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={doCancel}
                  disabled={!!cancelingPnr}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelingPnr ? <Spinner className="w-4 h-4 inline-block mr-1"/> : null}
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border hover:bg-gray-100"
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
