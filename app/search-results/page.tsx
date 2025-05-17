// app/search-results/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FiltersSidebar from "@/components/common/FiltersSidebar";
import Pagination from "@/components/common/Pagination";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
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
  // ← add these two
  MealCode?: string;
  MarriageGroup?: string;

  Eticket: boolean;
  OperatingAirline: {
    Code: string;
    Name: string;
    Equipment?: string;
    FlightNumber?: string;
  };
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
  type FI = FareItinerary; // simple alias is still handy

  const [allItins, setAllItins] = useState<FI[]>([]);
  const [filtered, setFiltered] = useState<FI[]>([]);

  const [masterSid, setMasterSid] = useState<string>(""); // ← NEW

  const [filters, setFilters] = useState<Filters>({
    airline: "",
    stops: "all",
    sortBy: "price-asc",
    meals: [],
    baggage: [],
    priceRange: DEFAULT_PRICE_RANGE,
  });

  // ⇢ hold the return-trip choices (Indian domestic RT delivers them separately)
  const [inboundItins, setInboundItins] = useState<FI[]>([]);

  /** 0 = picking the OUTBOUND, 1 = picking the INBOUND */
  const [step, setStep] = useState<0 | 1>(0);

  /** when step === 1 this keeps the user-chosen outbound itinerary */
  const [selectedOutbound, setSelectedOutbound] = useState<FI | undefined>();

  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  // ────────────────────────────────────────────────────────────────
  // Flags that depend on what the API returned
  const [hasInboundList, setHasInboundList] = useState(false);
  const [isOneWayRequest, setIsOneWayRequest] = useState(false);
  // ────────────────────────────────────────────────────────────────

  // 1) Load raw payload & extract FareItineraries
  useEffect(() => {
    try {
      const raw = localStorage.getItem("searchResults");
      if (!raw)
        throw new Error("No search results found. Please search again.");
      const obj = JSON.parse(raw);

      console.log("RAW search object ➡️", obj); // 🟡 NEW

      /* 1️⃣ grab the search-level SessionId once */
      const sid =
        obj.AirSearchResponse?.session_id ?? // ♦ correct path
        obj.AirSearchResponse?.AirSearchResult?.SessionId ?? // (fallback)
        obj.session_id ?? // (old fallback)
        "";
      setMasterSid(sid);

      if (sid) {
        localStorage.setItem("flightSessionId", sid);
      }

      // ➊ ───────── explicit containers first ──────────────
      const normalise = (raw: any): FI[] =>
        raw
          ? Array.isArray(raw)
            ? raw.map((w: any) => w.FareItinerary ?? w)
            : [raw.FareItinerary ?? raw]
          : [];

      let outbound = normalise(
        obj.AirSearchResponse?.AirSearchResult?.FareItineraries
      );
      let inbound = normalise(
        obj.AirSearchResponse?.AirSearchResultInbound?.FareItineraries
      );

      if (outbound.length === 0 && inbound.length === 0) {
        /* ------------------------------------------------------------------ *
         *  ONE list → split by DirectionInd
         * ------------------------------------------------------------------ */
        const rawFi =
          obj.AirSearchResponse?.AirSearchResult?.FareItineraries ??
          obj.AirSearchResult?.FareItineraries; // very old schema

        /* 🔷 Indian-domestic round-trip: inbound list sits in its
         *     own sibling node AirSearchResultInbound                      */
        const rawInDomestic =
          obj.AirSearchResponse?.AirSearchResultInbound?.FareItineraries ??
          obj.AirSearchResultInbound?.FareItineraries; // very old GDS

        const listInboundDom: FI[] = rawInDomestic
          ? Array.isArray(rawInDomestic)
            ? rawInDomestic.map((w: any) => w.FareItinerary ?? w)
            : [rawInDomestic.FareItinerary ?? rawInDomestic]
          : [];

        const allFi = normalise(
          obj.AirSearchResponse?.AirSearchResult?.FareItineraries ??
            obj.AirSearchResult?.FareItineraries
        );

        const isOut = (d?: string) => !!d && /out|o\b/i.test(d); // “Outbound”, “O”
        const isIn = (d?: string) => !!d && /in|ret|r\b/i.test(d); // “Inbound”, “Return”, “R”

        const out = allFi.filter((fi) => isOut(fi.DirectionInd));
        const inn = [
          ...allFi.filter((fi) => isIn(fi.DirectionInd)), // ➊ tagged “Return/Inbound”
          ...listInboundDom, // ➋ separate domestic list
        ];

        outbound = allFi.filter((fi) => isOut(fi.DirectionInd));
        inbound = allFi.filter((fi) => isIn(fi.DirectionInd));

        if (outbound.length === 0 && inbound.length === 0) {
          outbound = allFi;
        }
      }
      // ➌ ───────── helper flags based on final lists ───────
      const inbPresent = inbound.length > 0;
      setHasInboundList(inbPresent);

      const searchTripTypeRaw =
        obj.AirSearchResponse?.search_params?.tripType ??
        obj.AirSearchResponse?.SearchInput?.TripType ??
        outbound[0]?.DirectionInd ??
        ""; // last resort

      const oneWay = !inbPresent; // a trip is one-way iff no inbound list
      setIsOneWayRequest(oneWay);

      if (oneWay || !inbPresent) setStep(0);

      setAllItins(outbound);
      setInboundItins(inbound); // <- keep inbound aside till step 1
      setFiltered(outbound);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ▒▒▒ when user has chosen an outbound, step 1 starts so we display inbound ▒▒▒ */
  useEffect(() => {
    if (step === 1) {
      setAllItins(inboundItins);
      setFiltered(inboundItins);
    }
  }, [step, inboundItins, hasInboundList]);

  // Re-calculate whenever filters _or the list currently displayed_ changes
  useEffect(() => {
    let tmp = [...allItins];

    // airline filter
    if (filters.airline) {
      tmp = tmp.filter((fi) =>
        fi.OriginDestinationOptions.some((odo) =>
          odo.OriginDestinationOption.some(
            (seg) => seg.FlightSegment.MarketingAirlineCode === filters.airline
          )
        )
      );
    }

    // stops filter
    if (filters.stops !== "all") {
      tmp = tmp.filter((fi) => odoTotalStops(fi) === parseStops(filters.stops));
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
      const pa = parseFloat(
        a.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount
      );
      const pb = parseFloat(
        b.AirItineraryFareInfo.ItinTotalFares.TotalFare.Amount
      );
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

  const handleSelectOutbound = (fi: FareItinerary) => {
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
    if (!sid)
      return alert(
        "SessionId missing in search payload – please search again."
      );

    const fareSource = fi.AirItineraryFareInfo.FareSourceCode;
    if (!fareSource) {
      alert("Session ID missing — please search again.");
      return router.push("/");
    }
    /*  This one token will be sent as both flight_session_id
          and fare_source_code on the booking screen            */
    if (hasInboundList && !isOneWayRequest) {
      localStorage.setItem(
        "fareSourceCode",
        fi.AirItineraryFareInfo.FareSourceCode
      ); // this will be treated as outbound
    } else {
      localStorage.setItem(
        "fareSourceCode",
        fi.AirItineraryFareInfo.FareSourceCode
      );
      localStorage.removeItem("fareSourceCodeInbound");
    }

    // keep for later & let the UI now render the return flights
    setSelectedOutbound(cleaned);

    setFilters({
      // reset all filters for the inbound list
      airline: "",
      stops: "all",
      sortBy: "price-asc",
      meals: [],
      baggage: [],
      priceRange: DEFAULT_PRICE_RANGE,
    });

    if (hasInboundList && !isOneWayRequest) {
      // Indian domestic RT: we really have a 2nd list to show
      setStep(1);
    } else {
      // one-way, or whole-RT itineraries: go straight to booking
      router.push("/booking");
    }
  };

  const handleSelectInbound = (fi: FareItinerary) => {
    // outbound already cleaned; do the same for inbound
    const cleanedIn: FI = {
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

    if (!selectedOutbound) return; // should never happen

    const combined = {
      Outbound: selectedOutbound!,
      Inbound: cleanedIn,
    };

    localStorage.setItem("selectedFareRT", JSON.stringify(combined));
    localStorage.setItem(
      "fareSourceCode",
      selectedOutbound!.AirItineraryFareInfo.FareSourceCode
    );
    localStorage.setItem(
      "fareSourceCodeInbound",
      cleanedIn.AirItineraryFareInfo.FareSourceCode
    );

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <FiltersSidebar
          filters={filters}
          setFilters={setFilters}
          airlineOptions={airlineOptions}
        />

        <div className="lg:col-span-3 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {hasInboundList
                ? step === 0
                  ? "Step 1 of 2: Select your outbound flight"
                  : "Step 2 of 2: Select your return flight"
                : "Select your flight"}
            </h2>

            <p className="text-gray-600 mt-1">
              {filtered.length} option{filtered.length !== 1 && "s"} available
            </p>
          </motion.div>

          {pageItems.map((fi, idx) => {
            const firstSeg =
              fi.OriginDestinationOptions[0].OriginDestinationOption[0]
                .FlightSegment;
            const totals = fi.AirItineraryFareInfo.ItinTotalFares;

            // Build totals array
            const fareTotals = [
              { label: "Base Fare", amt: totals.BaseFare },
              { label: "Equiv Fare", amt: totals.EquivFare },
              { label: "Service Tax", amt: totals.ServiceTax },
              { label: "Total Tax", amt: totals.TotalTax },
              { label: "Grand Total", amt: totals.TotalFare },
            ];

            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 relative">
                        <img
                          src={`https://flightaware.com/images/airline_logos/90p/${firstSeg.MarketingAirlineCode}.png`}
                          alt={
                            firstSeg.MarketingAirlineName ||
                            firstSeg.MarketingAirlineCode
                          }
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://www.gstatic.com/flights/airline_logos/70px/${firstSeg.MarketingAirlineCode}.png`;
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {firstSeg.MarketingAirlineName ||
                            firstSeg.MarketingAirlineCode}{" "}
                          #{firstSeg.FlightNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {fi.DirectionInd} •{" "}
                          <span className="font-semibold text-gray-700">
                            {odoTotalStops(fi)}
                          </span>{" "}
                          stop{odoTotalStops(fi) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatMoney(
                          totals.TotalFare.Amount,
                          totals.TotalFare.CurrencyCode
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {firstSeg.DepartureAirportLocationCode}
                          </span>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex flex-col justify-center">
                            <div className="text-sm text-gray-500">
                              Departure
                            </div>
                            <div className="font-medium">
                              {formatDateTime(firstSeg.DepartureDateTime)}
                            </div>
                          </div>
                          <div className="w-6 h-6 text-gray-600 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 -960 960 960"
                              width="24px"
                              fill="currentColor"
                            >
                              <path d="M120-120v-80h720v80H120Zm70-200L40-570l96-26 112 94 140-37-207-276 116-31 299 251 170-46q32-9 60.5 7.5T864-585q9 32-7.5 60.5T808-487L190-320Z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">
                            {
                              fi.OriginDestinationOptions[0]
                                .OriginDestinationOption[
                                fi.OriginDestinationOptions[0]
                                  .OriginDestinationOption.length - 1
                              ].FlightSegment.ArrivalAirportLocationCode
                            }
                          </span>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex flex-col justify-center">
                            <div className="text-sm text-gray-500">Arrival</div>
                            <div className="font-medium">
                              {formatDateTime(
                                fi.OriginDestinationOptions[0]
                                  .OriginDestinationOption[
                                  fi.OriginDestinationOptions[0]
                                    .OriginDestinationOption.length - 1
                                ].FlightSegment.ArrivalDateTime
                              )}
                            </div>
                          </div>
                          <div className="w-6 h-6 text-gray-600 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 -960 960 960"
                              width="24px"
                              fill="currentColor"
                            >
                              <path d="M120-120v-80h720v80H120Zm622-202L120-499v-291l96 27 48 139 138 39-35-343 115 34 128 369 172 49q25 8 41.5 29t16.5 48q0 35-28.5 61.5T742-322Z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {(() => {
                              const firstDeparture = new Date(
                                firstSeg.DepartureDateTime
                              );
                              const lastArrival = new Date(
                                fi.OriginDestinationOptions[0].OriginDestinationOption[
                                  fi.OriginDestinationOptions[0]
                                    .OriginDestinationOption.length - 1
                                ].FlightSegment.ArrivalDateTime
                              );
                              const totalMinutes = Math.round(
                                (lastArrival.getTime() -
                                  firstDeparture.getTime()) /
                                  (1000 * 60)
                              );
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;
                              return `${hours}h${minutes}m`;
                            })()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">
                            {(() => {
                              const firstDeparture = new Date(
                                firstSeg.DepartureDateTime
                              );
                              const lastArrival = new Date(
                                fi.OriginDestinationOptions[0].OriginDestinationOption[
                                  fi.OriginDestinationOptions[0]
                                    .OriginDestinationOption.length - 1
                                ].FlightSegment.ArrivalDateTime
                              );
                              const totalMinutes = Math.round(
                                (lastArrival.getTime() -
                                  firstDeparture.getTime()) /
                                  (1000 * 60)
                              );
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;
                              return `${hours}h ${minutes}m total (including stops)`;
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 font-semibold">
                            {firstSeg.CabinClassCode}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">
                            Cabin Class
                          </div>
                          <div className="font-medium">
                            {firstSeg.CabinClassText || firstSeg.CabinClassCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Route Visualization */}
                  <div className="relative py-8 mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-between items-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                          <span className="text-blue-600 font-semibold text-lg">
                            {firstSeg.DepartureAirportLocationCode}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDateTime(firstSeg.DepartureDateTime)}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-blue-200">
                          <ArrowRight className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2">
                          <span className="text-green-600 font-semibold text-lg">
                            {
                              fi.OriginDestinationOptions[0]
                                .OriginDestinationOption[
                                fi.OriginDestinationOptions[0]
                                  .OriginDestinationOption.length - 1
                              ].FlightSegment.ArrivalAirportLocationCode
                            }
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDateTime(
                            fi.OriginDestinationOptions[0]
                              .OriginDestinationOption[
                              fi.OriginDestinationOptions[0]
                                .OriginDestinationOption.length - 1
                            ].FlightSegment.ArrivalDateTime
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                    className="flex items-center text-blue-600 font-medium mb-6 hover:text-blue-700 transition-colors duration-200"
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
                        className="space-y-6 mb-6"
                      >
                        {/* Fare Breakdown */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Fare Breakdown
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {fareTotals.map((t, i) => (
                              <div key={i} className="text-sm">
                                <span className="text-gray-600">
                                  {t.label}:
                                </span>{" "}
                                <span className="font-medium text-gray-900">
                                  {formatMoney(
                                    t.amt.Amount,
                                    t.amt.CurrencyCode
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Passenger Breakdown */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Passenger Details
                          </h4>
                          <div className="space-y-4">
                            {fi.AirItineraryFareInfo.FareBreakdown.map(
                              (br, bi) => (
                                <div
                                  key={bi}
                                  className="bg-white rounded-lg p-4 shadow-sm"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900">
                                      {br.PassengerTypeQuantity.Code} x{" "}
                                      {br.PassengerTypeQuantity.Quantity}
                                    </span>
                                    <span className="text-blue-600 font-semibold">
                                      {formatMoney(
                                        br.PassengerFare.TotalFare.Amount,
                                        br.PassengerFare.TotalFare.CurrencyCode
                                      )}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">
                                        Baggage:
                                      </span>{" "}
                                      {br.Baggage?.join(", ") || "—"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Cabin:
                                      </span>{" "}
                                      {br.CabinBaggage?.join(", ") || "—"}
                                    </div>
                                    <div>
                                      <span className="font-medium">Meal:</span>{" "}
                                      {br.MealInfo?.join(", ") || "Standard"}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Flight Segments */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Flight Details
                          </h4>
                          <div className="space-y-6">
                            {fi.OriginDestinationOptions.map((odo, oi) => (
                              <div
                                key={oi}
                                className="bg-white rounded-lg p-4 shadow-sm"
                              >
                                <h5 className="font-medium text-gray-900 mb-3">
                                  Trip {oi + 1} — {odo.TotalStops} stop
                                  {odo.TotalStops !== 1 ? "s" : ""}
                                </h5>
                                <div className="space-y-4">
                                  {odo.OriginDestinationOption.map(
                                    (segObj, si) => {
                                      const s = segObj.FlightSegment;
                                      return (
                                        <div
                                          key={si}
                                          className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg"
                                        >
                                          <div className="w-12 h-12 relative">
                                            <img
                                              src={`https://flightaware.com/images/airline_logos/90p/${s.MarketingAirlineCode}.png`}
                                              alt={
                                                s.MarketingAirlineName ||
                                                s.MarketingAirlineCode
                                              }
                                              className="w-full h-full object-contain"
                                              onError={(e) => {
                                                const target =
                                                  e.target as HTMLImageElement;
                                                target.src = `https://www.gstatic.com/flights/airline_logos/70px/${s.MarketingAirlineCode}.png`;
                                              }}
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                              <span className="font-medium">
                                                {s.MarketingAirlineName ||
                                                  s.MarketingAirlineCode}{" "}
                                                {s.FlightNumber}
                                              </span>
                                              <span className="text-sm text-gray-500">
                                                {s.Equipment?.AirEquipType}
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                              <div>
                                                {s.DepartureAirportLocationCode}{" "}
                                                → {s.ArrivalAirportLocationCode}
                                              </div>
                                              <div>
                                                {formatDateTime(
                                                  s.DepartureDateTime
                                                )}{" "}
                                                –{" "}
                                                {formatDateTime(
                                                  s.ArrivalDateTime
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          {/* ─── Booking / Seats / Meal / Marriage info ─── */}
                                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                                            <div>
                                              <span className="font-medium">
                                                Booking Class:
                                              </span>{" "}
                                              {segObj.ResBookDesigCode ||
                                                segObj.ResBookDesigText ||
                                                "—"}
                                            </div>
                                            <div>
                                              <span className="font-medium">
                                                Seats Left:
                                              </span>{" "}
                                              {segObj.SeatsRemaining?.Number ??
                                                "—"}
                                            </div>
                                            <div>
                                              <span className="font-medium">
                                                Meal Code:
                                              </span>{" "}
                                              {s.MealCode || "Standard"}
                                            </div>
                                            <div>
                                              <span className="font-medium">
                                                Marriage Group:
                                              </span>{" "}
                                              {s.MarriageGroup || "—"}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Additional Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Ticket Type:
                              </span>{" "}
                              <span className="font-medium">
                                {fi.TicketType || "—"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Passport Required:
                              </span>{" "}
                              <span className="font-medium">
                                {fi.IsPassportMandatory ? "Yes" : "No"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Validating Airline:
                              </span>{" "}
                              <span className="font-medium">
                                {fi.ValidatingAirlineCode}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Sequence #:</span>{" "}
                              <span className="font-medium">
                                {fi.SequenceNumber || "—"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Split Itinerary:
                              </span>{" "}
                              <span className="font-medium">
                                {fi.AirItineraryFareInfo.SplitItinerary
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Select Button */}
                  <button
                    onClick={() =>
                      step === 0
                        ? handleSelectOutbound(fi)
                        : handleSelectInbound(fi)
                    }
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Select Flight
                  </button>
                </div>
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
    </div>
  );
}
