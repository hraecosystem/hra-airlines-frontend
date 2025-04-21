"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

type Booking = {
  uniqueId: string;
  pnr: string;
  status: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  mongoBookingId?: string;
};

type StatusFilter = "ALL" | "CONFIRMED" | "TICKETED" | "CANCELLED";

export default function BookingHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [targetPnr, setTargetPnr] = useState("");

  const itemsPerPage = 5;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/dashboard/bookings`);
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get("/booking/history");
        setBookings(res.data.bookings || []);
      } catch (err: any) {
        setMessage(err.response?.data?.message || "Failed to load bookings.");
      }
    })();
  }, [user]);

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

  const cancelBooking = async (pnr: string) => {
    try {
      await api.post("/flights/cancel", { uniqueId: pnr });
      setMessage("✅ Booking cancelled.");
      setModalOpen(false);
      const res = await api.get("/booking/history");
      setBookings(res.data.bookings || []);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Cancellation failed.");
      setModalOpen(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading your bookings…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
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

        {message && (
          <div className="rounded bg-yellow-100 px-4 py-2 text-yellow-800">
            {message}
          </div>
        )}

        <AnimatePresence>
          {pageSlice.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 py-10"
            >
              No bookings found.
            </motion.div>
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
                  <p>
                    <span className="font-semibold">PNR:</span> {b.pnr}
                  </p>
                  <p>
                    <span className="font-semibold">Booked On:</span>{" "}
                    {format(new Date(b.createdAt), "PPP")}
                  </p>
                  <p>
                    <span className="font-semibold">Total:</span>{" "}
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
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          onClick={() => {
                            setTargetPnr(b.pnr);
                            setModalOpen(true);
                          }}
                        >
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
        </AnimatePresence>

        {totalPages > 1 && (
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
                  onClick={() => cancelBooking(targetPnr)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
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