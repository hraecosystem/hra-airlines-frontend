// components/FlightSearchWidget.tsx
"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AutoCompleteInput from "./AutoCompleteInput";
import api from "@/lib/api";
import { toYMD } from "@/utils/date";
import { Plane, Search, Loader2 } from "lucide-react";

type JourneyType = "OneWay" | "Return" | "Circle";
type CabinClass = "Economy" | "PremiumEconomy" | "Business" | "First";

interface Segment {
  origin: string;
  destination: string;
  date: Date | null;
}

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
      localStorage.setItem(
        "searchResults",
        JSON.stringify(resp.data.data)
      );
      localStorage.setItem("searchTimestamp", Date.now().toString());

      router.push("/search-results");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.ErrorMessage ||
          "Unable to search flights. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Shared input classes
  const inputClass =
    "w-full px-2 py-1.5 sm:px-4 sm:py-3 border border-gray-200 bg-white text-gray-800 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300 text-sm sm:text-base";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-4xl space-y-2 sm:space-y-8 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-sm p-2 sm:p-8 shadow-xl border border-gray-100"
      aria-busy={loading}
    >
      <h2 className="text-center text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-8">
        Find Your Perfect Flight <Plane className="inline-block w-5 h-5 sm:w-8 sm:h-8 ml-1 sm:ml-2" />
      </h2>

      {error && (
        <div
          role="alert"
          className="rounded-lg sm:rounded-xl bg-red-50 px-3 sm:px-6 py-2 sm:py-4 text-red-800 border border-red-200 text-xs sm:text-sm"
        >
          {error}
        </div>
      )}

      {/* Trip & Cabin */}
      <div className="grid grid-cols-2 gap-2 sm:gap-6">
        <div>
          <label
            htmlFor="tripType"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-2"
          >
            Trip Type
          </label>
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
        <div>
          <label
            htmlFor="cabinClass"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-2"
          >
            Cabin Class
          </label>
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

      {/* Flight Legs */}
      {tripType === "Circle" ? (
        <div className="h-[200px] overflow-y-auto pr-1 space-y-1">
          {segments.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-1 sm:grid-cols-4 items-end bg-gray-50/50 p-1 sm:p-3 rounded-lg"
            >
              <div className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-1">
                  <AutoCompleteInput
                    label={`Trip ${i + 1} Origin`}
                    value={s.origin}
                    onChange={(v) => updateLeg(i, "origin", v)}
                    inputClassName={inputClass}
                  />
                  <AutoCompleteInput
                    label={`Trip ${i + 1} Destination`}
                    value={s.destination}
                    onChange={(v) => updateLeg(i, "destination", v)}
                    inputClassName={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Date
                </label>
                <DatePicker
                  selected={s.date}
                  onChange={(d) => updateLeg(i, "date", d)}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  placeholderText="YYYY-MM-DD"
                  className={inputClass}
                />
              </div>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => removeLeg(i)}
                  aria-label={`Remove leg ${i + 1}`}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {segments.length < 5 && (
            <button
              type="button"
              onClick={addLeg}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline text-xs sticky bottom-0 bg-white/95 backdrop-blur-sm py-1 w-full justify-center"
            >
              <span className="text-base">+</span> Add another Trip
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:gap-6">
            <AutoCompleteInput
              label="Origin"
              value={segments[0].origin}
              onChange={(v) => updateLeg(0, "origin", v)}
              inputClassName={inputClass}
            />
            <AutoCompleteInput
              label="Destination"
              value={segments[0].destination}
              onChange={(v) => updateLeg(0, "destination", v)}
              inputClassName={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-2">
                Departure Date
              </label>
              <DatePicker
                selected={segments[0].date}
                onChange={(d) => updateLeg(0, "date", d)}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                placeholderText="YYYY-MM-DD"
                className={inputClass}
                required
              />
            </div>
            {tripType === "Return" && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-2">
                  Return Date
                </label>
                <DatePicker
                  selected={returnDate}
                  onChange={setReturnDate}
                  dateFormat="yyyy-MM-dd"
                  minDate={segments[0].date || new Date()}
                  placeholderText="YYYY-MM-DD"
                  className={inputClass}
                  required
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Passengers */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 bg-gray-50/50 p-2 sm:p-6 rounded-lg sm:rounded-xl">
        {[
          {
            id: "adults",
            label: "Adults",
            val: adults,
            fn: setAdults,
            min: 1,
          },
          {
            id: "children",
            label: "Children",
            val: children,
            fn: setChildren,
            min: 0,
          },
          {
            id: "infants",
            label: "Infants",
            val: infants,
            fn: setInfants,
            min: 0,
          },
        ].map(({ id, label, val, fn, min }) => (
          <div key={id}>
            <label
              htmlFor={id}
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-2"
            >
              {label}
            </label>
            <input
              id={id}
              type="number"
              min={min}
              max={9}
              value={val}
              onChange={(e) => fn(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        className={`w-full rounded-lg sm:rounded-xl py-2 sm:py-4 text-white font-semibold text-sm sm:text-lg transition-all duration-200 ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl"
        }`}
      >
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-5 sm:h-5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-3 h-3 sm:w-5 sm:h-5" />
              <span>Search Flights</span>
            </>
          )}
        </div>
      </motion.button>
    </motion.form>
  );
}
