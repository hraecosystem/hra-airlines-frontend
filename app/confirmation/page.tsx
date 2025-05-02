"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

type BookingStatus = "CONFIRMED" | "PENDING" | "NONE";

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const download = params.get("download") === "true";

  const [pnr, setPnr] = useState<string>("");
  const [status, setStatus] = useState<BookingStatus>("NONE");
  const [loadingEmail, setLoadingEmail] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 1) On mount: load PNR + status from localStorage (or fallback)
  useEffect(() => {
    const stored = localStorage.getItem("bookingResponse");
    if (!stored) {
      setStatus("NONE");
      return;
    }
    try {
      const data = JSON.parse(stored);
      const result = data.BookFlightResult || {};
      const id = result.UniqueID || "";
      const st = result.Status === "CONFIRMED" ? "CONFIRMED" : "PENDING";
      setPnr(id);
      setStatus(st as BookingStatus);
    } catch {
      setStatus("NONE");
    }
  }, []);

  // 2) If confirmed, send the ticket email once
  useEffect(() => {
    if (status !== "CONFIRMED" || emailSent) return;
    setLoadingEmail(true);
    api
      .post("/ticket/send", { bookingId: pnr, email: localStorage.getItem("userEmail") })
      .then(() => setEmailSent(true))
      .catch((e) => {
        console.error(e);
        setError("Failed to email ticket. You can still download it below.");
      })
      .finally(() => setLoadingEmail(false));
  }, [status, pnr, emailSent]);

  // 3) If ?download=true, auto‐download PDF
  useEffect(() => {
    if (download && pnr) {
      api
        .get<Blob>(`/ticket/${pnr}/pdf`, { responseType: "blob" })
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
    }
  }, [download, pnr]);

  // 4) If no booking, redirect home after a moment
  useEffect(() => {
    if (status === "NONE") {
      const t = setTimeout(() => router.replace("/"), 5000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  const shareText = `I just booked with HRA Airlines! My PNR is ${pnr}.`;

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
                href={`/ticket/${pnr}`}
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
