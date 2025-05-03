// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "HRA Airlines",
    template: "%s | HRA Airlines",
  },
  description:
    "Book flights, manage bookings, and enjoy exclusive offers with HRA Airlines.",
  viewport: "width=device-width, initial-scale=1",
  alternates: { canonical: "https://hra-airlines.com" },
  openGraph: {
    title:       "HRA Airlines",
    description:
      "Fly better with HRA Airlines — your ultimate travel partner.",
    url:         "https://hra-airlines.com",
    siteName:    "HRA Airlines",
    images: [
      {
        url:    "https://hra-airlines.com/og-image.jpg",
        width:  1200,
        height: 630,
        alt:    "HRA Airlines",
      },
    ],
    locale: "en_US",
    type:   "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "HRA Airlines",
    description:
      "Book flights, manage bookings, and enjoy exclusive offers with HRA Airlines.",
    site:        "@HRA_Airlines",
    creator:     "@HRA_Airlines",
    images:      ["https://hra-airlines.com/og-image.jpg"],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Character Encoding */}
        <meta charSet="utf-8" />

        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* Google Tag Manager */}
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `,
          }}
        />
      </head>

      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-800`}
        suppressHydrationWarning={true}
      >
        {/* GTM no-script fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <AuthProvider>
          {/* Skip link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only p-2 bg-blue-600 text-white fixed top-2 left-2 rounded"
          >
            Skip to content
          </a>

          {/* Site header */}
          <Navbar />

          {/* Main content */}
          <main id="main-content" className="pt-20 min-h-screen">
            {children}
          </main>

          {/* Site footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
