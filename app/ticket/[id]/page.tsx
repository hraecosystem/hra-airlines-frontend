"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Printer, Download, ChevronLeft } from "lucide-react";
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
type TaxLine = { name: string; amount: number };

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
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1) Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?redirect=/ticket/${id}`);
    }
  }, [authLoading, user, router, id]);

  // 2) Fetch ticket when user is known
  useEffect(() => {
    if (!user || !id) return;
    api
      .get<{ status: string; data: Ticket }>(`/ticket/${id}`)
      .then((res) => setTicket(res.data.data))
      .catch((e) => setError(e.response?.data?.message || "Ticket not found"))
      .finally(() => setLoading(false));
  }, [user, id]);

  // 3) Download via fetch + blob (preserves httpOnly cookie)
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

  // 4) Print helper
  const handlePrint = () => window.print();

  // 5) Loading state
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  // 6) Error state
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

  // Parse the booked/issued date
  const issuedDate = new Date(ticket.createdAt);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-10 px-4 print:bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none">
        {/* Header: Back / Print / Download */}
        <div className="flex items-center justify-between bg-blue-600 px-6 py-4 print:hidden">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="text-white hover:text-blue-200"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">My E-Ticket</h1>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded"
            >
              <Printer size={16} /> Print
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded"
            >
              <Download size={16} /> Download
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">PNR</p>
              <p>{ticket.pnr}</p>
            </div>
            <div>
              <p className="font-semibold">Issued</p>
              <p>{format(issuedDate, "PPP p")}</p>
            </div>
            <div>
              <p className="font-semibold">Status</p>
              <p
                className={
                  ticket.status === "CONFIRMED"
                    ? "text-green-700"
                    : ticket.status === "CANCELLED"
                    ? "text-red-700"
                    : ""
                }
              >
                {ticket.status}
              </p>
            </div>
            <div>
              <p className="font-semibold">Payment</p>
              <p>{ticket.paymentStatus}</p>
            </div>
          </div>

          {/* Passengers */}
          {ticket.passengers.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Passengers
              </h2>
              <table className="w-full text-sm text-gray-700 border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">DOB</th>
                    <th className="p-2 text-left">Passport No</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.passengers.map((p, i) => (
                    <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                      <td className="p-2">
                        {p.title} {p.firstName} {p.lastName}
                      </td>
                      <td className="p-2">
                        {format(new Date(p.dob), "MM/dd/yyyy")}
                      </td>
                      <td className="p-2">{p.passportNo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Flight itinerary */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Flight Itinerary
            </h2>
            <div className="space-y-4">
              {ticket.flightSegments.map((seg, i) => (
                <div
                  key={i}
                  className="border rounded-lg bg-gray-50 p-4 print:bg-white"
                >
                  <p className="font-medium">
                    {seg.airlineName || seg.airlineCode} {seg.flightNumber} —{" "}
                    {seg.cabinClass}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>From:</strong> {seg.origin} at{" "}
                    {format(new Date(seg.departureDateTime), "PPP p")}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>To:</strong> {seg.destination} at{" "}
                    {format(new Date(seg.arrivalDateTime), "PPP p")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Fare breakdown */}
          {ticket.fareBreakdown.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Fare Breakdown
              </h2>
              <table className="w-full text-sm text-gray-700 border">
                <tbody>
                  {ticket.fareBreakdown.map((f, i) => (
                    <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                      <td className="p-2">{f.label}</td>
                      <td className="p-2 text-right">
                        {f.amount.toFixed(2)} {ticket.currency}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold border-t">
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right">
                      {ticket.totalPrice.toFixed(2)} {ticket.currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {/* Taxes & fees */}
          {ticket.taxes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Taxes & Fees
              </h2>
              <table className="w-full text-sm text-gray-700 border">
                <tbody>
                  {ticket.taxes.map((t, i) => (
                    <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                      <td className="p-2">{t.name}</td>
                      <td className="p-2 text-right">
                        {t.amount.toFixed(2)} {ticket.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Fare rules link */}
          {ticket.fareRulesUrl && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Fare Rules
              </h2>
              <p className="text-sm text-gray-700">
                For full fare rules,{" "}
                <a
                  href={ticket.fareRulesUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-blue-600 hover:underline"
                >
                  click here
                </a>
                .
              </p>
            </section>
          )}
        </div>

        {/* Footer back link */}
        <div className="p-6 text-center print:hidden">
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to My Bookings
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
