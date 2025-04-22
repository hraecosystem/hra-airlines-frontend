// app/search-results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FiltersSidebar from "@/components/common/FiltersSidebar";
import Pagination from "@/components/common/Pagination";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FareItinerary {
  AirItineraryFareInfo: {
    SessionId?: string;                       // 👈 Trawex actually returns this
    FareSourceCode: string;
    FareType: string;
    IsRefundable: boolean;
    ItinTotalFares: {
      TotalFare: { Amount: string; CurrencyCode: string };
    };
    FareBreakdown: Array<{
      PassengerTypeQuantity: { Code: string; Quantity: number };
      PassengerFare: { TotalFare: { Amount: string } };
      Baggage?: string[];
      CabinBaggage?: string[];
      MealInfo?: string[];
    }>;
  };
  OriginDestinationOptions: Array<{
    TotalStops: number;
    OriginDestinationOption: Array<{
      FlightSegment: {
        DepartureAirportLocationCode: string;
        ArrivalAirportLocationCode: string;
        DepartureDateTime: string;
        ArrivalDateTime: string;
        MarketingAirlineCode: string;
        MarketingAirlineName?: string;
        FlightNumber: string;
        Equipment?: { AirEquipType: string };
        JourneyDuration: number;
        CabinClassCode: string;
        CabinClassText?: string;
        Eticket: boolean;
        OperatingAirline: { Code: string; Name: string };
      };
      ResBookDesigCode?: string;
      ResBookDesigText?: string;
      SeatsRemaining: { Number: number };
      StopQuantity: number;
    }>;
  }>;
  DirectionInd: string;
}

const ITEMS_PER_PAGE = 10;

