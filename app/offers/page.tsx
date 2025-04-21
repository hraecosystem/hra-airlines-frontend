// app/offers/page.tsx
"use client";

import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";

interface Offer {
  title: string;
  description: string;
  code: string;
}

const OFFERS: Offer[] = [
  {
    title: "✈️ Dubai → London – Flat 20% Off",
    description:
      "Enjoy discounted fares on all direct flights to London. Valid till April 30th. Limited seats available!",
    code: "HRAUK20",
  },
  {
    title: "🌴 Maldives Special – Round Trip at $499",
    description:
      "Fly to Maldives with exclusive HRA packages. Includes taxes & meals. Book before May 15th!",
    code: "HRAMAL499",
  },
  {
    title: "💼 Business Class Bonanza",
    description:
      "Upgrade to business class with just $150 extra on selected international flights. Only for members!",
    code: "HRAEXEC",
  },
];

export default function OffersPage() {
  return (
    <>
      <Head>
        <title>Special Offers | HRA Airlines</title>
        <meta
          name="description"
          content="Discover HRA Airlines’ limited-time flight deals. Save on Premium Economy, Business Class, and more!"
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6 sm:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4">
              ✨ Special Offers
            </h1>
            <p className="text-gray-600 text-lg">
              Discover exclusive flight deals and limited‑time promotions. Book early and save more with HRA Airlines!
            </p>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {OFFERS.map((offer, idx) => (
              <motion.div
                key={idx}
                className="h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)" }}
              >
                <div className="flex flex-col justify-between h-full bg-white rounded-2xl shadow-lg p-6 transition-colors">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">
                      {offer.title}
                    </h3>
                    <p className="text-gray-700 mb-4 flex-grow">
                      {offer.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-mono bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                      Code: {offer.code}
                    </span>
                    <Link
                      href={`/search?promo=${offer.code}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
