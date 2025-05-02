// app/auth/forgot-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Set document title when this page loads (client-side)
  useEffect(() => {
    document.title = "Forgot Password | HRA Airlines";
  }, []);

  // Basic email format check
  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!isValidEmail(trimmed)) {
      setFeedback({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.post("/auth/request-reset", { email: trimmed });
      setFeedback({
        type: "success",
        text: res.data.message || "OTP sent! Check your inbox.",
      });
      // Save email for the reset-password step
      localStorage.setItem("hra_reset_email", trimmed);
      // Navigate after a brief delay
      setTimeout(() => {
        router.push("/auth/reset-password");
      }, 1500);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to send OTP. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password | HRA Airlines</title>
        <meta
          name="description"
          content="Reset your HRA Airlines password by entering your registered email to receive an OTP."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12">
        <section className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-fit bg-pink-100 p-4 rounded-full mb-4">
              <Mail className="text-pink-600 w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Forgot Password</h1>
            <p className="text-gray-600 mt-2">
              Enter your registered email and we'll send you a one-time code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={feedback?.type === "error"}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                  feedback?.type === "error"
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-pink-300"
                }`}
                placeholder="you@example.com"
              />
            </div>

            {feedback && (
              <p
                role="alert"
                aria-live="assertive"
                className={`text-center text-sm font-medium ${
                  feedback.type === "error" ? "text-red-600" : "text-green-600"
                }`}
              >
                {feedback.text}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-50 transition"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                    className="opacity-75"
                  />
                </svg>
              )}
              {loading ? "Sending OTP…" : "Send OTP"}
            </motion.button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            disabled={loading}
            className="block mx-auto text-sm text-pink-600 hover:underline"
          >
            Back to Sign In
          </button>
        </section>
      </main>
    </>
  );
}
