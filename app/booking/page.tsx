"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login?redirect=/booking");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    (async () => {
      try {
        const rawFare = localStorage.getItem("selectedFare");
        const rawSession = localStorage.getItem("flightSessionId");
        if (!rawFare || !rawSession) throw new Error("No flight selected.");

        setSessionId(rawSession);
        const { data } = await api.post("/flights/revalidate", {
          session_id: rawSession,
          fare_source_code: JSON.parse(rawFare).AirItineraryFareInfo.FareSourceCode,
        });

        const result = data.data.AirRevalidateResponse.AirRevalidateResult;
        if (!result.IsValid) throw new Error("Fare no longer valid.");

        const itinArr = result.FareItineraries.FareItinerary;
        const itin = Array.isArray(itinArr) ? itinArr[0] : itinArr;
        if (!itin) throw new Error("Invalid itinerary.");

        setFare(itin);
        setNeedsPassport(Boolean(result.IsPassportMandatory));

        const qty = (code: string) =>
          itin.AirItineraryFareInfo.FareBreakdown.find(
            (b: any) => b.PassengerTypeQuantity.Code === code
          )?.PassengerTypeQuantity.Quantity || 0;

        setPassengers([
          ...Array(qty("ADT")).fill(null).map(() => makePassenger("Mr")),
          ...Array(qty("CHD")).fill(null).map(() => makePassenger("Master")),
          ...Array(qty("INF")).fill(null).map(() => makePassenger("Baby")),
        ]);

        const prof = await api.get("/profile");
        setEmail(prof.data.user.email || "");
        setPhone(prof.data.user.phone || "");
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();

    const timer = setTimeout(() => {
      alert("⏰ Session expired. Please select your flight again.");
      router.push("/search-results");
    }, 15 * 60 * 1000);

    return () => clearTimeout(timer);
  }, []);

  const updatePassenger = <K extends keyof Passenger>(idx: number, key: K, value: Passenger[K]) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      if (key === "nationality" && needsPassport && !next[idx].passportIssueCountry) {
        next[idx].passportIssueCountry = value as CountryOption;
      }
      return next;
    });
  };

  const validate = () => {
    const errs: Record<string, boolean> = {};
    let ok = true;

    if (!email.trim() || !phone.trim()) {
      setError("Email and phone are required.");
      ok = false;
    }

    passengers.forEach((p, i) => {
      const prefix = `pax-${i}-`;
      if (!p.firstName) errs[prefix + "firstName"] = true, ok = false;
      if (!p.lastName) errs[prefix + "lastName"] = true, ok = false;
      if (!p.dob) errs[prefix + "dob"] = true, ok = false;
      if (!p.nationality) errs[prefix + "nationality"] = true, ok = false;

      if (needsPassport) {
        if (!p.passportNo) errs[prefix + "passportNo"] = true, ok = false;
        if (!p.passportIssueCountry) errs[prefix + "passportIssueCountry"] = true, ok = false;
        if (!p.passportIssueDate) errs[prefix + "passportIssueDate"] = true, ok = false;
        if (!p.passportExpiryDate) errs[prefix + "passportExpiryDate"] = true, ok = false;
      }
    });

    setFieldErrors(errs);
    if (!ok) setError("Please fix the highlighted fields.");
    return ok;
  };

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

  const handleSubmit = async () => {
    setError("");
    if (!validate() || !fare) return;
    setSubmitting(true);

    try {
      const reval = await api.post("/flights/revalidate", {
        session_id: sessionId,
        fare_source_code: fare.AirItineraryFareInfo.FareSourceCode,
      });

      const valid = reval.data.data.AirRevalidateResponse.AirRevalidateResult.IsValid;
      if (!valid) throw new Error("Fare has expired. Please select again.");

      const adults = passengers.filter((p) => ["Mr", "Mrs", "Miss"].includes(p.title));
      const children = passengers.filter((p) => p.title === "Master");
      const infants = passengers.filter((p) => p.title === "Baby");

      const payload = {
        flightBookingInfo: {
          flight_session_id: sessionId,
          fare_source_code: fare.AirItineraryFareInfo.FareSourceCode,
          fareTotalAmount: fare.TotalFare?.TotalAmount || 0,
          currency: fare.TotalFare?.Currency || "USD",
          IsPassportMandatory: needsPassport ? "true" : "false",
          countryCode: phone.replace(/\D/g, "").slice(0, 3) || "971",
          fareType: fare.AirItineraryFareInfo.FareType,
        },
        paxInfo: {
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          paxDetails: [{
            adult: adults.length ? pack(adults) : pack([]),
            child: children.length ? pack(children) : pack([]),
            infant: infants.length ? pack(infants) : pack([]),
          }],
        },
      };

      await api.post("/flights/book", payload);
      router.push("/payment");
    } catch (e: any) {
      const msg = e.response?.data?.error?.ErrorMessage || e.message || "Booking failed.";
      if (msg.toLowerCase().includes("fare")) {
        router.push("/search-results");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <header className="bg-pink-50 px-6 py-4">
          <h1 className="text-2xl font-bold text-pink-700">Booking Details</h1>
        </header>
        <main className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <span className="text-gray-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border rounded p-2"
              />
            </label>
            <label>
              <span className="text-gray-700">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full border rounded p-2"
              />
            </label>
          </div>

          {passengers.map((p, idx) => {
            const prefix = `pax-${idx}-`;
            return (
              <section key={idx} className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold mb-3">Passenger {idx + 1}</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <label>
                    <span className="text-gray-600">Title</span>
                    <select
                      value={p.title}
                      onChange={(e) => updatePassenger(idx, "title", e.target.value)}
                      className="border rounded p-2 w-full"
                    >
                      {["Mr", "Mrs", "Miss", "Master", "Baby"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-gray-600">First Name</span>
                    <input
                      value={p.firstName}
                      onChange={(e) => updatePassenger(idx, "firstName", e.target.value)}
                      className={`border rounded p-2 w-full ${fieldErrors[prefix + "firstName"] && "border-red-500"}`}
                    />
                  </label>

                  <label>
                    <span className="text-gray-600">Last Name</span>
                    <input
                      value={p.lastName}
                      onChange={(e) => updatePassenger(idx, "lastName", e.target.value)}
                      className={`border rounded p-2 w-full ${fieldErrors[prefix + "lastName"] && "border-red-500"}`}
                    />
                  </label>

                  <label>
                    <span className="text-gray-600">Date of Birth</span>
                    <input
                      type="date"
                      value={p.dob}
                      onChange={(e) => updatePassenger(idx, "dob", e.target.value)}
                      className={`border rounded p-2 w-full ${fieldErrors[prefix + "dob"] && "border-red-500"}`}
                    />
                  </label>

                  <div className="md:col-span-2">
                    <span className="text-gray-600">Nationality</span>
                    <Select
                      options={countryOptions}
                      value={p.nationality}
                      onChange={(val) => updatePassenger(idx, "nationality", val as CountryOption)}
                      classNamePrefix="react-select"
                      placeholder="Select nationality"
                    />
                  </div>

                  {needsPassport && (
                    <>
                      <label>
                        <span className="text-gray-600">Passport Number</span>
                        <input
                          value={p.passportNo}
                          onChange={(e) => updatePassenger(idx, "passportNo", e.target.value)}
                          className={`border rounded p-2 w-full ${fieldErrors[prefix + "passportNo"] && "border-red-500"}`}
                        />
                      </label>

                      <div className="md:col-span-2">
                        <span className="text-gray-600">Passport Issue Country</span>
                        <Select
                          options={countryOptions}
                          value={p.passportIssueCountry}
                          onChange={(val) => updatePassenger(idx, "passportIssueCountry", val as CountryOption)}
                          classNamePrefix="react-select"
                          placeholder="Select country"
                        />
                      </div>

                      <label>
                        <span className="text-gray-600">Issue Date</span>
                        <input
                          type="date"
                          value={p.passportIssueDate}
                          onChange={(e) => updatePassenger(idx, "passportIssueDate", e.target.value)}
                          className={`border rounded p-2 w-full ${fieldErrors[prefix + "passportIssueDate"] && "border-red-500"}`}
                        />
                      </label>

                      <label>
                        <span className="text-gray-600">Expiry Date</span>
                        <input
                          type="date"
                          value={p.passportExpiryDate}
                          onChange={(e) => updatePassenger(idx, "passportExpiryDate", e.target.value)}
                          className={`border rounded p-2 w-full ${fieldErrors[prefix + "passportExpiryDate"] && "border-red-500"}`}
                        />
                      </label>
                    </>
                  )}
                </div>
              </section>
            );
          })}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {submitting ? "Processing…" : "Proceed to Payment"}
          </button>
        </main>
      </div>
    </div>
  );
}
