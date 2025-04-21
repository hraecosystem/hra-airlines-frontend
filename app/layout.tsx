import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevents layout shift (FOUT fix)
  weight: ["400", "600", "700"],
  variable: "--font-inter", // Optional: use with Tailwind config
});

export const metadata: Metadata = {
  title: {
    default: "HRA Airlines",
    template: "%s | HRA Airlines",
  },
  description: "Book flights, manage your bookings, and enjoy exclusive offers with HRA Airlines.",
  keywords: [
    "HRA Airlines",
    "Book Flights",
    "Air Tickets",
    "Cheap Flights",
    "Travel Deals",
    "Flight Booking UAE",
    "HRA Air",
  ],
  robots: "index, follow",
  authors: [{ name: "HRA Airlines Team", url: "https://hra-airlines.com" }],
  creator: "HRA Airlines",
  metadataBase: new URL("https://hra-airlines.com"),
  openGraph: {
    title: "HRA Airlines",
    description: "Fly better with HRA Airlines — your ultimate travel partner.",
    url: "https://hra-airlines.com",
    siteName: "HRA Airlines",
    images: [
      {
        url: "https://hra-airlines.com/og-image.jpg", // Replace with your hosted OG image
        width: 1200,
        height: 630,
        alt: "HRA Airlines",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <AuthProvider>
          <Navbar />
          <main className="pt-20 min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
