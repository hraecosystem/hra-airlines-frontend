// app/booking/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Select from "react-select";
import countryList from "react-select-country-list";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type CountryOption = { label: string; value: string };

interface Passenger {
  type: "ADT" | "CHD" | "INF";
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  nationality: CountryOption | null;
  passportNo: string;
  passportIssueCountry: CountryOption | null;
  passportIssueDate: string;
  passportExpiryDate: string;
}

function makePassenger(
  type: "ADT" | "CHD" | "INF",
  title: string
): Passenger & { type: string } {
  return {
    type,
    title,
    firstName: "",
    lastName: "",
    dob: "",
    nationality: null,
    passportNo: "",
    passportIssueCountry: null,
    passportIssueDate: "",
    passportExpiryDate: "",
  };
}

const countryOptions = countryList().getData();
const digits = (s: string) => s.replace(/\D/g, "");

export default function BookingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [fare, setFare] = useState<any>(null);

  const [sessionId, setSessionId] = useState(""); // search-level token
  const [fareSource, setFareSource] = useState(""); // itinerary-level token
  const [needsPassport, setNeedsPassport] = useState(true);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const [fareRules, setFareRules] = useState<any>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const [rawFareRT, setRawFareRT] = useState<string | null>(null);
  const [rawFareSourceInbound, setRawFareSourceInbound] = useState<
    string | null
  >(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login?redirect=/booking");
    }
  }, [authLoading, user, router]);

  // Initial load: grab fare + session + build passengers
  useEffect(() => {
    (async () => {
      try {
        const fareRT = localStorage.getItem("selectedFareRT");

        const rawFare = localStorage.getItem("selectedFare");
        const rawSession = localStorage.getItem("flightSessionId");
        const rawFareSource = localStorage.getItem("fareSourceCode");
        const fareInbound = localStorage.getItem("fareSourceCodeInbound");

        setRawFareRT(fareRT);
        setRawFareSourceInbound(fareInbound);

        if (!rawSession || !rawFareSource)
          throw new Error("No flight selected.");

        const parsed = fareRT ? JSON.parse(fareRT) : JSON.parse(rawFare!); // add ! to assert non-null
        const fullFare = fareRT ? parsed.Outbound : parsed;

        setFare(fullFare);
        setSessionId(rawSession);
        setFareSource(rawFareSource);

        if (rawFareRT && rawFareSourceInbound) {
          localStorage.setItem(
            "bookingInboundFare",
            JSON.stringify(parsed.Inbound)
          );
        }

const qtyOf = (code: string) =>
  fullFare.AirItineraryFareInfo.FareBreakdown.find(
    (b: any) => b.PassengerTypeQuantity.Code === code
  )?.PassengerTypeQuantity.Quantity || 0;
  

        setPassengers([
          ...Array(qtyOf("ADT"))
            .fill(0)
            .map(() => makePassenger("ADT", "Mr")),
          ...Array(qtyOf("CHD"))
            .fill(0)
            .map(() => makePassenger("CHD", "Master")),
          ...Array(qtyOf("INF"))
            .fill(0)
            .map(() => makePassenger("INF", "Master")),
        ]);

        // prefill contact
        const prof = await api.get("/profile");
        const { email = "", phone = "" } = prof?.data?.data ?? {};
        setEmail(email);
        setPhone(phone);
      } catch (e: any) {
        setError(e.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    })();

    // auto-expire
    const timer = setTimeout(() => {
      alert("⏰ Session expired. Please search again.");
      router.push("/search-results");
    }, 15 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [router]);

  // passenger field updater
  const updatePassenger = <K extends keyof Passenger>(
    idx: number,
    key: K,
    value: Passenger[K]
  ) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      if (
        key === "nationality" &&
        needsPassport &&
        !next[idx].passportIssueCountry
      ) {
        next[idx].passportIssueCountry = value as CountryOption;
      }
      return next;
    });
  };

  // validate contact + pax
  const validate = () => {
    const errs: Record<string, boolean> = {};
    let ok = true;

    if (!email.trim() || !phone.trim()) {
      setError("Email and phone are required.");
      ok = false;
    }

    passengers.forEach((p, i) => {
      const base = `pax-${i}-`;
      if (!p.firstName) (errs[base + "firstName"] = true), (ok = false);
      if (!p.lastName) (errs[base + "lastName"] = true), (ok = false);
      if (!p.dob) (errs[base + "dob"] = true), (ok = false);
      if (!p.nationality) (errs[base + "nationality"] = true), (ok = false);
      if (needsPassport) {
        if (!p.passportNo) (errs[base + "passportNo"] = true), (ok = false);
        if (!p.passportIssueCountry)
          (errs[base + "passportIssueCountry"] = true), (ok = false);
        if (!p.passportIssueDate)
          (errs[base + "passportIssueDate"] = true), (ok = false);
        if (!p.passportExpiryDate)
          (errs[base + "passportExpiryDate"] = true), (ok = false);
      }
    });

    setFieldErrors(errs);
    if (!ok) setError("Please fix the highlighted fields.");
    return ok;
  };

  // pack passenger arrays into payload shape
  const pack = (arr: Passenger[]) => ({
    title: arr.map((p) => p.title),
    firstName: arr.map((p) => p.firstName.trim()),
    lastName: arr.map((p) => p.lastName.trim()),
    dob: arr.map((p) => p.dob),
    nationality: arr.map((p) => p.nationality?.value || ""),
    passportNo: arr.map((p) => p.passportNo.trim()),
    passportIssueCountry: arr.map((p) => p.passportIssueCountry?.value || ""),
    passportIssueDate: arr.map((p) => p.passportIssueDate),
    passportExpiryDate: arr.map((p) => p.passportExpiryDate),
  });

  /* ------------------------------------------------------------------ */
  /* 🔸 buildBookingPayload – make the exact object you now post to /book */
  /* ------------------------------------------------------------------ */
  const buildBookingPayload = () => {
    const adults = passengers.filter((p) => p.type === "ADT");
    const childs = passengers.filter((p) => p.type === "CHD");
    const infs = passengers.filter((p) => p.type === "INF");

    const inboundFareSource = localStorage.getItem("fareSourceCodeInbound");

    return {
      flight_session_id: sessionId,
      fare_source_code: fareSource,
      fare_source_code_inbound: inboundFareSource || undefined,

      flightBookingInfo: {
        flight_session_id: sessionId,
        fare_source_code: fareSource,
        fare_source_code_inbound: inboundFareSource || undefined,

        IsPassportMandatory: "true",
        areaCode: digits(phone).slice(0, 3) || "971",
        countryCode: digits(phone).slice(0, 3) || "971",
        fareType: (
          fare?.AirItineraryFareInfo || fare?.Outbound?.AirItineraryFareInfo
        )?.FareType,
        // Public | Private | WebFare
      },
      paxInfo: {
        customerEmail: email.trim(),
        customerPhone: digits(phone),
        paxDetails: [
          { adult: pack(adults), child: pack(childs), infant: pack(infs) },
        ],
      },
      fareItinerary: fare,
    };
  };

  /* ------------------------------------------------------------------ */
  /* 🔸 startLccCheckout – create Stripe session for WebFare/LCC          */
  /* ------------------------------------------------------------------ */
  const startLccCheckout = async () => {
    setSubmitting(true);
    try {
      const payload = buildBookingPayload();
      const getTotalFare = () => {
        if (fare?.AirItineraryFareInfo?.ItinTotalFares?.TotalFare) {
          return fare.AirItineraryFareInfo.ItinTotalFares.TotalFare;
        }
        if (fare?.Outbound?.AirItineraryFareInfo?.ItinTotalFares?.TotalFare) {
          return fare.Outbound.AirItineraryFareInfo.ItinTotalFares.TotalFare;
        }
        // fallback for single one-way
        return { Amount: "0", CurrencyCode: "USD" };
      };

      const tf = getTotalFare();

      const res = await api.post("/payment/create-checkout-session-lcc", {
        bookingPayload: payload,
        totalPrice: Number(tf.Amount),
        currency: tf.CurrencyCode || "USD",
      });
      window.location.href = res.data.data.url; // 🔁  full-page redirect to Stripe
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate() || !fare) return;
    setSubmitting(true);
    const activeFare = fare?.AirItineraryFareInfo ? fare : fare?.Outbound;
    const tf = activeFare?.AirItineraryFareInfo?.ItinTotalFares?.TotalFare;

    try {
      // revalidate…
      const revOut = await api.post("/flights/revalidate", {
        flight_session_id: sessionId,
        fare_source_code: fareSource,
      });

      const isValidOut =
        revOut.data?.data?.IsValid ?? revOut.data?.data?.Success ?? false;

      if (!isValidOut) {
        alert("Outbound fare expired. Please search again.");
        return router.push("/search-results");
      }

      let revalItin = revOut.data?.data?.FareItineraries?.FareItinerary;

      if (rawFareRT && rawFareSourceInbound) {
        const revIn = await api.post("/flights/revalidate", {
          flight_session_id: sessionId,
          fare_source_code: rawFareSourceInbound,
        });

        const isValidIn =
          revIn.data?.data?.IsValid ?? revIn.data?.data?.Success ?? false;

        if (!isValidIn) {
          alert("Return fare expired. Please search again.");
          return router.push("/search-results");
        }

        const revalInItin = revIn.data?.data?.FareItineraries?.FareItinerary;
        revalItin = {
          Outbound: revalItin,
          Inbound: revalInItin,
        };

        localStorage.setItem("selectedFareRT", JSON.stringify(revalItin));
      } else {
        localStorage.setItem("selectedFare", JSON.stringify(revalItin));
      }

      setFare(revalItin);

      // fetch fare rules
      const resp = await api.post("/flights/fare-rules", {
        session_id: sessionId,
        fare_source_code: fareSource,
      });

      // UNWRAP both layers
      const payload = resp.data?.data;
      const rulesData = payload?.FareRules1_1Response?.FareRules1_1Result || {};

      // set state
      setFareRules(rulesData);
      setShowRulesModal(true);
    } catch (e: any) {
      const msg = e.response?.data?.error?.ErrorMessage || e.message;
      setError(msg);
      if (msg.toLowerCase().includes("passport")) {
        setNeedsPassport(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmBooking = async () => {
    setSubmitting(true); // ← start the spinner/disable
    const activeFare = fare?.AirItineraryFareInfo ? fare : fare?.Outbound;
    const tf = activeFare?.AirItineraryFareInfo?.ItinTotalFares?.TotalFare;

    try {
      const adults = passengers.filter((p) => p.type === "ADT");
      const childs = passengers.filter((p) => p.type === "CHD");
      const infs = passengers.filter((p) => p.type === "INF");

      const fareSourceInbound =
        localStorage.getItem("fareSourceCodeInbound") || "";

      const payload = {
        flight_session_id: sessionId,
        fare_source_code: fareSource,
        fare_source_code_inbound: fareSourceInbound || undefined,

        flightBookingInfo: {
          flight_session_id: sessionId,
          fare_source_code: fareSource,
          fare_source_code_inbound: fareSourceInbound || undefined,

          IsPassportMandatory: "true",
          areaCode: digits(phone).slice(0, 3) || "971",
          countryCode: digits(phone).slice(0, 3) || "971",
          fareType: activeFare?.AirItineraryFareInfo?.FareType,
        },
        paxInfo: {
          customerEmail: email.trim(),
          customerPhone: digits(phone),
          paxDetails: [
            { adult: pack(adults), child: pack(childs), infant: pack(infs) },
          ],
        },
        fareItinerary: fare,
      };

      const resp = await api.post("/flights/book", payload);
      const id = resp.data?.data?.bookingId ?? resp.data?.mongoBookingId;
      if (id) {
        localStorage.setItem("bookingId", id);
        localStorage.removeItem("selectedFare");
        localStorage.removeItem("flightSessionId");
        localStorage.removeItem("fareSourceCode");
        router.push("/payment");
      } else {
        throw new Error("Booking failed.");
      }
    } catch (err: any) {
      setError(err.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
          <header className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Booking Details</h1>
            <p className="text-blue-100 mt-1">
              Please fill in your information to complete the booking
            </p>
          </header>
          <main className="p-8 space-y-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm"
              >
                {error}
                {error.includes("search again") && (
                  <button
                    onClick={() => router.push("/search-results")}
                    className="ml-4 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Back to Search
                  </button>
                )}
              </motion.div>
            )}

            {/* Contact inputs */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPhone(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Passenger forms */}
            {passengers.map((p, idx) => {
              const base = `pax-${idx}-`;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    Passenger {idx + 1} (
                    {p.type === "ADT"
                      ? "Adult"
                      : p.type === "CHD"
                      ? "Child"
                      : "Infant"}
                    )
                  </h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Title
                      </label>
                      <select
                        value={p.title}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          updatePassenger(idx, "title", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {(p.type === "ADT"
                          ? ["Mr", "Mrs", "Miss"]
                          : ["Master", "Miss"]
                        ).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* First Name */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        First Name
                      </label>
                      <input
                        value={p.firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePassenger(idx, "firstName", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          fieldErrors[base + "firstName"]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {/* Last Name */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        value={p.lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePassenger(idx, "lastName", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          fieldErrors[base + "lastName"]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                    {/* DOB */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={p.dob}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePassenger(idx, "dob", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          fieldErrors[base + "dob"]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {/* Nationality */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Nationality
                      </label>
                      <Select
                        options={countryOptions}
                        value={p.nationality}
                        onChange={(val) =>
                          updatePassenger(
                            idx,
                            "nationality",
                            val as CountryOption
                          )
                        }
                        className="mt-1"
                        classNamePrefix="select"
                        placeholder="Select country..."
                      />
                    </div>

                    {/* Passport fields */}
                    {needsPassport && (
                      <>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Passport Number
                          </label>
                          <input
                            value={p.passportNo}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              updatePassenger(idx, "passportNo", e.target.value)
                            }
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              fieldErrors[base + "passportNo"]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="AB123456"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 font-medium mb-2">
                            Passport Issue Country
                          </label>
                          <Select
                            options={countryOptions}
                            value={p.passportIssueCountry}
                            onChange={(val) =>
                              updatePassenger(
                                idx,
                                "passportIssueCountry",
                                val as CountryOption
                              )
                            }
                            className="mt-1"
                            classNamePrefix="select"
                            placeholder="Select country..."
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Issue Date
                          </label>
                          <input
                            type="date"
                            value={p.passportIssueDate}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              updatePassenger(
                                idx,
                                "passportIssueDate",
                                e.target.value
                              )
                            }
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              fieldErrors[base + "passportIssueDate"]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={p.passportExpiryDate}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              updatePassenger(
                                idx,
                                "passportExpiryDate",
                                e.target.value
                              )
                            }
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              fieldErrors[base + "passportExpiryDate"]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed text-gray-700"
                  : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Proceed to Payment"
              )}
            </motion.button>
          </main>
          {showRulesModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Fare Rules & Conditions
                </h2>

                {/* FARE RULES SECTION */}
                <h3 className="text-lg font-semibold mb-2">Fare Rules</h3>
                {fareRules?.FareRules?.length ? (
                  <ul className="space-y-4 max-h-40 overflow-y-auto text-sm text-gray-700">
                    {fareRules.FareRules.map((ruleObj: any, idx: number) => {
                      const r = ruleObj.FareRule || {};
                      return (
                        <li key={idx} className="border-b pb-3">
                          <div>
                            <strong>Airline:</strong> {r.Airline || "—"}
                          </div>
                          <div>
                            <strong>Route:</strong> {r.CityPair || "—"}
                          </div>
                          <div>
                            <strong>Category:</strong> {r.Category || "—"}
                          </div>
                          <div>
                            <strong>Rules:</strong>{" "}
                            {r.Rules?.trim()
                              ? r.Rules.trim()
                              : "No rules provided by airline."}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm">
                    No fare rules available.
                  </p>
                )}

                {/* BAGGAGE SECTION */}
                <h3 className="mt-6 text-lg font-semibold mb-2">
                  Baggage Allowance
                </h3>
                {fareRules?.BaggageInfos?.length ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {fareRules.BaggageInfos.map((b: any, idx: number) => {
                      const info = b.BaggageInfo || {};
                      return (
                        <li key={idx}>
                          <div>
                            <strong>Flight:</strong> {info.FlightNo || "—"}
                          </div>
                          <div>
                            <strong>Route:</strong> {info.Departure || "—"} →{" "}
                            {info.Arrival || "—"}
                          </div>
                          <div>
                            <strong>Allowance:</strong> {info.Baggage || "—"}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm">
                    No baggage info available.
                  </p>
                )}

                {/* ACTION BUTTONS */}
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() => setShowRulesModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={async () => {
                      setShowRulesModal(false);
if (
  (fare?.AirItineraryFareInfo?.FareType ?? fare?.Outbound?.AirItineraryFareInfo?.FareType) ===
  "WebFare") {
                        // LCC – pay first, seats are created after Stripe webhook
                        await startLccCheckout();
                      } else {
                        // GDS – current flow
                        confirmBooking();
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Accept & Book
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
