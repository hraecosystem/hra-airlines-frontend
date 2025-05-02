// app/payment/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { CreditCard, DollarSign, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type Method = "stripe" | "hra-coin";

interface FlightSegment {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  cabinClass: string;
}

interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  passportNo?: string;
}

interface FareLine {
  label: string;
  amount: number;
}

interface TaxLine {
  name: string;
  amount: number;
}

interface BookingDetails {
  segments: FlightSegment[];
  passengers: Passenger[];
  fareBreakdown?: FareLine[];
  taxes?: TaxLine[];
  totalPrice: number;
  currency: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [method, setMethod] = useState<Method>("stripe");
  const [stripeUrl, setStripeUrl] = useState("");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login?redirect=/payment");
    }
  }, [authLoading, user, router]);

  // Fetch booking details
  useEffect(() => {
    if (!user) return;
    const bookingId = localStorage.getItem("bookingId");
    if (!bookingId) return router.replace("/dashboard/bookings");
    api
      .get<{ status: string; data: BookingDetails }>(`/booking/${bookingId}`)
      .then(res => {
        if (res.data.status === "success") {
          setBooking(res.data.data);
        } else {
          throw new Error("Failed to load booking");
        }
      })
      .catch(() => setError("Unable to load your booking."))
      .finally(() => setLoading(false));
  }, [user, router]);

  // Create Stripe checkout session
  useEffect(() => {
    if (!booking || method !== "stripe") return;
    setCheckoutLoading(true);
    api
      .post<{ data: { url: string } }>("/payment/create-checkout-session")
      .then(res => {
        setStripeUrl(res.data.data.url);
      })
      .catch(() => setError("Could not initiate Stripe checkout."))
      .finally(() => setCheckoutLoading(false));
  }, [booking, method]);

  const handlePay = () => {
    if (method === "stripe") {
      if (stripeUrl) window.location.href = stripeUrl;
    } else {
      // HRA Coin coming soon splash
      alert("🚀 HRA-Coin is coming soon! Stay tuned for exclusive crypto payments.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4">
        <p className="text-red-600">{error || "Booking not found."}</p>
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment | HRA Airlines</title>
        <meta
          name="description"
          content="Complete your payment with Stripe or HRA-Coin."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <motion.div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center px-6 py-4 bg-blue-600">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="mr-4 text-white hover:text-blue-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white">
              Complete Your Payment
            </h1>
          </div>

          <div className="p-6 space-y-8">
            {/* Trip Details */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Trip Details
              </h2>
              <div className="divide-y rounded-lg border">
                {booking.segments.map((seg, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row justify-between p-4 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {seg.origin} → {seg.destination}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(seg.departureDateTime).toLocaleString()} →{" "}
                        {new Date(seg.arrivalDateTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <p className="text-sm text-gray-700">
                        {seg.airline} #{seg.flightNumber}
                      </p>
                      <p className="text-sm text-gray-600">{seg.cabinClass}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-700">
                Passengers: <strong>{booking.passengers.length}</strong>
              </p>
            </section>

            {/* Passenger List */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Passengers
              </h2>
              <table className="w-full text-gray-700 text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">DOB</th>
                    <th className="p-2 text-left">Passport</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.passengers.map((p, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-2">
                        {p.title} {p.firstName} {p.lastName}
                      </td>
                      <td className="p-2">
                        {new Date(p.dob).toLocaleDateString()}
                      </td>
                      <td className="p-2">{p.passportNo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Fare Breakdown */}
            {(booking.fareBreakdown?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Fare Breakdown
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {booking.fareBreakdown!.map((f, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm text-gray-700 py-1"
                    >
                      <span>{f.label}</span>
                      <span>
                        {booking.currency} {f.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {booking.currency} {booking.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Taxes & Fees */}
            {(booking.taxes?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Taxes & Fees
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {booking.taxes!.map((t, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm text-gray-700 py-1"
                    >
                      <span>{t.name}</span>
                      <span>
                        {booking.currency} {t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Payment Method */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Payment Method
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setMethod("stripe")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition ${
                    method === "stripe"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <CreditCard
                    className={method === "stripe" ? "text-white" : "text-gray-600"}
                  />
                  Stripe
                </button>
                <div className="relative flex-1">
                  <button
                    onClick={() => setMethod("hra-coin")}
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed text-sm font-medium"
                  >
                    <DollarSign className="text-gray-400" />
                    HRA-Coin
                  </button>
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
              </div>
            </section>

            {/* Checkout */}
            <section className="pt-4">
              {checkoutLoading ? (
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Preparing checkout…
                </div>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={method === "stripe" && !stripeUrl}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {method === "stripe"
                    ? "Pay with Stripe"
                    : "HRA-Coin Coming Soon"}
                </button>
              )}
              {error && (
                <p className="mt-2 text-red-600 text-sm text-center">{error}</p>
              )}
            </section>
          </div>
        </div>
      </motion.div>
    </>
  );
}
