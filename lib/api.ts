// app/lib/api.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

/**───────────────────────────────────────────┐
│ 1) Axios instance w/ JSON, cookies & CSRF │
└────────────────────────────────────────────┘*/
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api/v1";

const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,               // send & receive httpOnly cookies
  timeout: 10_000,                     // 10s
  xsrfCookieName: "XSRF-TOKEN",        // name of the cookie your backend sets
  xsrfHeaderName: "X-CSRF-Token",      // header your backend expects
});

/**─────────────────────────────────────┐
│ 2) Global interceptors              │
└──────────────────────────────────────┘*/
api.interceptors.request.use(
  (cfg) => cfg,
  (err: AxiosError) => Promise.reject(err)
);

api.interceptors.response.use(
  (resp) => resp,
  (err: AxiosError) => {
    // Auto-redirect to login if 401
    if (err.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

/**────────────────────────────────────────┐
│ 3) Helpers that unwrap .data           │
└─────────────────────────────────────────┘*/
export async function $get<T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  const r = await api.get<T>(url, config);
  return r.data;
}

export async function $post<T, B = unknown>(
  url: string,
  body: B,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  const r = await api.post<T>(url, body, config);
  return r.data;
}

export async function $put<T, B = unknown>(
  url: string,
  body: B,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  const r = await api.put<T>(url, body, config);
  return r.data;
}

export async function $delete<T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  const r = await api.delete<T>(url, config);
  return r.data;
}

/**────────────────────────────────────────┐
│ 4) Domain types                        │
└─────────────────────────────────────────┘*/
export interface Airport {
  AirportCode: string;
  AirportName: string;
  City: string;
  Country: string;
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
}

export interface FlightSearchSegment {
  departureDate: string;           // YYYY-MM-DD
  returnDate?: string;             // only for Return
  airportOriginCode: string;       // IATA
  airportDestinationCode: string;  // IATA
}

export interface FlightSearchParams {
  requiredCurrency?: string;
  journeyType: "OneWay" | "Return" | "Circle";
  OriginDestinationInfo: FlightSearchSegment[];
  class: "First" | "Business" | "PremiumEconomy" | "Economy";
  airlineCode?: string;
  directFlight?: 0 | 1;
  adults: number;
  childs: number;
  infants: number;
}

/**────────────────────────────────────────┐
│ 5) Airport endpoints                   │
└─────────────────────────────────────────┘*/
export function fetchAirports(query: string): Promise<Airport[]> {
  return $get<Airport[]>(`/airports/search?q=${encodeURIComponent(query)}`);
}

export function fetchAllAirports(): Promise<Airport[]> {
  return $post<Airport[]>("/airports/list", {});
}

/**────────────────────────────────────────┐
│ 6) Flight & fare endpoints             │
└─────────────────────────────────────────┘*/
export function searchFlights(
  params: FlightSearchParams
): Promise<any> {
  return $post("/flights/search", params);
}

export function revalidateFare(payload: {
  session_id: string;
  fare_source_code: string;
}): Promise<any> {
  return $post("/flights/revalidate", payload);
}

export function getFareRules(payload: {
  session_id: string;
  fare_source_code: string;
  OperatingAirlineCode: string;
  DepartureAirportLocationCode: string;
  ArrivalAirportLocationCode: string;
}): Promise<any> {
  return $post("/flights/fare-rules", payload);
}

/**────────────────────────────────────────┐
│ 7) Booking & ticket endpoints          │
└─────────────────────────────────────────┘*/
export function bookFlight(payload: any): Promise<{ bookingId: string }> {
  return $post("/flights/book", payload);
}

export function orderTicket(payload: { UniqueID: string }): Promise<any> {
  return $post("/flights/ticket-order", payload);
}

export function getTripDetails(payload: { UniqueID: string }): Promise<any> {
  return $post("/flights/trip-details", payload);
}

export function cancelBooking(payload: { UniqueID: string }): Promise<any> {
  return $post("/flights/cancel", payload);
}

/**────────────────────────────────────────┐
│ 8) Post-ticket operations               │
└─────────────────────────────────────────┘*/
export function refundQuote(payload: {
  UniqueID: string;
  paxDetails: any[];
}): Promise<any> {
  return $post("/flights/refund-quote", payload);
}

export function refundRequest(payload: {
  UniqueID: string;
  paxDetails: any[];
}): Promise<any> {
  return $post("/flights/refund-request", payload);
}

export function reissueQuote(payload: {
  UniqueID: string;
  paxDetails: any[];
  OriginDestinationInfo: FlightSearchSegment[];
}): Promise<any> {
  return $post("/flights/reissue-quote", payload);
}

export function reissueRequest(payload: {
  UniqueID: string;
  ptrUniqueID: number | string;
  PreferenceOption: number;
  remark?: string;
}): Promise<any> {
  return $post("/flights/reissue-request", payload);
}

export function readPostTicketStatus(payload: {
  uniqueID: string;
  ptrUniqueID: number | string;
}): Promise<any> {
  return $post("/flights/search-post-ticket-status", payload);
}

export function voidQuote(payload: {
  UniqueID: string;
  paxDetails: any[];
}): Promise<any> {
  return $post("/flights/void-quote", payload);
}

export function voidTicket(payload: {
  UniqueID: string;
  paxDetails: any[];
  remark?: string;
}): Promise<any> {
  return $post("/flights/void", payload);
}

export function addBookingNote(payload: {
  UniqueID: string;
  notes: string;
}): Promise<any> {
  return $post("/flights/booking-notes", payload);
}

/**────────────────────────────────────────┐
│ 9) Airline list                        │
└─────────────────────────────────────────┘*/
export function fetchAirlines(): Promise<Airline[]> {
  return $get<Airline[]>("/flights/airline-list");
}

/**────────────────────────────────────────┐
│ 10) Export raw axios                   │
└─────────────────────────────────────────┘*/
export default api;
