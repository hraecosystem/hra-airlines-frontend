// components/FlightSearchWidget.tsx
"use client";

import React, { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AutoCompleteInput from "./AutoCompleteInput";
import api from "@/lib/api";
import { toYMD } from "@/utils/date";
import { Plane, Search, Loader2, Calendar, Users } from "lucide-react";

type JourneyType = "OneWay" | "Return" | "Circle";
type CabinClass = "Economy" | "PremiumEconomy" | "Business" | "First";

interface Segment {
  origin: string;
  destination: string;
  date: Date | null;
}

// Ajouter les styles personnalisés pour le calendrier
const calendarStyles = {
  ".react-datepicker": {
    fontFamily: "inherit",
    border: "none",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    overflow: "hidden",
  },
  ".react-datepicker__header": {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    padding: "1rem",
  },
  ".react-datepicker__current-month": {
    color: "#1e40af",
    fontWeight: "600",
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  ".react-datepicker__day-name": {
    color: "#64748b",
    fontWeight: "500",
    width: "2.5rem",
    margin: "0.2rem",
  },
  ".react-datepicker__day": {
    width: "2.5rem",
    height: "2.5rem",
    lineHeight: "2.5rem",
    margin: "0.2rem",
    borderRadius: "0.5rem",
    color: "#1e293b",
    fontWeight: "500",
  },
  ".react-datepicker__day:hover": {
    backgroundColor: "#e0f2fe",
  },
  ".react-datepicker__day--selected": {
    backgroundColor: "#1e40af !important",
    color: "white !important",
  },
  ".react-datepicker__day--keyboard-selected": {
    backgroundColor: "#1e40af !important",
    color: "white !important",
  },
  ".react-datepicker__day--disabled": {
    color: "#cbd5e1",
  },
  ".react-datepicker__navigation": {
    top: "1rem",
  },
  ".react-datepicker__navigation-icon::before": {
    borderColor: "#64748b",
  },
  ".react-datepicker__navigation:hover *::before": {
    borderColor: "#1e40af",
  },
};

// Ajouter les styles globaux
const globalStyles = `
  ${Object.entries(calendarStyles)
    .map(([selector, styles]) => {
      return `${selector} { ${Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join("; ")} }`;
    })
    .join("\n")}
`;

export default function FlightSearchWidget() {
  const router = useRouter();

  const [tripType, setTripType] = useState<JourneyType>("OneWay");
  const [segments, setSegments] = useState<Segment[]>([
    { origin: "", destination: "", date: null },
  ]);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState<CabinClass>("Economy");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = globalStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const updateLeg = (
    idx: number,
    field: keyof Segment,
    value: string | Date | null
  ) => {
    setSegments((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const addLeg = () => {
    if (segments.length < 5) {
      setSegments((prev) => [
        ...prev,
        { origin: "", destination: "", date: null },
      ]);
    }
  };

  const removeLeg = (idx: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1) nuke any old search/book state
    localStorage.removeItem("searchResults");
    localStorage.removeItem("flightSessionId");
    localStorage.removeItem("selectedFare");
    localStorage.removeItem("bookingId");

    // Clear previous selection before saving new search
localStorage.removeItem("selectedFareRT");
localStorage.removeItem("fareSourceCode");
localStorage.removeItem("fareSourceCodeInbound");
localStorage.removeItem("bookingId");

        
    // Basic passenger validation
    if (infants > adults)
      return setError("Each infant must be accompanied by an adult.");
    if (adults + children + infants > 9)
      return setError("You may book up to 9 passengers total.");

    // Build OriginDestinationInfo array
    const OriginDestinationInfo: any[] = [];

    if (tripType === "Circle") {
      if (segments.length < 2)
        return setError("Multi-city trips need at least two legs.");
      for (let i = 0; i < segments.length; i++) {
        const { origin, destination, date } = segments[i];
        if (!origin || !destination || !date)
          return setError(`Please complete leg #${i + 1}.`);
        OriginDestinationInfo.push({
          departureDate: toYMD(date),
          airportOriginCode: origin.toUpperCase(),
          airportDestinationCode: destination.toUpperCase(),
        });
      }
    } else {
      const { origin, destination, date } = segments[0];
      if (!origin || !destination || !date)
        return setError(
          "Origin, destination & departure date are required."
        );
      const leg: any = {
        departureDate: toYMD(date),
        airportOriginCode: origin.toUpperCase(),
        airportDestinationCode: destination.toUpperCase(),
      };
      if (tripType === "Return") {
        if (!returnDate)
          return setError("Return date is required for round-trip.");
        leg.returnDate = toYMD(returnDate);
      }
      OriginDestinationInfo.push(leg);
    }

    // Payload
    const payload = {
      requiredCurrency: "USD",
      journeyType: tripType,
      OriginDestinationInfo,
      class: cabinClass,
      adults,
      childs: children,
      infants,
    };

    setLoading(true);
    try {
      const resp = await api.post("/flights/search", payload);
            /* ────────────────────────────────────────────────────────────
               A)  No-result case  ➜  show a friendly message
               ──────────────────────────────────────────────────────────── */
            if (
              // our backend returns HTTP-404 OR 200 + status:"error"
              resp.status === 404                                  ||
              (resp.data.status === "error" &&
               resp.data.message?.ErrorCode === "FLERSEA022")      ||
              Array.isArray(resp.data.data) && resp.data.data.length === 0
            ) {
              setError("No flights were found for that route / date.");
              return;
            }
      
            /* ────────────────────────────────────────────────────────────
               B)  Normal success – cache & navigate
               ──────────────────────────────────────────────────────────── */
            localStorage.setItem("searchResults", JSON.stringify(resp.data.data));
            localStorage.setItem("searchTimestamp", Date.now().toString());
            router.push("/search-results");
    } catch (err: any) {
            console.error("Flight search error:", err);
      
           /* network / 5xx outage */
            if (err.response?.status === 503) {
              setError(
                "Our flight availability service is temporarily unavailable. " +
                "Please try again in a few minutes."
              );
              return;
            }
      
            /* any other backend-supplied message (string OR object) */
            const raw = err.response?.data?.message;
            if (typeof raw === "string") {
              setError(raw);
            } else if (raw?.ErrorMessage) {
              setError(raw.ErrorMessage);
            } else {
              setError("Unable to search flights. Please check your entries and try again.");
            }
            }  finally {
      setLoading(false);
    }
  };

  // Shared input classes
  const inputClass =
    "w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300 text-sm";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-2xl border border-gray-100"
      aria-busy={loading}
    >
      <h2 className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
        Find Your Perfect Flight <Plane className="inline-block w-6 h-6 ml-2" />
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-red-800 border border-red-200 text-sm space-y-2"
        >
          <p>{error}</p>
           {typeof error === "string" &&
  error.includes("temporarily unavailable") && (            
            <button
              onClick={handleSubmit}
              className="inline-block bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition text-xs font-medium"
            >
              Retry Now
            </button>
          )}
        </motion.div>
      )}

      {/* Trip & Cabin */}
      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <label
            htmlFor="tripType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Trip Type
          </label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="tripType"
              value={tripType}
              onChange={(e) => {
                const v = e.target.value as JourneyType;
                setTripType(v);
                setSegments([{ origin: "", destination: "", date: null }]);
                setReturnDate(null);
              }}
              className={inputClass}
            >
              <option>OneWay</option>
              <option>Return</option>
              <option>Circle</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <label
            htmlFor="cabinClass"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Cabin Class
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <select
              id="cabinClass"
              value={cabinClass}
              onChange={(e) =>
                setCabinClass(e.target.value as CabinClass)
              }
              className={inputClass}
            >
              <option>Economy</option>
              <option>PremiumEconomy</option>
              <option>Business</option>
              <option>First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flight Legs */}
      {tripType === "Circle" ? (
        <div className="h-[180px] overflow-y-auto pr-2 space-y-3">
          {segments.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-3 sm:grid-cols-4 items-end bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 rounded-xl"
            >
              <div className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <AutoCompleteInput
                      label={`Trip ${i + 1} Origin`}
                      value={s.origin}
                      onChange={(v) => updateLeg(i, "origin", v)}
                      placeholder="From"
                      inputClassName={inputClass}
                    />
                    <svg className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                      <path d="M120-120v-80h720v80H120Zm70-200L40-570l96-26 112 94 140-37-207-276 116-31 299 251 170-46q32-9 60.5 7.5T864-585q9 32-7.5 60.5T808-487L190-320Z"/>
                    </svg>
                  </div>
                  <div className="relative">
                    <AutoCompleteInput
                      label={`Trip ${i + 1} Destination`}
                      value={s.destination}
                      onChange={(v) => updateLeg(i, "destination", v)}
                      placeholder="To"
                      inputClassName={inputClass}
                    />
                    <svg className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                      <path d="M120-120v-80h720v80H120Zm622-202L120-499v-291l96 27 48 139 138 39-35-343 115 34 128 369 172 49q25 8 41.5 29t16.5 48q0 35-28.5 61.5T742-322Z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <DatePicker
                    selected={s.date}
                    onChange={(date) => updateLeg(i, "date", date)}
                    dateFormat="MMM d, yyyy"
                    minDate={new Date()}
                    placeholderText="Select date"
                    className={inputClass}
                    calendarClassName="!font-sans"
                    popperClassName="z-50"
                    popperPlacement="bottom-start"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                {segments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLeg(i)}
                    className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                {i === segments.length - 1 && segments.length < 5 && (
                  <button
                    type="button"
                    onClick={addLeg}
                    className="p-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="relative">
            <AutoCompleteInput
              label="From"
              value={segments[0].origin}
              onChange={(v) => updateLeg(0, "origin", v)}
              placeholder="Origin"
              inputClassName={inputClass}
            />
            <svg className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M120-120v-80h720v80H120Zm70-200L40-570l96-26 112 94 140-37-207-276 116-31 299 251 170-46q32-9 60.5 7.5T864-585q9 32-7.5 60.5T808-487L190-320Z"/>
            </svg>
          </div>
          <div className="relative">
            <AutoCompleteInput
              label="To"
              value={segments[0].destination}
              onChange={(v) => updateLeg(0, "destination", v)}
              placeholder="Destination"
              inputClassName={inputClass}
            />
            <svg className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M120-120v-80h720v80H120Zm622-202L120-499v-291l96 27 48 139 138 39-35-343 115 34 128 369 172 49q25 8 41.5 29t16.5 48q0 35-28.5 61.5T742-322Z"/>
            </svg>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <DatePicker
                selected={segments[0].date}
                onChange={(date) => updateLeg(0, "date", date)}
                dateFormat="MMM d, yyyy"
                minDate={new Date()}
                placeholderText="Select date"
                className={inputClass}
                calendarClassName="!font-sans"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>
          </div>
        </div>
      )}

      {/* Return Date */}
      {tripType === "Return" && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Return Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <DatePicker
              selected={returnDate}
              onChange={setReturnDate}
              dateFormat="MMM d, yyyy"
              minDate={segments[0].date || new Date()}
              placeholderText="Select return date"
              className={inputClass}
              calendarClassName="!font-sans"
              popperClassName="z-50"
              popperPlacement="bottom-start"
            />
          </div>
        </div>
      )}

      {/* Passengers */}
      <div className="grid grid-cols-3 gap-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adults
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className={inputClass}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Children
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className={inputClass}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Infants
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <select
              value={infants}
              onChange={(e) => setInfants(Number(e.target.value))}
              className={inputClass}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search Flights
          </>
        )}
      </button>
    </motion.form>
  );
}
