"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AutoCompleteInput from "./AutoCompleteInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";

export default function FlightSearchWidget() {
  const router = useRouter();
  const [tripType, setTripType] = useState<"OneWay" | "Return">("OneWay");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      setError("Please fill out Origin, Destination, and Departure Date.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        requiredCurrency: "USD",
        journeyType: tripType,
        OriginDestinationInfo: [
          {
            departureDate: departureDate.toISOString().split("T")[0],
            returnDate:
              tripType === "Return" && returnDate
                ? returnDate.toISOString().split("T")[0]
                : undefined,
            airportOriginCode: origin.toUpperCase(),
            airportDestinationCode: destination.toUpperCase(),
          },
        ],
        class: cabinClass,
        airlineCode: "",
        adults,
        childs: children,
        infants,
      };

      const res = await axios.post("http://localhost:5000/api/v1/flights/search", payload);
      localStorage.setItem("searchResults", JSON.stringify(res.data.data));
      router.push("/search-results");
    } catch (err) {
      console.error("Search Error:", err);
      setError("Unable to fetch flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-white/85 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-6 md:p-8 mx-auto"
    >
      <h2 className="text-2xl font-extrabold text-center text-hraDark mb-6">
        ✈️ Find Your Perfect Flight
      </h2>

      {error && (
        <p className="text-red-600 bg-red-50 px-4 py-2 rounded mb-4 text-sm border border-red-200">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Trip Type</label>
          <select
            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
            value={tripType}
            onChange={(e) => setTripType(e.target.value as "OneWay" | "Return")}
          >
            <option value="OneWay">One Way</option>
            <option value="Return">Round Trip</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cabin Class</label>
          <select
            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value)}
          >
            <option value="Economy">Economy</option>
            <option value="PremiumEconomy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
        </div>

        <AutoCompleteInput
          value={origin}
          onChange={setOrigin}
          label="Origin"
          placeholder="City or Airport Code"
        />
        <AutoCompleteInput
          value={destination}
          onChange={setDestination}
          label="Destination"
          placeholder="City or Airport Code"
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Departure Date</label>
          <DatePicker
            selected={departureDate}
            onChange={(date) => setDepartureDate(date)}
            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
            dateFormat="yyyy-MM-dd"
            placeholderText="Select departure date"
          />
        </div>

        {tripType === "Return" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Return Date</label>
            <DatePicker
              selected={returnDate}
              onChange={(date) => setReturnDate(date)}
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select return date"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {[{ label: "Adults", val: adults, set: setAdults, min: 1 },
          { label: "Children", val: children, set: setChildren, min: 0 },
          { label: "Infants", val: infants, set: setInfants, min: 0 }
        ].map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
            <input
              type="number"
              min={field.min}
              value={field.val}
              onChange={(e) => field.set(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <motion.button
          onClick={handleSearch}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600
                    hover:from-pink-700 hover:to-purple-700
                    text-white py-3 text-lg font-semibold rounded-xl
                    transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "🔄 Searching…" : "🔍 Search Flights"}
        </motion.button>
      </div>
    </motion.div>
  );
}
