// app/auth/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      await logout();            // clear session / cookie
      setTimeout(() => {
        router.push("/auth/login");
      }, 800);                   // slight delay for UX
    })();
  }, [logout, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
        <svg
          className="animate-spin h-12 w-12 text-blue-600 mb-4"
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
        </svg>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Signing out…
        </h1>
        <p className="text-gray-600">
          You’ll be redirected to the login page shortly.
        </p>
      </div>
    </div>
  );
}
