// app/booking/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Select from "react-select";
import countryList from "react-select-country-list";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import FareRulesModal from "@/components/FareRulesModal";

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

// Styles pour les composants Select
const selectStyles = {
  control: (base: any) => ({
    ...base,
    color: "#111827", // text-gray-900 équivalent
  }),
  option: (base: any) => ({
    ...base,
    color: "#111827", // text-gray-900 équivalent
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#111827", // text-gray-900 équivalent
  }),
  input: (base: any) => ({
    ...base,
    color: "#111827", // text-gray-900 équivalent
  }),
};

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

  /**
   * Pulls a user-friendly message out of any Trawex error response.
   */
  const extractMessage = (err: any): string => {
    const data = err.response?.data;
    
    // top-level `{ error: { ErrorMessage } }`
    if (data?.error?.ErrorMessage) {
      return data.error.ErrorMessage;
    }
    
    // nested `{ error: { Errors: { ErrorMessage } } }`
    if (data?.error?.Errors?.ErrorMessage) {
      return data.error.Errors.ErrorMessage;
    }
    
    // fallback
    return err.message || "An unexpected error occurred. Please try again.";
  };

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

        // parsed = either { Outbound, Inbound } OR a single FareItinerary
        const parsed = fareRT ? JSON.parse(fareRT) : JSON.parse(rawFare!);
        setFare(parsed); // ← IMPORTANT: keep the entire object

        setSessionId(rawSession);
        setFareSource(rawFareSource);

        // if (rawFareRT && rawFareSourceInbound) {
        //   localStorage.setItem(
        //     "bookingInboundFare",
        //     JSON.stringify(parsed.Inbound)
        //   );
        // }

        // const qtyOf = (code: string) =>
        //   parsed.AirItineraryFareInfo.FareBreakdown.find(
        //     (b: any) => b.PassengerTypeQuantity.Code === code
        //   )?.PassengerTypeQuantity.Quantity || 0;

        // support both single-leg and RT shapes

        const fareInfo = parsed.AirItineraryFareInfo ?? parsed.Outbound?.AirItineraryFareInfo;

        const breakdown: any[] = Array.isArray(fareInfo?.FareBreakdown)
          ? fareInfo.FareBreakdown
          : fareInfo?.FareBreakdown
          ? [fareInfo.FareBreakdown]
          : [];

        const qtyOf = (code: string) =>
          breakdown.find((b) => b.PassengerTypeQuantity.Code === code)
            ?.PassengerTypeQuantity.Quantity || 0;

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

  const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

  const getDepartureDate = (): Date => {
    try {
      const odoOptions =
        fare?.OriginDestinationOptions ??
        fare?.Outbound?.OriginDestinationOptions;

      const firstOption = Array.isArray(odoOptions) && odoOptions.length > 0
        ? odoOptions[0]
        : null;

      const segments = firstOption?.OriginDestinationOption;

      const firstSegment = Array.isArray(segments) && segments.length > 0
        ? segments[0]?.FlightSegment
        : segments?.FlightSegment;

      const departureTime = typeof firstSegment?.DepartureDateTime === "string"
        ? firstSegment.DepartureDateTime
        : null;

      return departureTime ? new Date(departureTime) : new Date(NaN);
    } catch (err) {
      return new Date(NaN); // fallback for safety
    }
  };

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

  const validate = (): boolean => {
    const errs: Record<string, boolean> = {};
    let ok = true;

    const departureDate = getDepartureDate();
    if (!departureDate || isNaN(+departureDate)) {
      setError("Invalid departure date.");
      return false;
    }

    if (!email.trim() || !phone.trim()) {
      setError("Email and phone are required.");
      ok = false;
    }

    passengers.forEach((p, i) => {
      const base = `pax-${i}-`;
      const dob = new Date(p.dob);
      const ageAtDeparture =
        (departureDate.getTime() - dob.getTime()) / (1000 * 3600 * 24 * 365.25);

      if (!p.firstName) (errs[base + "firstName"] = true), (ok = false);
      if (!p.lastName) (errs[base + "lastName"] = true), (ok = false);
      if (!p.dob || isNaN(+dob)) (errs[base + "dob"] = true), (ok = false);
      else {
        if (p.type === "ADT" && ageAtDeparture < 12) {
          setError(
            `Passenger ${
              i + 1
            } (Adult) must be older than 12 years at departure.`
          );
          errs[base + "dob"] = true;
          ok = false;
        }
        if (p.type === "CHD" && (ageAtDeparture <= 2 || ageAtDeparture > 12)) {
          setError(
            `Passenger ${
              i + 1
            } (Child) must be between 2–12 years at departure.`
          );
          errs[base + "dob"] = true;
          ok = false;
        }
        if (p.type === "INF" && (ageAtDeparture <= 0 || ageAtDeparture > 2)) {
          setError(
            `Passenger ${
              i + 1
            } (Infant) must be between 0–2 years at departure.`
          );
          errs[base + "dob"] = true;
          ok = false;
        }
      }

      if (!p.nationality) (errs[base + "nationality"] = true), (ok = false);

      if (needsPassport) {
        const issueDate = new Date(p.passportIssueDate);
        const expiryDate = new Date(p.passportExpiryDate);

        if (!p.passportNo) (errs[base + "passportNo"] = true), (ok = false);
        if (!p.passportIssueCountry)
          (errs[base + "passportIssueCountry"] = true), (ok = false);
        if (!p.passportIssueDate || isNaN(+issueDate)) {
          errs[base + "passportIssueDate"] = true;
          ok = false;
        } else if (issueDate > departureDate) {
          setError(
            `Passenger ${i + 1}: Passport issue date cannot be after departure.`
          );
          errs[base + "passportIssueDate"] = true;
          ok = false;
        }

        if (!p.passportExpiryDate || isNaN(+expiryDate)) {
          errs[base + "passportExpiryDate"] = true;
          ok = false;
        } else if (expiryDate < departureDate) {
          setError(
            `Passenger ${i + 1}: Passport must be valid on the departure date.`
          );
          errs[base + "passportExpiryDate"] = true;
          ok = false;
        }
      }
    });

    setFieldErrors(errs);
    if (!ok && !error) setError("Please fix the highlighted fields.");
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

    // ➊ pick outbound vs combined shape
    const outboundItin = (fare as any).Outbound ?? fare;
    const inboundItin = (fare as any).Inbound;

    // ➋ merge both legs in one FareItinerary object
    const mergedItin = inboundItin
      ? {
          ...outboundItin,
          OriginDestinationOptions: [
            ...outboundItin.OriginDestinationOptions,
            ...inboundItin.OriginDestinationOptions,
          ],
        }
      : outboundItin;

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
      },
      paxInfo: {
        customerEmail: email.trim(),
        customerPhone: digits(phone),
        paxDetails: [
          { adult: pack(adults), child: pack(childs), infant: pack(infs) },
        ],
      },
      fareItinerary: mergedItin,
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
        // prioritize direct AirItineraryFareInfo
        if (fare?.AirItineraryFareInfo?.ItinTotalFares?.TotalFare) {
          return fare.AirItineraryFareInfo.ItinTotalFares.TotalFare;
        }
        // fallback to Outbound for RTs
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
      setError(extractMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate()) {
      return;
    }
    if (!fare) {
      return;
    }
    
    setSubmitting(true);
    const activeFare = fare?.AirItineraryFareInfo ? fare : fare?.Outbound;
    const tf = activeFare?.AirItineraryFareInfo?.ItinTotalFares?.TotalFare;

    try {
      // revalidate…
      const revOut = await api.post("/flights/revalidate", {
        flight_session_id: sessionId,
        fare_source_code: fareSource,
      });

      const isValidOut = revOut.data?.data?.IsValid ?? revOut.data?.data?.Success ?? false;

      if (!isValidOut) {
        alert(" Fare expired. Please search again.");
        return router.push("/search-results");
      }

      let revalItin = revOut.data?.data?.FareItineraries?.FareItinerary;

      if (rawFareRT && rawFareSourceInbound) {
        const revIn = await api.post("/flights/revalidate", {
          flight_session_id: sessionId,
          fare_source_code: rawFareSourceInbound,
        });

        const isValidIn = revIn.data?.data?.IsValid ?? revIn.data?.data?.Success ?? false;

        if (!isValidIn) {
          alert(" Fare expired. Please search again.");
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
      const msg = extractMessage(e);
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
      setError(extractMessage(err));
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

  const departureDate = getDepartureDate();

  const maxAdultDob = formatDateInput(
    new Date(
      departureDate.getFullYear() - 12,
      departureDate.getMonth(),
      departureDate.getDate()
    )
  );
  const maxChildDob = formatDateInput(
    new Date(
      departureDate.getFullYear() - 2,
      departureDate.getMonth(),
      departureDate.getDate()
    )
  );
  const minChildDob = formatDateInput(
    new Date(
      departureDate.getFullYear() - 12,
      departureDate.getMonth(),
      departureDate.getDate()
    )
  );
  const maxInfantDob = formatDateInput(departureDate);
  const minInfantDob = formatDateInput(
    new Date(
      departureDate.getFullYear() - 2,
      departureDate.getMonth(),
      departureDate.getDate()
    )
  );

  const maxPassportIssue = formatDateInput(departureDate);
  const minPassportExpiry = formatDateInput(departureDate);

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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                        } text-gray-900`}
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
                        } text-gray-900`}
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
                        onChange={(e) =>
                          updatePassenger(idx, "dob", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          fieldErrors[base + "dob"]
                            ? "border-red-500"
                            : "border-gray-300"
                        } text-gray-900 date-input-text-fix`}
                        min={
                          p.type === "INF"
                            ? minInfantDob
                            : p.type === "CHD"
                            ? minChildDob
                            : "1900-01-01"
                        }
                        max={
                          p.type === "INF"
                            ? maxInfantDob
                            : p.type === "CHD"
                            ? maxChildDob
                            : maxAdultDob
                        }
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
                        styles={selectStyles}
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
                            } text-gray-900`}
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
                            styles={selectStyles}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Issue Date
                          </label>
                          <input
                            type="date"
                            value={p.passportIssueDate}
                            onChange={(e) =>
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
                            } text-gray-900 date-input-text-fix`}
                            max={maxPassportIssue}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={p.passportExpiryDate}
                            onChange={(e) =>
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
                            } text-gray-900 date-input-text-fix`}
                            min={minPassportExpiry}
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
            <FareRulesModal
              isOpen={showRulesModal}
              onClose={() => setShowRulesModal(false)}
              onAccept={async () => {
                setShowRulesModal(false);
                if (
                  (fare?.AirItineraryFareInfo?.FareType ??
                    fare?.Outbound?.AirItineraryFareInfo?.FareType) ===
                  "WebFare"
                ) {
                  // LCC – pay first, seats are created after Stripe webhook
                  await startLccCheckout();
                } else {
                  // GDS – current flow
                  confirmBooking();
                }
              }}
              fareRules={fareRules}
              isLoading={submitting}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
