// app/payment/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { CreditCard, DollarSign, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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
  const [stripeUrl, setStripeUrl] = useState<string>("");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/login?redirect=/payment");
  }, [authLoading, user, router]);

  // Fetch booking details
  useEffect(() => {
    if (!user) return;
    const bookingId = localStorage.getItem("bookingId");
    if (!bookingId) return router.replace("/dashboard/bookings");

    api
      .get<{ status: string; data: BookingDetails }>(`/booking/${bookingId}`)
      .then(({ data }) => {
        if (data.status === "success" || (data as any).status === undefined) {
          setBooking((data as any).data ?? data as any);
        } else {
          throw new Error();
        }
      })
      .catch(() => setError("Failed to load booking details. Please try again."))
      .finally(() => setLoading(false));
  }, [user, router]);

  // Create Stripe session
  useEffect(() => {
    if (!booking || method !== "stripe") return;
    setCheckoutLoading(true);
    api
      .post<{ data: { url: string } }>("/payment/create-checkout-session", { bookingId: localStorage.getItem("bookingId") })
      .then(res => setStripeUrl(res.data.data.url))
      .catch(() => setError("Unable to initiate payment. Please retry."))
      .finally(() => setCheckoutLoading(false));
  }, [booking, method]);

  const handlePay = useCallback(() => {
    if (checkoutLoading) return;
    if (method === "stripe") {
      if (stripeUrl) {
        router.push(stripeUrl);
      } else {
        setError("Payment URL not available. Please reload the page.");
      }
    } else {
      alert("🚀 HRA-Coin is coming soon! Stay tuned for crypto payments.");
    }
  }, [method, stripeUrl, checkoutLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <Loader2 className="animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 p-4">
        <AlertCircle className="text-red-600" />
        <p className="text-red-600">{error}</p>
        <button onClick={() => router.push("/dashboard/bookings")} className="text-blue-600 underline">
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment | HRA Airlines</title>
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6"
      >
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden">
          <header className="flex items-center bg-blue-600 p-4 text-white">
            <button onClick={() => router.back()} aria-label="Back">
              <ArrowLeft />
            </button>
            <h1 className="ml-4 text-xl font-semibold">Complete Your Payment</h1>
          </header>

          <main className="p-6 space-y-6">
            {/* Booking Summary */}
            <section>
              <h2 className="text-lg font-medium text-gray-800 mb-2">Summary</h2>
              <div className="rounded-lg border divide-y">
                {booking!.segments.map((s, idx) => (
                  <div key={idx} className="flex justify-between p-3 hover:bg-gray-50">
                    <div>
                      <p className="font-semibold">{s.origin} → {s.destination}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(s.departureDateTime).toLocaleString()} —{' '}
                        {new Date(s.arrivalDateTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{s.airline} #{s.flightNumber}</p>
                      <p className="text-sm text-gray-500">{s.cabinClass}</p>
                    </div>
                  </div>
                ))}
                <div className="p-3 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>
                    {booking!.currency} {booking!.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-lg font-medium text-gray-800 mb-2">Payment Method</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setMethod("stripe")}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition 
                    ${method === "stripe" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                  `}
                >
                  <CreditCard /> Stripe
                </button>
                <button
                  onClick={() => setMethod("hra-coin")}
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed text-sm font-medium"
                >
                  <DollarSign /> HRA-Coin (Soon)
                </button>
              </div>
            </section>

            {/* Checkout Button */}
            <section>
              {checkoutLoading ? (
                <button className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg opacity-75 cursor-wait">
                  <Loader2 className="animate-spin" /> Preparing...
                </button>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={method === "stripe" && !stripeUrl}
                  className="w-full p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {method === "stripe" ? "Pay with Stripe" : "HRA-Coin Coming Soon"}
                </button>
              )}
              {error && <p className="mt-2 text-red-600 text-center">{error}</p>}
            </section>
          </main>
        </div>
      </motion.div>
    </>
  );
}
