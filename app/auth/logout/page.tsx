// app/auth/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Head from "next/head";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await logout(); // clear session on server + client
      } catch {
        // ignore errors; still redirect
      }
      // brief pause for UX
      setTimeout(() => {
        router.replace("/auth/login");
      }, 800);
    })();
  }, [logout, router]);

  return (
    <>
      <Head>
        <title>Signing Out… | HRA Airlines</title>
        <meta
          name="description"
          content="Signing you out of HRA Airlines. You’ll be redirected shortly."
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        >
          <motion.svg
            className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-6"
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
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </motion.svg>

          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Signing out…
          </h1>
          <p className="text-gray-600 mb-4">
            You’re being securely signed out. Redirecting to login…
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-1 bg-blue-500 mx-auto rounded"
          />
        </motion.div>
      </main>
    </>
  );
}
