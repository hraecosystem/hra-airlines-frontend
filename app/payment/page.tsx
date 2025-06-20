// app/payment/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  CreditCard as CreditCardIcon,
  DollarSign,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plane,
  Users,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";

type Method = "stripe" | "hra-coin";

interface FlightSegment {
  airlineCode: string;
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
  flightSegments: FlightSegment[];
  passengers: Passenger[];
  fareBreakdown: FareLine[];
  taxes: TaxLine[];
  totalPrice: number;
  currency: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { formatPrice, convertPrice, currencyCode, currencyInfo } = useCurrency();

  const [method, setMethod] = useState<Method>("stripe");
  const [stripeUrl, setStripeUrl] = useState<string>("");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login?redirect=/payment");
    }
  }, [authLoading, user, router]);

  // Fetch booking details
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        console.log("Loading payment page...");
        const bookingId = localStorage.getItem("bookingId");
        console.log("Booking ID from localStorage:", bookingId);
        
        if (!bookingId) {
          console.error("No booking ID found in localStorage");
          router.replace("/dashboard/bookings");
          return;
        }

        console.log("Fetching booking details for ID:", bookingId);
        const res = await api.get<{
          status: string;
          data: BookingDetails;
        }>(`/ticket/${bookingId}`);

        console.log("Booking details response:", res.data);

        // unwrap:
        if (res.data.status !== "success" || !res.data.data) {
          console.error("Invalid booking response:", res.data);
          throw new Error("Invalid booking response");
        }

        setBooking(res.data.data);
        console.log("Booking details set successfully");
      } catch (error) {
        console.error("Error loading booking details:", error);
        setError("Failed to load booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, router]);

  // Create Stripe session
  useEffect(() => {
    if (!booking || method !== "stripe") return;
    setCheckoutLoading(true);
    api
      .post<{ status: string; data: { url: string } }>(
        "/payment/create-checkout-session",
        { bookingId: localStorage.getItem("bookingId") }
      )
      .then((res) => {
        if (res.data.status === "success") {
          setStripeUrl(res.data.data.url);
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        setError("Unable to initiate payment. Please retry.");
      })
      .finally(() => {
        setCheckoutLoading(false);
      });
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

  // 1) still loading auth or booking
  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <Loader2 className="animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // 2) error & no booking
  if (error && !booking) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 p-4">
        <AlertCircle className="text-red-600" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="text-blue-600 underline"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  // 3) guard: if booking somehow still null
  if (!booking) {
    return null;
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
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
          <header className="flex items-center bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="hover:bg-blue-700 p-2 rounded-full transition-colors"
            >
              <ArrowLeft />
            </button>
            <h1 className="ml-4 text-2xl font-semibold">
              Complete Your Payment
            </h1>
          </header>

          <main className="p-6 space-y-8">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trip Details */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-blue-600" />
                      Trip Details
                    </h2>
                  </div>
                  <div className="divide-y">
                    {booking.flightSegments.map((s, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {s.origin} → {s.destination}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                s.departureDateTime
                              ).toLocaleString()}{" "}
                              —{" "}
                              {new Date(s.arrivalDateTime).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{s.airlineCode}</p>
                            <p className="text-sm text-gray-500">
                              Flight #{s.flightNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {s.cabinClass}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Passengers
                    </h2>
                  </div>
                  <div className="divide-y">
                    {booking.passengers.map((p, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {p.title} {p.firstName} {p.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              DOB:{" "}
                              {new Date(p.dob).toLocaleDateString()}
                            </p>
                          </div>
                          {p.passportNo && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Passport: {p.passportNo}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Payment Summary
                    </h2>
                  </div>
                  <div className="p-4 space-y-4">
                    {booking.fareBreakdown.map((fare, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{fare.label}</span>
                        <span className="font-medium">
                          {formatPrice(fare.amount, booking.currency)}
                        </span>
                      </div>
                    ))}
                    {booking.taxes.map((tax, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-500">{tax.name}</span>
                        <span className="text-gray-600">
                          {formatPrice(tax.amount, booking.currency)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total Amount</span>
                        <span className="text-blue-600">
                          {formatPrice(booking.totalPrice, booking.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5 text-blue-600" />
                      Payment Method
                    </h2>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setMethod("stripe")}
                        className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            method === "stripe"
                              ? "bg-blue-50 border-2 border-blue-600 text-blue-600"
                              : "bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-gray-300"
                          }
                        `}
                      >
                        <img
                          src="https://stripe.com/img/v3/home/twitter.png"
                          alt="Stripe"
                          className="h-6"
                        />
                        <span>Stripe</span>
                      </button>
                      <button
                        onClick={() => setMethod("hra-coin")}
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed text-sm font-medium"
                      >
                        <DollarSign className="w-5 h-5" />
                        <span>HRA-Coin (Soon)</span>
                      </button>
                    </div>

                    {checkoutLoading ? (
                      <button className="w-full flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg opacity-75 cursor-wait">
                        <Loader2 className="animate-spin" /> Preparing Payment...
                      </button>
                    ) : (
                      <button
                        onClick={handlePay}
                        disabled={method === "stripe" && !stripeUrl}
                        className="w-full p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {method === "stripe"
                          ? "Pay with Stripe"
                          : "HRA-Coin Coming Soon"}
                      </button>
                    )}

                    {error && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm">
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </motion.div>
    </>
  );
}
