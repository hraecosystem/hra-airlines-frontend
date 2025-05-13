// components/PaymentSuccessContent.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

type Status = "verifying" | "waiting" | "success" | "error";

export default function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(7);

  // to limit polling attempts
  const attemptsRef = useRef(0);
  const MAX_ATTEMPTS = 15; // 15 polls → ~30s

  // 1️⃣ Verify Stripe session
  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("Missing payment session.");
      return;
    }
    api
      .post("/payment/verify-session", { sessionId })
      .then(() => {
        setStatus("waiting");
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Failed to verify payment. Try again later.");
      });
  }, [sessionId]);

  // 2️⃣ Poll for ticketNumbers
  useEffect(() => {
    if (status !== "waiting") return;
    const bookingId = localStorage.getItem("bookingId");
    if (!bookingId) {
      setStatus("error");
      setErrorMsg("Booking not found in storage.");
      return;
    }

    let timer: NodeJS.Timeout;
    const poll = async () => {
      attemptsRef.current += 1;
      if (attemptsRef.current > MAX_ATTEMPTS) {
        setStatus("error");
        setErrorMsg(
          "Ticket issuance is taking longer than expected. " +
          "Please check your bookings page in a moment."
        );
        return;
      }

      try {
        const res = await api.get<{
          status: string;
          data: { ticketNumbers?: any[] };
        }>(`/ticket/${bookingId}`);
        const nums = res.data.data.ticketNumbers;
        if (nums?.length && nums.length > 0) {
          setStatus("success");
        } else {
          timer = setTimeout(poll, 2000);
        }
      } catch {
        timer = setTimeout(poll, 2000);
      }
    };

    poll();
    return () => clearTimeout(timer);
  }, [status]);

  // 3️⃣ Countdown on success
  useEffect(() => {
    if (status !== "success") return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // 4️⃣ Redirect when countdown hits zero
  useEffect(() => {
    if (status === "success" && countdown <= 0) {
      router.replace("/dashboard/bookings");
    }
  }, [status, countdown, router]);

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center space-y-4">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <p className="text-gray-600">Verifying your payment…</p>
          </>
        )}

        {status === "waiting" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-green-500 animate-spin" />
            <p className="text-gray-600">
              Payment confirmed! Issuing your ticket—this may take a few moments…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="text-2xl font-bold text-red-700">Oops!</h2>
            <p className="text-gray-600">{errorMsg}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/payment")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Retry Payment
            </motion.button>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="text-2xl font-bold text-green-700">All set!</h1>
            <p className="text-gray-700">
              Your ticket has been issued. Redirecting in <strong>{countdown}</strong>{" "}
              second{countdown !== 1 && "s"}…
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/bookings")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View My Bookings Now
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
