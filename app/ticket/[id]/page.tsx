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
import styles from './ticket.module.css';

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
    ticketNumbers?: Array<{
    passengerIndex: number;
    ticketNumber:   string;
  }>;
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
a.download = `HRA-Airlines-Ticket-${ticketNumber}.pdf`;
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

  const ticketNumber =
  ticket.ticketNumbers?.length && ticket.ticketNumbers[0]?.ticketNumber
    ? ticket.ticketNumbers[0].ticketNumber
    : "N/A";


  const issuedDate = new Date(ticket.createdAt);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-10 px-3 sm:px-4 print:bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Top Bar */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 ${styles.animatedGradient} bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-8 py-4 sm:py-6 rounded-t-2xl shadow-lg print:hidden`}>
          <button 
            onClick={() => router.back()} 
            className="text-white hover:text-blue-200 transition-colors duration-200"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className={`text-xl sm:text-2xl font-bold text-white flex items-center gap-3 ${styles.whiteHeading}`}>
            <Plane className="transform rotate-45" size={24} />
            E-Ticket
          </h1>
          <div className="flex gap-2 sm:gap-4">
            <button 
              onClick={handlePrint}
              className="inline-flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 backdrop-blur-sm text-xs sm:text-base"
            >
              <Printer size={16} /> Print
            </button>
            <button 
              onClick={handleDownload}
              className="inline-flex items-center gap-1 sm:gap-2 bg-green-500 hover:bg-green-400 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-base"
            >
              <Download size={16} /> Download
            </button>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden print:shadow-none">
          <div className="p-3 sm:p-8 space-y-4 sm:space-y-8">
            {/* Print Header - only shows when printing */}
            <div className="hidden print:flex print:items-center print:justify-between print:mb-8">
              <div className="flex items-center gap-3">
                <Plane className="transform rotate-45 text-blue-600" size={32} />
                <h1 className={`text-3xl font-bold text-blue-700 ${styles.printMark}`}>HRA Airlines E-Ticket</h1>
              </div>
              <p className="text-gray-500">Printed on: {format(new Date(), "PPP")}</p>
            </div>
          
          {/* Core Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
              <motion.div 
                className={`bg-blue-100 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${styles.cardContainer}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 text-blue-800 mb-1 sm:mb-3">
                  <Info size={20} className="min-w-[20px]" />
                  <h3 className="font-semibold text-sm sm:text-base">Ticket #</h3>
                </div>
                <p className="text-lg sm:text-xl font-bold tracking-wide text-blue-900 break-all">{ticketNumber}</p>
              </motion.div>

              <motion.div 
                className={`bg-green-100 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${styles.cardContainer}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 text-green-800 mb-1 sm:mb-3">
                  <Calendar size={20} className="min-w-[20px]" />
                  <h3 className="font-semibold text-sm sm:text-base">Issued</h3>
                </div>
                <p className="text-lg sm:text-xl font-bold tracking-wide text-green-900">{format(issuedDate, "PPP")}</p>
              </motion.div>

              <motion.div 
                className={`bg-purple-100 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${styles.cardContainer}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 text-purple-800 mb-1 sm:mb-3">
                  <Clock size={20} className="min-w-[20px]" />
                  <h3 className="font-semibold text-sm sm:text-base">Status</h3>
                </div>
                <p className={`text-lg sm:text-xl font-bold tracking-wide ${styles.statusText}`}>
                  {ticket.status}
                </p>
              </motion.div>

              <motion.div 
                className={`bg-orange-100 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${styles.cardContainer}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 text-orange-800 mb-1 sm:mb-3">
                  <CreditCard size={20} className="min-w-[20px]" />
                  <h3 className="font-semibold text-sm sm:text-base">Payment</h3>
                </div>
                <p className={`text-lg sm:text-xl font-bold tracking-wide ${styles.paymentText}`}>
                  {ticket.paymentStatus}
                </p>
              </motion.div>
            </div>

          {/* Passengers */}
            <section className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${styles.cardContainer}`}>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-8 py-3 sm:py-5 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 sm:gap-3">
                  <User size={20} className="text-blue-600 min-w-[20px]" />
                  Passengers
                </h2>
              </div>
              <div className="p-3 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  {ticket.passengers.map((p, i) => (
                    <motion.div 
                      key={i} 
                      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 ${styles.cardContainer}`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-base sm:text-lg flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">{p.title} {p.firstName} {p.lastName}</p>
                          <p className="text-xs sm:text-sm text-gray-600">DOB: {format(new Date(p.dob), "MM/dd/yyyy")}</p>
                        </div>
                      </div>
                      {p.passportNo && (
                        <div className="text-xs sm:text-sm text-gray-600 bg-white/50 rounded-lg p-2 sm:p-3">
                          <span className="font-medium">Passport:</span> {p.passportNo}
                        </div>
                      )}
                      {ticket.ticketNumbers
                        ?.find(t => t.passengerIndex === i)
                        ?.ticketNumber && (
                        <p className="mt-2 text-xs sm:text-sm text-gray-600 break-all">
                          Ticket #: {
                            ticket.ticketNumbers.find(t => t.passengerIndex === i)!.ticketNumber
                          }
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

          {/* Itinerary */}
            <section className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${styles.cardContainer}`}>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-8 py-3 sm:py-5 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 sm:gap-3">
                  <Plane size={20} className="text-blue-600 min-w-[20px]" />
                  Flight Itinerary
                </h2>
              </div>
              <div className="p-3 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  {ticket.flightSegments.map((seg, i) => (
                    <motion.div 
                      key={i} 
                      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 ${styles.cardContainer}`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-base sm:text-lg flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                              {seg.airlineName || seg.airlineCode} {seg.flightNumber}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">{seg.cabinClass}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                            <MapPin size={16} className="text-blue-600 min-w-[16px]" />
                            <span className="font-medium text-sm sm:text-base">Departure</span>
                          </div>
                          <p className="text-lg sm:text-xl font-semibold">{seg.origin}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{format(new Date(seg.departureDateTime), "PPP p")}</p>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                            <MapPin size={16} className="text-green-600 min-w-[16px]" />
                            <span className="font-medium text-sm sm:text-base">Arrival</span>
                          </div>
                          <p className="text-lg sm:text-xl font-semibold">{seg.destination}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{format(new Date(seg.arrivalDateTime), "PPP p")}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
            </div>
          </section>

          {/* Fare Breakdown */}
            <section className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${styles.cardContainer}`}>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-8 py-3 sm:py-5 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 sm:gap-3">
                  <CreditCard size={20} className="text-blue-600 min-w-[20px]" />
                  Fare Details
                </h2>
              </div>
              <div className="p-3 sm:p-8">
                <div className="space-y-6 sm:space-y-8">
                  {/* Fare Breakdown */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg">Fare Breakdown</h3>
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-sm min-w-full sm:min-w-0">
                        <table className="w-full min-w-[500px]">
                          <tbody>
                            {ticket.fareBreakdown.map((f, i) => (
                              <tr key={i} className={i % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"}>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{f.label}</td>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm text-right font-medium">
                                  {f.amount.toFixed(2)} {ticket.currency}
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t border-gray-200 bg-white/80">
                              <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 font-medium">Subtotal</td>
                              <td className="p-3 sm:p-4 text-xs sm:text-sm text-right font-medium">
                                {(ticket.fareBreakdown.reduce((sum, f) => sum + f.amount, 0)).toFixed(2)} {ticket.currency}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Taxes & Fees */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg">Taxes & Fees</h3>
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-sm min-w-full sm:min-w-0">
                        <table className="w-full min-w-[500px]">
                          <tbody>
                            {ticket.taxes.map((t, i) => (
                              <tr key={i} className={i % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"}>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{t.name}</td>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm text-right font-medium">
                                  {t.amount.toFixed(2)} {ticket.currency}
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t border-gray-200 bg-white/80">
                              <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 font-medium">Total Taxes</td>
                              <td className="p-3 sm:p-4 text-xs sm:text-sm text-right font-medium">
                                {(ticket.taxes.reduce((sum, t) => sum + t.amount, 0)).toFixed(2)} {ticket.currency}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Additional Fees */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg">Additional Fees</h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-white/50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Service Fee</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Included in Total</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Processing Fee</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Included in Total</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className={`${styles.animatedGradient} bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-xl p-4 sm:p-6 shadow-sm`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 text-sm sm:text-lg">Total Amount</span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">
                        {ticket.totalPrice.toFixed(2)} {ticket.currency}
                      </span>
                    </div>
                    <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                      <p>Includes all taxes, fees, and charges</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          {/* Fare Rules Link */}
          {ticket.fareRulesUrl && (
              <section className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${styles.cardContainer}`}>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 sm:gap-3">
                    <Info size={20} className="text-blue-600 min-w-[20px]" />
                    Fare Rules
                  </h2>
                </div>
                <div className="p-4 sm:p-8">
                  <p className="text-xs sm:text-sm text-gray-700">
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
          <div className="p-4 sm:p-8 text-center print:hidden">
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              <ChevronLeft size={16} className="mr-1 sm:mr-2" />
              Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
