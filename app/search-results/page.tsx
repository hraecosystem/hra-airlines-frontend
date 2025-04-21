"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FiltersSidebar from "@/components/common/FiltersSidebar";
import Pagination from "@/components/common/Pagination";
import { ChevronDown } from "lucide-react";

interface FareItinerary {
  AirItineraryFareInfo: any;
  OriginDestinationOptions: any[];
  DirectionInd: string;
}

const ITEMS_PER_PAGE = 10;

export default function SearchResultsPage() {
  const router = useRouter();

  // UI state
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Data & filtration
  const [results, setResults] = useState<FareItinerary[]>([]);
  const [filtered, setFiltered] = useState<FareItinerary[]>([]);
  const [filters, setFilters] = useState({
    airline: "",
    stops: "all",
    sortBy: "price",
    meals: [] as string[],
    baggage: [] as string[],
    price: [0, 2000] as [number, number],
  });

  // Pagination + expand detail
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // 1️⃣ Hydrate from localStorage
  useEffect(() => {
    setLoading(true);
    try {
      const raw = localStorage.getItem("searchResults");
      if (!raw) {
        setMessage("No search results found. Please run a flight search first.");
        setResults([]);
        setFiltered([]);
        return;
      }
      const parsed = JSON.parse(raw);
      const itineraries: FareItinerary[] =
        parsed?.AirSearchResponse?.AirSearchResult?.FareItineraries?.map(
          (x: any) => x.FareItinerary
        ) ?? [];

      setResults(itineraries);
      setFiltered(itineraries);
    } catch {
      setMessage("Failed to load search results.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2️⃣ Re‑apply filters & sorting whenever filters or results change
  useEffect(() => {
    let temp = [...results];

    if (filters.airline) {
      temp = temp.filter((f) =>
        f.OriginDestinationOptions[0]?.OriginDestinationOption[0]?.FlightSegment
          ?.MarketingAirlineCode?.includes(filters.airline)
      );
    }

    if (filters.stops !== "all") {
      const stopCount = parseInt(filters.stops);
      temp = temp.filter(
        (f) => f.OriginDestinationOptions[0]?.TotalStops === stopCount
      );
    }

    if (filters.baggage.length) {
      temp = temp.filter((f) =>
        filters.baggage.some((b) =>
          f.AirItineraryFareInfo.FareBreakdown.some((br: any) =>
            (br.Baggage || []).includes(b)
          )
        )
      );
    }

    if (filters.meals.length) {
      temp = temp.filter((f) =>
        filters.meals.some((m) =>
          f.AirItineraryFareInfo.FareBreakdown.some((br: any) =>
            (br.MealInfo || []).includes(m)
          )
        )
      );
    }

    temp = temp.filter((f) => {
      const fare = parseFloat(
        f.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount
      );
      return fare >= filters.price[0] && fare <= filters.price[1];
    });

    temp.sort((a, b) => {
      const fa = parseFloat(
        a.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount
      );
      const fb = parseFloat(
        b.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount
      );
      return filters.sortBy === "price" ? fa - fb : fb - fa;
    });

    setCurrentPage(1);
    setFiltered(temp);
  }, [filters, results]);

  // 3️⃣ Handler for selecting flight → persist & navigate
  const handleSelectFlight = (fare: FareItinerary) => {
    localStorage.setItem("selectedFare", JSON.stringify(fare));
    router.push("/booking");
  };

  // Utilities
  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <FiltersSidebar
        filters={filters}
        setFilters={setFilters}
        airlineOptions={["AI","6E","EK","QF","QR","SV","UL","BA","LH","AF"]}
      />

      <div className="lg:col-span-3 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Search Results
        </h2>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="mb-4 text-xl">😕 No flights match your criteria.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
            >
              🔍 Back to Search
            </button>
          </div>
        )}

        {/* Results */}
        {!loading &&
          currentItems.map((fare, idx) => {
            const totalFare =
              fare.AirItineraryFareInfo.ItinTotalFares.TotalFare;
            const seg =
              fare.OriginDestinationOptions[0].OriginDestinationOption[0]
                .FlightSegment;

            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-pink-600">
                    {seg.MarketingAirlineCode} #{seg.FlightNumber}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {fare.DirectionInd} •{" "}
                    {fare.OriginDestinationOptions[0].TotalStops} stop(s)
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                  <div>
                    <strong>{seg.DepartureAirportLocationCode}</strong> →{" "}
                    <strong>{seg.ArrivalAirportLocationCode}</strong>
                  </div>
                  <div>
                    {formatTime(seg.DepartureDateTime)} –{" "}
                    {formatTime(seg.ArrivalDateTime)}
                  </div>
                  <div>Duration: {seg.JourneyDuration} mins</div>
                  <div>Aircraft: {seg.Equipment?.AirEquipType || "—"}</div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {totalFare.Amount} {totalFare.CurrencyCode}
                  </p>
                 <button
                    onClick={() =>
                      setExpandedIdx(idx === expandedIdx ? null : idx)
                    }
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    Details <ChevronDown className="ml-1 w-4 h-4" />
                  </button>
                </div>

                {expandedIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 text-gray-600 border-t pt-3 space-y-2 text-sm"
                  >
                    {fare.AirItineraryFareInfo.FareBreakdown.map(
                      (br: any, i: number) => (
                        <div key={i}>
                          <p>
                            <strong>{br.PassengerTypeQuantity.Code}</strong> x{" "}
                            {br.PassengerTypeQuantity.Quantity} —{" "}
                            {br.PassengerFare.TotalFare.Amount} USD
                          </p>
                          <p>Baggage: {br.Baggage?.join(", ") || "—"}</p>
                          <p>Meal: {br.MealInfo?.join(", ") || "Standard"}</p>
                        </div>
                      )
                    )}
                  </motion.div>
                )}

                <button
                  onClick={() => handleSelectFlight(fare)}
                  className="mt-5 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition"
                >
                  Select Flight
                </button>
              </motion.div>
            );
          })}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
