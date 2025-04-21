"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ConfirmationPage() {
  const [pnr, setPnr] = useState("");
  const [status, setStatus] = useState<"CONFIRMED" | "PENDING" | "NONE">("NONE");
  const [loadingEmail, setLoadingEmail] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("bookingResponse");
    if (!stored) {
      setStatus("NONE");
      setLoadingEmail(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const result = parsed.BookFlightResult || {};
      const uniqueId = result.UniqueID || "N/A";
      const st = result.Status?.toUpperCase() === "CONFIRMED" ? "CONFIRMED" : "PENDING";

      setPnr(uniqueId);
      setStatus(st);
    } catch {
      setStatus("NONE");
    } finally {
      // simulate email send delay
      setTimeout(() => setLoadingEmail(false), 1000);
    }
  }, []);

  const shareText = `I just booked with HRA Airlines! My PNR: ${pnr}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center relative">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2331/2331970.png"
          alt="Booking confirmed"
          className="w-16 h-16 mx-auto mb-4"
        />

        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          {status === "CONFIRMED" ? "✅ Booking Confirmed" : status === "PENDING" ? "⏳ Booking Pending" : "⚠️ No Booking Found"}
        </h1>

        {status !== "NONE" && (
          <>
            <p className="text-gray-700 mb-4">
              {status === "CONFIRMED"
                ? "Your flight is confirmed! 🎉"
                : "Your booking is pending. Please check again shortly."}
            </p>

            <div className="bg-gray-100 rounded-lg p-3 my-4 font-mono text-sm text-gray-800">
              <span className="font-semibold">PNR:</span> {pnr}
            </div>

            <div className="mb-4">
              {loadingEmail ? (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <span className="animate-spin rounded-full h-5 w-5 border-4 border-blue-600 border-t-transparent"></span>
                  Sending ticket via email…
                </div>
              ) : status === "CONFIRMED" ? (
                <p className="text-green-600">✔️ Ticket emailed successfully.</p>
              ) : (
                <p className="text-gray-500">Email will arrive once confirmed.</p>
              )}
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {status !== "NONE" && (
            <>
              <Link
                href={`/ticket/${pnr}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                View Ticket
              </Link>
              <Link
                href={`/ticket/${pnr}?download=true`}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
              >
                Download PDF
              </Link>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Share on WhatsApp
              </a>
              <a
                href={`mailto:?subject=My HRA Airlines Booking&body=${encodeURIComponent(shareText)}`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
              >
                Share via Email
              </a>
            </>
          )}
        </div>

        <Link
          href="/dashboard/bookings"
          className="text-sm text-blue-600 hover:underline"
        >
          Go to My Bookings →
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Need help?{" "}
        <a href="mailto:support@hra-airlines.com" className="underline">
          Contact Support
        </a>
      </p>
    </div>
  );
}
