// app/auth/login/layout.tsx
import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | HRA Airlines",
  description:
    "Sign in to your HRA Airlines account to manage bookings, check itineraries, and more.",
  openGraph: {
    title: "Login | HRA Airlines",
    description:
      "Securely sign in to HRA Airlines and access your dashboard.",
    url: "https://www.hra-airlines.com/auth/login",
    siteName: "HRA Airlines",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | HRA Airlines",
    description:
      "Access your HRA Airlines account—manage bookings, view tickets, and more.",
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      {children}
    </main>
  );
}
