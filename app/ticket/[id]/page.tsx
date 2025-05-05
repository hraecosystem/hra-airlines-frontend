// app/ticket/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Printer, Download, ChevronLeft, Plane, User, Calendar, CreditCard, Info, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/Spinner";

type Passenger = {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  passportNo?: string;
};

type Segment = {
  airlineName?: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  cabinClass: string;
};

type FareLine = { label: string; amount: number };
type TaxLine  = { name: string; amount: number };

interface Ticket {
  pnr: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  passengers: Passenger[];
  flightSegments: Segment[];
  fareBreakdown: FareLine[];
  taxes: TaxLine[];
  fareRulesUrl?: string | null;
}

export default function TicketPage() {
  const router = useRouter();
  const { id }  = useParams();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?redirect=/ticket/${id}`);
    }
  }, [authLoading, user, router, id]);

  // Fetch ticket data
  useEffect(() => {
    if (!user || !id) return;
    api
      .get<{ status: string; data: Ticket }>(`/ticket/${id}`)
      .then((res) => {
        setTicket(res.data.data);
      })
      .catch((e) => {
        setError(e.response?.data?.message || "Ticket not found.");
      })
      .finally(() => setLoading(false));
  }, [user, id]);

  // Download PDF
  const handleDownload = async () => {
    try {
      const res = await api.get<Blob>(`/ticket/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HRA-Ticket-${ticket?.pnr}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Failed to download ticket.");
    }
  };

  // Print page
  const handlePrint = () => window.print();

  // Loading or error UI
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }
  if (error || !ticket) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4">
        <p className="text-red-600">{error || "Unable to load ticket."}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ChevronLeft size={16} /> Back
        </button>
      </div>
    );
  }

  const issuedDate = new Date(ticket.createdAt);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4 print:bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 rounded-t-2xl shadow-lg print:hidden">
          <button 
            onClick={() => router.back()} 
            className="text-white hover:text-blue-200 transition-colors duration-200"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Plane className="transform rotate-45" size={24} />
            E-Ticket
          </h1>
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <Printer size={16} /> Print
            </button>
            <button 
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Download size={16} /> Download
            </button>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden print:shadow-none">
          <div className="p-8 space-y-8">
          {/* Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 text-blue-600 mb-3">
                  <Info size={22} />
                  <h3 className="font-semibold">PNR</h3>
                </div>
                <p className="text-xl font-bold tracking-wide">{ticket.pnr}</p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 text-green-600 mb-3">
                  <Calendar size={22} />
                  <h3 className="font-semibold">Issued</h3>
            </div>
                <p className="text-xl font-bold tracking-wide">{format(issuedDate, "PPP p")}</p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 text-purple-600 mb-3">
                  <Clock size={22} />
                  <h3 className="font-semibold">Status</h3>
            </div>
                <p className={`text-xl font-bold tracking-wide ${
                ticket.status === "CONFIRMED"
                  ? "text-green-700"
                  : ticket.status === "CANCELLED"
                  ? "text-red-700"
                    : "text-purple-700"
                }`}>
                {ticket.status}
              </p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 text-orange-600 mb-3">
                  <CreditCard size={22} />
                  <h3 className="font-semibold">Payment</h3>
            </div>
                <p className="text-xl font-bold tracking-wide">{ticket.paymentStatus}</p>
              </motion.div>
          </div>

          {/* Passengers */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 !important flex items-center gap-3">
                  <User size={22} className="text-blue-600" />
                  Passengers
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ticket.passengers.map((p, i) => (
                    <motion.div 
                      key={i} 
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{p.title} {p.firstName} {p.lastName}</p>
                          <p className="text-sm text-gray-600">DOB: {format(new Date(p.dob), "MM/dd/yyyy")}</p>
                        </div>
                      </div>
                      {p.passportNo && (
                        <div className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                          <span className="font-medium">Passport:</span> {p.passportNo}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

          {/* Itinerary */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 !important flex items-center gap-3">
                  <Plane size={22} className="text-blue-600" />
                  Flight Itinerary
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-6">
              {ticket.flightSegments.map((seg, i) => (
                    <motion.div 
                      key={i} 
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">
                              {seg.airlineName || seg.airlineCode} {seg.flightNumber}
                            </p>
                            <p className="text-sm text-gray-600">{seg.cabinClass}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-600">
                            <MapPin size={18} className="text-blue-600" />
                            <span className="font-medium">Departure</span>
                          </div>
                          <p className="text-xl font-semibold">{seg.origin}</p>
                          <p className="text-gray-600">{format(new Date(seg.departureDateTime), "PPP p")}</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-600">
                            <MapPin size={18} className="text-green-600" />
                            <span className="font-medium">Arrival</span>
                          </div>
                          <p className="text-xl font-semibold">{seg.destination}</p>
                          <p className="text-gray-600">{format(new Date(seg.arrivalDateTime), "PPP p")}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
            </div>
          </section>

          {/* Fare Breakdown */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 !important flex items-center gap-3">
                  <CreditCard size={22} className="text-blue-600" />
                  Fare Details
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-8">
                  {/* Fare Breakdown */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">Fare Breakdown</h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full">
                <tbody>
                  {ticket.fareBreakdown.map((f, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"}>
                              <td className="p-4 text-gray-700">{f.label}</td>
                              <td className="p-4 text-right font-medium">
                                {f.amount.toFixed(2)} {ticket.currency}
                              </td>
                    </tr>
                  ))}
                          <tr className="border-t border-gray-200 bg-white/80">
                            <td className="p-4 text-gray-700 font-medium">Subtotal</td>
                            <td className="p-4 text-right font-medium">
                              {(ticket.fareBreakdown.reduce((sum, f) => sum + f.amount, 0)).toFixed(2)} {ticket.currency}
                            </td>
                  </tr>
                </tbody>
              </table>
                    </div>
                  </div>

          {/* Taxes & Fees */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">Taxes & Fees</h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full">
                <tbody>
                  {ticket.taxes.map((t, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"}>
                              <td className="p-4 text-gray-700">{t.name}</td>
                              <td className="p-4 text-right font-medium">
                                {t.amount.toFixed(2)} {ticket.currency}
                              </td>
                    </tr>
                  ))}
                          <tr className="border-t border-gray-200 bg-white/80">
                            <td className="p-4 text-gray-700 font-medium">Total Taxes</td>
                            <td className="p-4 text-right font-medium">
                              {(ticket.taxes.reduce((sum, t) => sum + t.amount, 0)).toFixed(2)} {ticket.currency}
                            </td>
                          </tr>
                </tbody>
              </table>
                    </div>
                  </div>

                  {/* Additional Fees */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">Additional Fees</h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-2">Service Fee</p>
                          <p className="font-medium text-gray-900">Included in Total</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-2">Processing Fee</p>
                          <p className="font-medium text-gray-900">Included in Total</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 text-lg">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {ticket.totalPrice.toFixed(2)} {ticket.currency}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p>Includes all taxes, fees, and charges</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          {/* Fare Rules Link */}
          {ticket.fareRulesUrl && (
              <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 !important flex items-center gap-3">
                    <Info size={22} className="text-blue-600" />
                    Fare Rules
                  </h2>
                </div>
                <div className="p-8">
                  <p className="text-gray-700">
                    For full fare rules and conditions,{" "}
                <a
                  href={ticket.fareRulesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  click here
                    </a>
              </p>
                </div>
            </section>
          )}
        </div>

        {/* Footer Back Link */}
          <div className="p-8 text-center print:hidden">
          <Link
            href="/dashboard/bookings"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
          >
              <ChevronLeft size={18} className="mr-2" />
            Back to My Bookings
          </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
