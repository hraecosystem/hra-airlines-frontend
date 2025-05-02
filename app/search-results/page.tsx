// app/search-results/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FiltersSidebar from "@/components/common/FiltersSidebar";
import Pagination from "@/components/common/Pagination";
import { ChevronDown, ChevronUp } from "lucide-react";
import numeral from "numeral";

interface FlightSegment {
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
  OperatingAirline: { Code: string; Name: string; Equipment?: string; FlightNumber?: string };
}

interface OriginDestinationOption {
  TotalStops: number;
  OriginDestinationOption: Array<{
    FlightSegment: FlightSegment;
    ResBookDesigCode?: string;
    ResBookDesigText?: string;
    SeatsRemaining: { Number: number; BelowMinimum?: boolean };
    StopQuantity: number;
    StopQuantityInfo?: any;
  }>;
}

interface PenaltyDetail {
  Currency: string;
  RefundAllowed: boolean;
  RefundPenaltyAmount: string;
  ChangeAllowed: boolean;
  ChangePenaltyAmount: string;
}

interface FareBreakdown {
  PassengerTypeQuantity: { Code: string; Quantity: number };
  PassengerFare: {
    BaseFare: { Amount: string; CurrencyCode: string };
    EquivFare: { Amount: string; CurrencyCode: string };
    ServiceTax: { Amount: string; CurrencyCode: string };
    Surcharges?: { Amount: string; CurrencyCode: string };
    Taxes?: Array<{ TaxCode: string; Amount: string; CurrencyCode: string }>;
    TotalFare: { Amount: string; CurrencyCode: string };
  };
  Baggage?: string[];
  CabinBaggage?: string[];
  MealInfo?: string[];
  PenaltyDetails?: PenaltyDetail[];
}

interface ItinTotalFares {
  BaseFare: { Amount: string; CurrencyCode: string };
  EquivFare: { Amount: string; CurrencyCode: string };
  ServiceTax: { Amount: string; CurrencyCode: string };
  TotalTax: { Amount: string; CurrencyCode: string };
  TotalFare: { Amount: string; CurrencyCode: string };
}

interface AirItineraryFareInfo {
  DivideInPartyIndicator: boolean;
  FareSourceCode: string;
  FareType: string;
  IsRefundable: boolean;
  ItinTotalFares: ItinTotalFares;
  FareBreakdown: FareBreakdown[];
  SplitItinerary?: boolean;
}

interface FareItinerary {
  DirectionInd: string;
  TicketType?: string;
  IsPassportMandatory?: boolean;
  SequenceNumber?: string;
  ValidatingAirlineCode?: string;
  OriginDestinationOptions: OriginDestinationOption[];
  AirItineraryFareInfo: AirItineraryFareInfo;
}



type Filters = {
  airline: string;
  stops: "all" | "0" | "1" | "2+";
  sortBy: "price-asc" | "price-desc";
  meals: string[];
  baggage: string[];
  priceRange: [number, number];
};

const ITEMS_PER_PAGE = 10;
const DEFAULT_PRICE_RANGE: [number, number] = [0, 200000];

