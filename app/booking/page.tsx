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



function makePassenger(type: "ADT"|"CHD"|"INF", title: string): Passenger & { type: string } {
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
  const [fare, setFare] = useState<any>(null);   //  <-- you removed this by accident

  const [sessionId,   setSessionId]   = useState("");   // search-level token
  const [fareSource,  setFareSource]  = useState("");   // itinerary-level token
  const [needsPassport, setNeedsPassport] = useState(true);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

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
        const rawFare        = localStorage.getItem("selectedFare");
        const rawSession     = localStorage.getItem("flightSessionId");
        const rawFareSource  = localStorage.getItem("fareSourceCode");
        if (!rawFare || !rawSession || !rawFareSource) {
          throw new Error("No flight selected.");
        }

        const parsed = JSON.parse(rawFare);     // parse only once
        setFare(parsed);                        // keep the full itinerary in state
        setSessionId(rawSession);               // search-level token (unchanged)
        setFareSource(rawFareSource);           // itinerary-level token (NEW)
        



// ── passenger array ──
const qtyOf = (code: string) =>
  parsed.AirItineraryFareInfo.FareBreakdown.find(
    (b: any) => b.PassengerTypeQuantity.Code === code
  )?.PassengerTypeQuantity.Quantity || 0;

  setPassengers([
    ...Array(qtyOf("ADT")).fill(0).map(() => makePassenger("ADT","Mr")),
    ...Array(qtyOf("CHD")).fill(0).map(() => makePassenger("CHD","Master")),
    ...Array(qtyOf("INF")).fill(0).map(() => makePassenger("INF","Master")),
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
          (errs[base + "passportIssueCountry"] = true),
            (ok = false);
        if (!p.passportIssueDate)
          (errs[base + "passportIssueDate"] = true),
            (ok = false);
        if (!p.passportExpiryDate)
          (errs[base + "passportExpiryDate"] = true),
            (ok = false);
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

  // -- HANDLE SUBMIT ---------------------------------------------------------
  const handleSubmit = async () => {
    setError("");
    if (!validate() || !fare) return;
    setSubmitting(true);

    try {
      // 1) revalidate
      const rev = await api.post("/flights/revalidate", {
        flight_session_id: sessionId,
        fare_source_code : fareSource,
      });
        const isValid = rev.data?.data?.IsValid ?? rev.data?.data?.Success ?? false;

      if (!isValid) {
        alert("Fare expired. Please search again.");
        return router.push("/search-results");
      }

      // 2) split pax types
      const adults = passengers.filter((p) => p.type === "ADT");
      const childs = passengers.filter((p) => p.type === "CHD");
      const infs   = passengers.filter((p) => p.type === "INF");

      // 3) build booking payload
      const payload = {
        flightBookingInfo: {
          flight_session_id: sessionId,   // search-level
          fare_source_code : fareSource,  // itinerary-level
          IsPassportMandatory: "true",          // always send "true"
          areaCode   : digits(phone).slice(0,3) || "971",
          countryCode: digits(phone).slice(0,3) || "971",
          fareType: fare.AirItineraryFareInfo.FareType,
        },
        paxInfo: {
          customerEmail: email.trim(),
          customerPhone: digits(phone),   // ← no "+"
          paxDetails: [
            { adult: pack(adults), child: pack(childs), infant: pack(infs) },
          ],
        },
        fareItinerary: fare,                 // 👈 add this line

      };

      // 4) book
      const resp = await api.post("/flights/book", payload);

      // unwrap your helper
      const raw = (resp as any).data ?? resp;
      console.log("Raw booking response:", raw);

      // ---- NEW: first check the Booking API wrapper ----
if (
  raw.status === "success" &&
  raw.data &&
  typeof (raw.data.bookingId ?? raw.data.mongoBookingId) === "string"
) {
  const id = raw.data.bookingId ?? raw.data.mongoBookingId;
  localStorage.setItem("bookingId", id);
  return router.push("/payment");
}


      // ---- FALLBACK: old BookFlightResponse logic ----
      const result =
        raw.BookFlightResponse?.BookFlightResult ??
        raw.data?.BookFlightResponse?.BookFlightResult;

      if (!result) {
        setError("Unexpected booking response. Please try again.");
        return;
      }

      if (result.Success) {
        return router.push("/payment");
      }

      // collect any errors
      let msg = "Booking failed.";
      if (typeof result.Errors === "string" && result.Errors) {
        msg = result.Errors;
      } else if (Array.isArray(result.Errors) && result.Errors.length) {
        msg = result.Errors
          .map((e: any) => e.Errors?.[0]?.ErrorMessage)
          .filter(Boolean)
          .join("; ");
      } else if (result.Errors?.ErrorMessage) {
        msg = result.Errors.ErrorMessage;
      }
      setError(msg);
    } catch (e: any) {
      const msg = e.response?.data?.error?.ErrorMessage || e.message;
      setError(msg);
      // if the server suddenly demands passports, show those fields
      if (msg.toLowerCase().includes("passport")) {
        setNeedsPassport(true);
      }
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
            <h1 className="text-3xl font-bold text-white">
              Booking Details
            </h1>
            <p className="text-blue-100 mt-1">Please fill in your information to complete the booking</p>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
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
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
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
                    Passenger {idx + 1} ({p.type === "ADT" ? "Adult" : p.type === "CHD" ? "Child" : "Infant"})
                  </h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Title</label>
                      <select
                        value={p.title}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          updatePassenger(idx, "title", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {(p.type === "ADT" ? ["Mr", "Mrs", "Miss"] : ["Master", "Miss"]).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* First Name */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">First Name</label>
                      <input
                        value={p.firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePassenger(idx, "firstName", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          fieldErrors[base + "firstName"] ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {/* Last Name */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Last Name</label>
                      <input
                        value={p.lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePassenger(idx, "lastName", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          fieldErrors[base + "lastName"] ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                    {/* DOB */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={p.dob}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePassenger(idx, "dob", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          fieldErrors[base + "dob"] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {/* Nationality */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">Nationality</label>
                      <Select
                        options={countryOptions}
                        value={p.nationality}
                        onChange={(val) =>
                          updatePassenger(idx, "nationality", val as CountryOption)
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
                          <label className="block text-gray-700 font-medium mb-2">Passport Number</label>
                          <input
                            value={p.passportNo}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updatePassenger(idx, "passportNo", e.target.value)
                            }
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              fieldErrors[base + "passportNo"] ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="AB123456"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 font-medium mb-2">Passport Issue Country</label>
                          <Select
                            options={countryOptions}
                            value={p.passportIssueCountry}
                            onChange={(val) =>
                              updatePassenger(idx, "passportIssueCountry", val as CountryOption)
                            }
                            className="mt-1"
                            classNamePrefix="select"
                            placeholder="Select country..."
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Issue Date</label>
                          <input
                            type="date"
                            value={p.passportIssueDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updatePassenger(idx, "passportIssueDate", e.target.value)
                            }
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              fieldErrors[base + "passportIssueDate"] ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Expiry Date</label>
                          <input
                            type="date"
                            value={p.passportExpiryDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updatePassenger(idx, "passportExpiryDate", e.target.value)
                            }
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              fieldErrors[base + "passportExpiryDate"] ? "border-red-500" : "border-gray-300"
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Proceed to Payment"
              )}
            </motion.button>
          </main>
        </motion.div>
      </div>
    </div>
  );
}