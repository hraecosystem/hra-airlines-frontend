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

function makePassenger(title: string): Passenger {
  return {
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

export default function BookingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [fare, setFare] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [needsPassport, setNeedsPassport] = useState(false);
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
        const rawFare = localStorage.getItem("selectedFare");
        const rawSession = localStorage.getItem("flightSessionId");
        if (!rawFare || !rawSession) {
          throw new Error("No flight selected.");
        }
        const parsed = JSON.parse(rawFare);
        setFare(parsed);
        setSessionId(rawSession);

        // detect passport requirement
        const passportFlag =
          parsed.AirItineraryFareInfo?.IsPassportMandatory ??
          parsed.IsPassportMandatory;
        setNeedsPassport(
          passportFlag === true ||
            String(passportFlag).toLowerCase() === "true"
        );

        // qty function
        const qtyOf = (code: string) =>
          parsed.AirItineraryFareInfo.FareBreakdown.find(
            (b: any) => b.PassengerTypeQuantity.Code === code
          )?.PassengerTypeQuantity.Quantity || 0;

        // build passenger array
        setPassengers([
          ...Array(qtyOf("ADT")).fill(null).map(() => makePassenger("Mr")),
          ...Array(qtyOf("CHD")).fill(null).map(() => makePassenger("Master")),
          ...Array(qtyOf("INF")).fill(null).map(() => makePassenger("Baby")),
        ]);

        // prefill contact
        const prof = await api.get("/profile");
        setEmail(prof.data.user.email || "");
        setPhone(prof.data.user.phone || "");
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
        session_id: sessionId,
        fare_source_code: fare.AirItineraryFareInfo.FareSourceCode,
      });
      const isValid =
        rev.data?.data?.AirRevalidateResponse?.AirRevalidateResult?.IsValid;
      if (!isValid) {
        alert("Fare expired. Please search again.");
        return router.push("/search-results");
      }

      // 2) split pax types
      const adults = passengers.filter((p) =>
        ["Mr", "Mrs", "Miss"].includes(p.title)
      );
      const childs = passengers.filter((p) => p.title === "Master");
      const infs = passengers.filter((p) => p.title === "Baby");

      // 3) build booking payload
      const payload = {
        flightBookingInfo: {
          flight_session_id: sessionId,
          fare_source_code: fare.AirItineraryFareInfo.FareSourceCode,
          IsPassportMandatory: needsPassport.toString(),
          areaCode: phone.replace(/\D/g, "").slice(0, 3) || "971",
          countryCode: phone.replace(/\D/g, "").slice(0, 3) || "971",
          fareType: fare.AirItineraryFareInfo.FareType,
        },
        paxInfo: {
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          paxDetails: [
            { adult: pack(adults), child: pack(childs), infant: pack(infs) },
          ],
        },
      };

      // 4) book
      const resp = await api.post("/flights/book", payload);

      // unwrap your helper
      const raw = (resp as any).data ?? resp;
      console.log("Raw booking response:", raw);

      // ---- NEW: first check your { status:'success', data:{ mongoBookingId } } shape ----
      if (
        raw.status === "success" &&
        raw.data &&
        typeof raw.data.mongoBookingId === "string"
      ) {
        // store it if you like:
        localStorage.setItem("bookingId", raw.data.mongoBookingId);
        // then proceed
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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <header className="bg-pink-50 px-6 py-4">
          <h1 className="text-2xl font-bold text-pink-700">
            Booking Details
          </h1>
        </header>
        <main className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
              {error}
              {error.includes("search again") && (
                <button
                  onClick={() => router.push("/search-results")}
                  className="ml-4 text-blue-600 underline"
                >
                  Back to Search
                </button>
              )}
            </div>
          )}

          {/* Contact inputs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Passenger forms */}
          {passengers.map((p, idx) => {
            const base = `pax-${idx}-`;
            return (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold mb-3">Passenger {idx + 1}</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-gray-600">Title</label>
                    <select
                      value={p.title}
                      onChange={(
                        e: React.ChangeEvent<HTMLSelectElement>
                      ) => updatePassenger(idx, "title", e.target.value)}
                      className="mt-1 w-full border rounded px-2 py-1"
                    >
                      {["Mr", "Mrs", "Miss", "Master", "Baby"].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* First Name */}
                  <div>
                    <label className="block text-gray-600">
                      First Name
                    </label>
                    <input
                      value={p.firstName}
                      onChange={(
                        e: React.ChangeEvent<HTMLInputElement>
                      ) => updatePassenger(idx, "firstName", e.target.value)}
                      className={`mt-1 w-full border rounded px-2 py-1 ${
                        fieldErrors[base + "firstName"]
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {/* Last Name */}
                  <div>
                    <label className="block text-gray-600">Last Name</label>
                    <input
                      value={p.lastName}
                      onChange={(
                        e: React.ChangeEvent<HTMLInputElement>
                      ) => updatePassenger(idx, "lastName", e.target.value)}
                      className={`mt-1 w-full border rounded px-2 py-1 ${
                        fieldErrors[base + "lastName"]
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {/* DOB */}
                  <div>
                    <label className="block text-gray-600">DOB</label>
                    <input
                      type="date"
                      value={p.dob}
                      onChange={(
                        e: React.ChangeEvent<HTMLInputElement>
                      ) => updatePassenger(idx, "dob", e.target.value)}
                      className={`mt-1 w-full border rounded px-2 py-1 ${
                        fieldErrors[base + "dob"] ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {/* Nationality */}
                  <div className="md:col-span-2">
                    <label className="block text-gray-600">Nationality</label>
                    <Select
                      options={countryOptions}
                      value={p.nationality}
                      onChange={(val) =>
                        updatePassenger(idx, "nationality", val as CountryOption)
                      }
                      className="mt-1"
                    />
                  </div>

                  {/* Passport fields */}
                  {needsPassport && (
                    <>
                      <div>
                        <label className="block text-gray-600">
                          Passport No.
                        </label>
                        <input
                          value={p.passportNo}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => updatePassenger(idx, "passportNo", e.target.value)}
                          className={`mt-1 w-full border rounded px-2 py-1 ${
                            fieldErrors[base + "passportNo"]
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-600">
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
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600">Issue Date</label>
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
                          className={`mt-1 w-full border rounded px-2 py-1 ${
                            fieldErrors[base + "passportIssueDate"]
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600">
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
                          className={`mt-1 w-full border rounded px-2 py-1 ${
                            fieldErrors[base + "passportExpiryDate"]
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              submitting
                ? "bg-gray-400 cursor-not-allowed text-gray-700"
                : "bg-pink-600 hover:bg-pink-700 text-white"
            }`}
          >
            {submitting ? "Processing…" : "Proceed to Payment"}
          </button>
        </main>
      </div>
    </div>
  );
}
