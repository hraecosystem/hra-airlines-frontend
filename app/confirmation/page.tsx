"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";

type BookingStatus = "CONFIRMED" | "PENDING" | "NONE";

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const download = params.get("download") === "true";
  const { user, loading: authLoading } = useAuth();

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [pnr, setPnr] = useState("");
  const [status, setStatus] = useState<BookingStatus>("NONE");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  // 1) Load bookingId & fetch PNR + status
  useEffect(() => {
    const id = localStorage.getItem("bookingId");
    if (!id) {
      setStatus("NONE");
      return;
    }
    setBookingId(id);

    api
      .get<{ status: string; data: { pnr: string; status: string } }>(`/ticket/${id}`)
      .then((res) => {
        if (res.data.status === "success") {
          setPnr(res.data.data.pnr);
          // map your DB status to CONFIRMED/PENDING
          setStatus(
            res.data.data.status === "Ticketed" ? "CONFIRMED" : "PENDING"
          );
        } else {
          setStatus("NONE");
        }
      })
      .catch(() => {
        setStatus("NONE");
      });
  }, []);

  // 2) Once confirmed, issue‐and‐send to the user’s email
  useEffect(() => {
    if (status !== "CONFIRMED" || emailSent || !bookingId || !user?.email)
      return;

    setLoadingEmail(true);
    api
      .post(`/ticket/${bookingId}/issue-and-send`, { email: user.email })
      .then(() => setEmailSent(true))
      .catch(() => {
        setError("Failed to email ticket. You can still download it below.");
      })
      .finally(() => setLoadingEmail(false));
  }, [status, emailSent, bookingId, user]);

  // 3) Auto-download PDF if ?download=true
  useEffect(() => {
    if (!download || !bookingId || !pnr) return;

    api
      .get<Blob>(`/ticket/${bookingId}/pdf`, { responseType: "blob" })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `HRA-Ticket-${pnr}.pdf`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => setError("Failed to download PDF."));
  }, [download, bookingId, pnr]);

  // 4) Redirect home if we never found a booking
  useEffect(() => {
    if (status === "NONE") {
      const t = setTimeout(() => router.replace("/"), 5000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  const shareText = `I just booked with HRA Airlines! My PNR is ${pnr}.`;

  // still waiting for auth or fetch?
  if (authLoading || status === "NONE" && !bookingId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-16 h-16">
          {status === "CONFIRMED" ? (
            <img src="/icons/confirm.svg" alt="Confirmed" />
          ) : status === "PENDING" ? (
            <img src="/icons/pending.svg" alt="Pending" />
          ) : (
            <img src="/icons/error.svg" alt="Error" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-blue-700">
          {status === "CONFIRMED"
            ? "Booking Confirmed!"
            : status === "PENDING"
            ? "Booking Pending"
            : "No Booking Found"}
        </h1>

        {status !== "NONE" && (
          <>
            <p className="text-gray-700">
              {status === "CONFIRMED"
                ? "Your flight is confirmed. A copy has been emailed."
                : "Your booking is pending. We'll let you know when it's confirmed."}
            </p>

            <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm text-gray-800">
              <span className="font-semibold">PNR:</span> {pnr}
            </div>

            {loadingEmail ? (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Spinner size={20} />
                Sending ticket via email…
              </div>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : emailSent && status === "CONFIRMED" ? (
              <p className="text-green-600">Ticket emailed successfully!</p>
            ) : null}

            <div className="flex flex-wrap gap-3 justify-center mt-4">
              <Link
                href={`/ticket/${bookingId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                View Ticket
              </Link>
              <button
                onClick={() => router.push(`/confirmation?download=true`)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
              >
                Download PDF
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  shareText
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Share on WhatsApp
              </a>
              <a
                href={`mailto:?subject=My%20HRA%20Airlines%20Booking&body=${encodeURIComponent(
                  shareText
                )}`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
              >
                Share via Email
              </a>
            </div>
          </>
        )}

        <Link
          href="/dashboard/bookings"
          className="block text-sm text-blue-600 hover:underline mt-4"
        >
          ← Back to My Bookings
        </Link>
      </div>

      {status === "NONE" && (
        <p className="text-gray-500 text-sm mt-6">
          Redirecting you back home…
        </p>
      )}
    </div>
  );
}
