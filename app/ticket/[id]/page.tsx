// app/ticket/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Printer, Download } from "lucide-react";

export default function TicketPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1) Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?redirect=/ticket/${id}`);
    }
  }, [authLoading, user, router, id]);

  // 2) Fetch the ticket once we know the user is logged in
  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      try {
        const res = await api.get(`/ticket/${id}`);
        setTicket(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Ticket not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  // 3) Simple loader / error states
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading your ticket…
      </div>
    );
  }
  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {error || "Unable to load ticket."}
      </div>
    );
  }

  // 4) Print handler
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:shadow-none">
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-lg p-6 print:shadow-none">
        <h1 className="text-3xl font-bold text-pink-700 mb-4 text-center">🎫 Flight Ticket</h1>

        <dl className="grid grid-cols-2 gap-y-2 text-sm text-gray-800">
          <dt className="font-semibold">PNR:</dt>
          <dd>{ticket.pnr}</dd>
          <dt className="font-semibold">Status:</dt>
          <dd>{ticket.status}</dd>
          <dt className="font-semibold">Payment:</dt>
          <dd>{ticket.paymentStatus}</dd>
          <dt className="font-semibold">Total:</dt>
          <dd>{ticket.totalPrice} {ticket.currency}</dd>
          <dt className="font-semibold">Booked On:</dt>
          <dd>{new Date(ticket.bookedAt).toLocaleDateString()}</dd>
        </dl>

        {ticket.passengers?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Passengers</h2>
            <ul className="list-disc ml-5 text-gray-700">
              {ticket.passengers.map((p: any, i: number) => (
                <li key={i}>
                  {p.title} {p.firstName} {p.lastName} <span className="text-xs text-gray-500">({new Date(p.dob).toLocaleDateString()})</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {ticket.flightSegments?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Flight Segments</h2>
            {ticket.flightSegments.map((seg: any, i: number) => (
              <div key={i} className="mb-3 text-gray-700 text-sm">
                ✈️ <span className="font-medium">{seg.airlineCode} {seg.flightNumber}</span><br/>
                <strong>{seg.origin}</strong> → <strong>{seg.destination}</strong><br/>
                🕒 {new Date(seg.departureDateTime).toLocaleString()} – {new Date(seg.arrivalDateTime).toLocaleString()}<br/>
                🪑 Cabin: {seg.cabinClass}
              </div>
            ))}
          </section>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition print:hidden"
          >
            <Printer className="w-5 h-5" /> Print / Save as PDF
          </button>
          {/* If you have a real PDF download endpoint, swap this href */}
          <a
            href={`/api/v1/ticket/${id}/pdf`}
            download
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition print:hidden"
          >
            <Download className="w-5 h-5" /> Download PDF
          </a>
        </div>

        {/* Back to dashboard */}
        <div className="mt-6 text-center print:hidden">
          <Link href="/dashboard/bookings" className="text-sm text-blue-600 hover:underline">
            ← Back to My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