export default function SearchResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // 1) load
  useEffect(() => {
    try {
      const raw = localStorage.getItem("searchResults");
      if (!raw) throw new Error("No search results found.");
      const data = JSON.parse(raw);
      const itineraries =
        data?.AirSearchResponse?.AirSearchResult?.FareItineraries?.map(
          (x: any) => x.FareItinerary
        ) ?? [];
      setResults(itineraries);
      setFiltered(itineraries);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2) filters
  useEffect(() => {
    let temp = [...results];
    if (filters.airline) {
      temp = temp.filter((f) =>
        f.OriginDestinationOptions.some((opt) =>
          opt.OriginDestinationOption.some((seg) =>
            seg.FlightSegment.MarketingAirlineCode.includes(filters.airline)
          )
        )
      );
    }
    if (filters.stops !== "all") {
      const st = parseInt(filters.stops);
      temp = temp.filter((f) => f.OriginDestinationOptions[0].TotalStops === st);
    }
    if (filters.baggage.length) {
      temp = temp.filter((f) =>
        f.AirItineraryFareInfo.FareBreakdown.some((br) =>
          filters.baggage.every((b) => br.Baggage?.includes(b))
        )
      );
    }
    if (filters.meals.length) {
      temp = temp.filter((f) =>
        f.AirItineraryFareInfo.FareBreakdown.some((br) =>
          filters.meals.every((m) => br.MealInfo?.includes(m))
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
      const fa = parseFloat(a.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount);
      const fb = parseFloat(b.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount);
      return filters.sortBy === "price" ? fa - fb : fb - fa;
    });
    setCurrentPage(1);
    setFiltered(temp);
  }, [filters, results]);

  const handleSelectFlight = (fare: FareItinerary) => {
    // store the fare for booking page
    localStorage.setItem("selectedFare", JSON.stringify(fare));

    // try to pull SessionId straight off the fare
    let sessionId = fare.AirItineraryFareInfo.SessionId || "";

    // fallback: maybe it was stored at the root of your original payload
    if (!sessionId) {
      const raw = localStorage.getItem("searchResults");
      if (raw) {
        const obj = JSON.parse(raw);
        sessionId =
          obj.session_id ||
          obj.SessionId ||
          obj.data?.session_id ||
          obj.AirSearchResponse?.session_id ||
          obj.AirSearchResponse?.SessionId ||
          "";
      }
    }

    if (!sessionId) {
      alert("⚠️ Could not find a valid session_id. Please search again.");
      return router.push("/");
    }

    localStorage.setItem("flightSessionId", sessionId);
    router.push("/booking");
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (message) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-600">
        <p className="mb-4 text-xl">😕 {message}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
        >
          Back to Search
        </button>
      </div>
    );
  }

   return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <FiltersSidebar
        filters={filters}
        setFilters={setFilters}
        airlineOptions={["AI", "6E", "EK", "QF", "QR", "SV", "UL", "BA", "LH", "AF"]}
      />

      <div className="lg:col-span-3 space-y-8">
        <h2 className="text-3xl font-bold text-gray-800">Search Results</h2>

        {currentItems.map((fare, idx) => {
          const totalFare = fare.AirItineraryFareInfo.ItinTotalFares.TotalFare;
          const seg =
            fare.OriginDestinationOptions[0].OriginDestinationOption[0].FlightSegment;

          return (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-purple-600">
                    {seg.MarketingAirlineName || seg.MarketingAirlineCode} #
                    {seg.FlightNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {fare.DirectionInd} •{" "}
                    {fare.OriginDestinationOptions[0].TotalStops} stop(s)
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {totalFare.Amount} {totalFare.CurrencyCode}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-gray-700">
                <div>
                  <strong>{seg.DepartureAirportLocationCode}</strong> →{" "}
                  <strong>{seg.ArrivalAirportLocationCode}</strong>
                </div>
                <div>
                  {formatTime(seg.DepartureDateTime)} –{" "}
                  {formatTime(seg.ArrivalDateTime)}
                </div>
                <div>Duration: {seg.JourneyDuration} mins</div>
                <div>Cabin: {seg.CabinClassCode}</div>
              </div>

              <button
                onClick={() =>
                  setExpandedIdx(idx === expandedIdx ? null : idx)
                }
                className="flex items-center text-purple-600 font-medium mb-4"
              >
                {expandedIdx === idx ? "Hide Details" : "View Details"}{" "}
                {expandedIdx === idx ? (
                  <ChevronUp className="ml-1 w-5 h-5" />
                ) : (
                  <ChevronDown className="ml-1 w-5 h-5" />
                )}
              </button>

              {expandedIdx === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 mb-6 text-sm text-gray-600"
                >
                  {fare.AirItineraryFareInfo.FareBreakdown.map((br, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <p>
                        <strong>{br.PassengerTypeQuantity.Code}</strong> x{" "}
                        {br.PassengerTypeQuantity.Quantity} —{" "}
                        {br.PassengerFare.TotalFare.Amount} USD
                      </p>
                      <p>
                        Baggage: {br.Baggage?.join(", ") || "—"} / Cabin:{" "}
                        {br.CabinBaggage?.join(", ") || "—"}
                      </p>
                      <p>Meal: {br.MealInfo?.join(", ") || "Standard"}</p>
                    </div>
                  ))}

                  <ul className="space-y-1">
                    <li>
                      <strong>Fare Type:</strong>{" "}
                      {fare.AirItineraryFareInfo.FareType}
                    </li>
                    <li>
                      <strong>Refundable:</strong>{" "}
                      {fare.AirItineraryFareInfo.IsRefundable ? "Yes" : "No"}
                    </li>
                    <li>
                      <strong>Validating Airline:</strong>{" "}
                      {seg.OperatingAirline.Code}
                    </li>
                    <li>
                      <strong>Seats Remaining:</strong>{" "}
                      {
                        fare.OriginDestinationOptions[0]
                          .OriginDestinationOption[0].SeatsRemaining.Number
                      }
                    </li>
                    <li>
                      <strong>Booking Class:</strong>{" "}
                      {fare.OriginDestinationOptions[0]
                        .OriginDestinationOption[0].ResBookDesigText ||
                        fare.OriginDestinationOptions[0]
                          .OriginDestinationOption[0].ResBookDesigCode ||
                        "—"}
                    </li>
                  </ul>
                </motion.div>
              )}

<button
                onClick={() => handleSelectFlight(fare)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition"
              >
                Select Flight
              </button>
            </motion.div>
          );
        })}

        {filtered.length > ITEMS_PER_PAGE && (
          <div className="mt-8">
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