export default function SearchResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  type FI = FareItinerary;  // simple alias is still handy

  const [allItins, setAllItins] = useState<FI[]>([]);
  const [filtered, setFiltered] = useState<FI[]>([]);
  
  const [masterSid, setMasterSid] = useState<string>("");   // ← NEW

  const [filters, setFilters] = useState<Filters>({
    airline: "",
    stops: "all",
    sortBy: "price-asc",
    meals: [],
    baggage: [],
    priceRange: DEFAULT_PRICE_RANGE,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);


  
  // 1) Load raw payload & extract FareItineraries
  useEffect(() => {
    try {
      const raw = localStorage.getItem("searchResults");
      if (!raw) throw new Error("No search results found. Please search again.");
      const obj = JSON.parse(raw);

/* 1️⃣ grab the search-level SessionId once */
 const sid =
   obj.AirSearchResponse?.session_id ??                // ♦ correct path
   obj.AirSearchResponse?.AirSearchResult?.SessionId ??// (fallback)
   obj.session_id ??                                   // (old fallback)
   "";
setMasterSid(sid);



if (sid) {
    localStorage.setItem("flightSessionId", sid);
  }

      /* 2️⃣  normalise itineraries */
      const rawFi  = obj.AirSearchResponse?.AirSearchResult?.FareItineraries;
      const itins: FI[] = Array.isArray(rawFi)
        ? rawFi.map((w: any) => w.FareItinerary)
        : [rawFi.FareItinerary];

      setAllItins(itins);
      setFiltered(itins);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  

  // 2) Apply filters & sorting whenever filters or allItins change
  useEffect(() => {
    let tmp = [...allItins];

    // airline filter
    if (filters.airline) {
      tmp = tmp.filter((fi) =>
        fi.OriginDestinationOptions.some((odo) =>
          odo.OriginDestinationOption.some(
            (seg) =>
              seg.FlightSegment.MarketingAirlineCode === filters.airline
          )
        )
      );
    }

    // stops filter
    if (filters.stops !== "all") {
      tmp = tmp.filter(
        (fi) => odoTotalStops(fi) === parseStops(filters.stops)
      );
    }

    // baggage
    if (filters.baggage.length) {
      tmp = tmp.filter((fi) =>
        fi.AirItineraryFareInfo.FareBreakdown.some(
          (br) =>
            Array.isArray(br.Baggage) &&
            filters.baggage.every((b) => br.Baggage!.includes(b))
        )
      );
    }

    // meals
    if (filters.meals.length) {
      tmp = tmp.filter((fi) =>
        fi.AirItineraryFareInfo.FareBreakdown.some(
          (br) =>
            Array.isArray(br.MealInfo) &&
            filters.meals.every((m) => br.MealInfo!.includes(m))
        )
      );
    }

    // priceRange
    tmp = tmp.filter((fi) => {
      const amt = parseFloat(
        fi.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount
      );
      return amt >= filters.priceRange[0] && amt <= filters.priceRange[1];
    });

    // sorting
    tmp.sort((a, b) => {
      const pa = parseFloat(a.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount);
      const pb = parseFloat(b.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount);
      return filters.sortBy === "price-asc" ? pa - pb : pb - pa;
    });

    setCurrentPage(1);
    setFiltered(tmp);
  }, [filters, allItins]);

  // Helpers
  const parseStops = (s: Filters["stops"]) =>
    s === "0" ? 0 : s === "1" ? 1 : 2;
  const odoTotalStops = (fi: FareItinerary) =>
    fi.OriginDestinationOptions[0].TotalStops;
  const formatMoney = (amt: string, cur: string) =>
    `${numeral(amt).format("0,0.00")} ${cur}`;
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const handleSelect = (fi: FareItinerary) => {
      /* ──────────────────────────────────────────────────────────────
       *  Clean the fare before persisting:
       *    – remove passenger-types whose Quantity === 0
       *    – coerce IsPassportMandatory to a real boolean
       * ────────────────────────────────────────────────────────────── */
      const cleaned: FareItinerary = {
        ...fi,
        IsPassportMandatory:
          fi.IsPassportMandatory === true ||
          String(fi.IsPassportMandatory).toLowerCase() === "true",
        AirItineraryFareInfo: {
          ...fi.AirItineraryFareInfo,
          FareBreakdown: fi.AirItineraryFareInfo.FareBreakdown.filter(
            (br) => br.PassengerTypeQuantity.Quantity > 0
          ),
        },
      };

      localStorage.setItem("selectedFare", JSON.stringify(cleaned));

        // Always pull the already-saved value from localStorage
        const sid = localStorage.getItem("flightSessionId") || "";
        if (!sid) return alert("SessionId missing in search payload – please search again.");

const fareSource = fi.AirItineraryFareInfo.FareSourceCode;
      if (!fareSource) {
        alert("Session ID missing — please search again.");
        return router.push("/");
      }
      /*  This one token will be sent as both flight_session_id
          and fare_source_code on the booking screen            */
          localStorage.setItem("fareSourceCode", fi.AirItineraryFareInfo.FareSourceCode);
          router.push("/booking");
     };



  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Loading / error states
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }
  if (errorMsg) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-600">
        <p className="mb-4 text-xl">😕 {errorMsg}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
        >
          Back to Search
        </button>
      </div>
    );
  }

  // Build airlineOptions from results
  const airlineOptions = Array.from(
    new Set(
      allItins.flatMap((fi) =>
        fi.OriginDestinationOptions.flatMap((odo) =>
          odo.OriginDestinationOption.map(
            (s) => s.FlightSegment.MarketingAirlineCode
          )
        )
      )
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <FiltersSidebar
        filters={filters}
        setFilters={setFilters}
        airlineOptions={airlineOptions}
      />

      <div className="lg:col-span-3 space-y-8">
        <h2 className="text-3xl font-bold text-gray-800">Search Results</h2>

        {pageItems.map((fi, idx) => {
          const firstSeg =
            fi.OriginDestinationOptions[0].OriginDestinationOption[0]
              .FlightSegment;
          const totals = fi.AirItineraryFareInfo.ItinTotalFares;

          // Build totals array
          const fareTotals = [
            { label: "Base Fare",   amt: totals.BaseFare },
            { label: "Equiv Fare",  amt: totals.EquivFare },
            { label: "Service Tax", amt: totals.ServiceTax },
            { label: "Total Tax",   amt: totals.TotalTax },
            { label: "Grand Total", amt: totals.TotalFare },
          ];

          return (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-purple-600">
                    {firstSeg.MarketingAirlineName || firstSeg.MarketingAirlineCode}{" "}
                    #{firstSeg.FlightNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {fi.DirectionInd} • 
                    {odoTotalStops(fi)} stop
                    {odoTotalStops(fi) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-2xl font-bold">
                  {formatMoney(
                    totals.TotalFare.Amount,
                    totals.TotalFare.CurrencyCode
                  )}
                </div>
              </div>

              {/* Segment Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-gray-700">
                <div>
                  <strong>{firstSeg.DepartureAirportLocationCode}</strong> →{" "}
                  <strong>{firstSeg.ArrivalAirportLocationCode}</strong>
                </div>
                <div>
                  {formatDateTime(firstSeg.DepartureDateTime)} –{" "}
                  {formatDateTime(firstSeg.ArrivalDateTime)}
                </div>
                <div>Duration: {firstSeg.JourneyDuration} min</div>
                <div>Cabin: {firstSeg.CabinClassText || firstSeg.CabinClassCode}</div>
              </div>

              {/* Expand */}
              <button
                onClick={() =>
                  setExpanded(expanded === idx ? null : idx)
                }
                className="flex items-center text-purple-600 font-medium mb-4"
              >
                {expanded === idx ? "Hide Details" : "View Details"}{" "}
                {expanded === idx ? (
                  <ChevronUp className="ml-1 w-5 h-5" />
                ) : (
                  <ChevronDown className="ml-1 w-5 h-5" />
                )}
              </button>

              {/* Details */}
              <AnimatePresence initial={false}>
                {expanded === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 mb-6 text-gray-700"
                  >
                    {/* Fare Totals */}
                    <div className="grid grid-cols-2 gap-4">
                      {fareTotals.map((t, i) => (
                        <div key={i} className="text-sm">
                          <strong>{t.label}:</strong>{" "}
                          {formatMoney(t.amt.Amount, t.amt.CurrencyCode)}
                        </div>
                      ))}
                    </div>

                    {/* Passenger breakdown */}
                    <div className="space-y-4">
                      {fi.AirItineraryFareInfo.FareBreakdown.map(
                        (br, bi) => (
                          <div
                            key={bi}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <p>
                              <strong>
                                {br.PassengerTypeQuantity.Code} x{" "}
                                {br.PassengerTypeQuantity.Quantity}
                              </strong>{" "}
                              —{" "}
                              {formatMoney(
                                br.PassengerFare.TotalFare.Amount,
                                br.PassengerFare.TotalFare.CurrencyCode
                              )}
                            </p>
                            <p>
                              Baggage:{" "}
                              {br.Baggage?.join(", ") || "—"} / Cabin:{" "}
                              {br.CabinBaggage?.join(", ") || "—"}
                            </p>
                            <p>Meal: {br.MealInfo?.join(", ") || "Standard"}</p>

                            {/* taxes */}
                            {Array.isArray(br.PassengerFare.Taxes) && (
                              <div className="mt-2 text-xs">
                                <strong>Taxes:</strong>{" "}
                                {br.PassengerFare.Taxes.map((tx, ti) => (
                                  <span key={ti}>
                                    {tx.TaxCode}{" "}
                                    {numeral(tx.Amount).format("0,0.00")}{" "}
                                    {tx.CurrencyCode}
                                    {ti < br.PassengerFare.Taxes!.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* penalties */}
                            {Array.isArray(br.PenaltyDetails) && (
                              <div className="mt-2 text-xs">
                                <strong>Penalties:</strong>{" "}
                                {br.PenaltyDetails.map((pd, pi) => (
                                  <span key={pi}>
                                    {pd.RefundAllowed
                                      ? `Refund ₹${pd.RefundPenaltyAmount}`
                                      : "No Refund"}
                                    ; {pd.ChangeAllowed
                                      ? `Change ₹${pd.ChangePenaltyAmount}`
                                      : "No Change"}
                                    {pi < br.PenaltyDetails!.length - 1
                                      ? " • "
                                      : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    {/* Segment-by-segment details for multi-legs */}
                    {fi.OriginDestinationOptions.map((odo, oi) => (
                      <div key={oi} className="space-y-2">
                        <h4 className="font-semibold">
                          Trip {oi + 1} — {odo.TotalStops} stop
                          {odo.TotalStops !== 1 ? "s" : ""}
                        </h4>
                        {odo.OriginDestinationOption.map((segObj, si) => {
                          const s = segObj.FlightSegment;
                          return (
                            <div
                              key={si}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm"
                            >
                              <div>
                                <strong>
                                  {s.DepartureAirportLocationCode}
                                </strong>{" "}
                                →{" "}
                                <strong>
                                  {s.ArrivalAirportLocationCode}
                                </strong>
                              </div>
                              <div>
                                {formatDateTime(s.DepartureDateTime)} –{" "}
                                {formatDateTime(s.ArrivalDateTime)}
                              </div>
                              <div>
                                {s.MarketingAirlineName ||
                                  s.MarketingAirlineCode}{" "}
                                {s.FlightNumber} ({s.Equipment?.AirEquipType})
                              </div>
                              <div>Journey: {s.JourneyDuration} min</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {/* Misc details */}
                    <div className="text-xs space-y-1">
                      <p>
                        <strong>Ticket Type:</strong>{" "}
                        {fi.TicketType || "—"}
                      </p>
                      <p>
                        <strong>Passport Mandatory:</strong>{" "}
                        {fi.IsPassportMandatory ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Validating Airline:</strong>{" "}
                        {fi.ValidatingAirlineCode}
                      </p>
                      <p>
                        <strong>Sequence #:</strong>{" "}
                        {fi.SequenceNumber || "—"}
                      </p>
                      <p>
                        <strong>Split Itinerary:</strong>{" "}
                        {fi.AirItineraryFareInfo.SplitItinerary
                          ? "Yes"
                          : "No"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Select */}
              <button
                onClick={() => handleSelect(fi)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition"
              >
                Select Flight
              </button>
            </motion.div>
          );
        })}

        {totalPages > 1 && (
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
