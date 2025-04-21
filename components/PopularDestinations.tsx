"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type Destination = {
  city: string;
  country: string;
  image: string;
  href: string; // link to search or detail page
};

const destinations: Destination[] = [
  {
    city: "Paris",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    href: "/search-results?dest=Paris",
  },
  {
    city: "New York",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    href: "/search-results?dest=New%20York",
  },
  {
    city: "Tokyo",
    country: "Japan",
    image:
      "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80",
    href: "/search-results?dest=Tokyo",
  },
  {
    city: "Dubai",
    country: "UAE",
    image:
      "https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=800&q=80",
    href: "/search-results?dest=Dubai",
  },
];

export default function PopularDestinations() {
  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          ✈️ Popular Destinations
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((dest, idx) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              className="relative overflow-hidden rounded-2xl shadow-lg bg-white"
            >
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={dest.image}
                  alt={`${dest.city}, ${dest.country}`}
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out"
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                  priority={idx < 2}
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-start">
                <h3 className="text-xl font-semibold text-white drop-shadow">
                  {dest.city}
                </h3>
                <p className="text-sm text-gray-200 mb-3 drop-shadow">
                  {dest.country}
                </p>
                <Link
                  href={dest.href}
                  className="inline-block bg-white text-gray-800 font-medium text-sm px-4 py-2 rounded-full shadow hover:bg-gray-100 transition"
                >
                  View Flights
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
