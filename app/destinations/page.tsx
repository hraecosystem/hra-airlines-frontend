// app/destinations/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const destinations = [
  {
    name: "Paris, France",
    code: "PAR",
    image: "https://source.unsplash.com/featured/?paris,eiffel",
  },
  {
    name: "Dubai, UAE",
    code: "DXB",
    image: "https://source.unsplash.com/featured/?dubai,burj",
  },
  {
    name: "Tokyo, Japan",
    code: "TYO",
    image: "https://source.unsplash.com/featured/?tokyo,japan",
  },
  {
    name: "New York, USA",
    code: "NYC",
    image: "https://source.unsplash.com/featured/?newyork,skyline",
  },
  {
    name: "Istanbul, Turkey",
    code: "IST",
    image: "https://source.unsplash.com/featured/?istanbul,mosque",
  },
  {
    name: "Bali, Indonesia",
    code: "DPS",
    image: "https://source.unsplash.com/featured/?bali,beach",
  },
];

export default function DestinationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          🌍 Explore Destinations
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Discover world-class cities and breathtaking views with HRA Airlines. Tap any card to start your search.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {destinations.map((dest, idx) => (
            <motion.div
              key={dest.code}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative rounded-xl overflow-hidden shadow-lg bg-white"
            >
              <Link
                href={{
                  pathname: "/",
                  query: { destination: dest.code },
                }}
                className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {dest.name}
                  </h2>
                  <p className="mt-1 text-gray-600 text-sm">
                    Daily flights • Book now →
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-16 text-sm text-gray-500">
          Looking for more destinations? Stay tuned—we’re expanding our network every month!
        </p>
      </div>
    </main>
  );
}
