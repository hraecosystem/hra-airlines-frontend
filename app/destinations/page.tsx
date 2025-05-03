// app/destinations/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Plane, Star } from "lucide-react";

const destinations = [
  {
    name: "Paris, France",
    code: "PAR",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    description: "The City of Light awaits with its iconic landmarks and romantic charm.",
    rating: 4.8,
    flights: "Daily flights from Dubai"
  },
  {
    name: "Dubai, UAE",
    code: "DXB",
    image: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=800&q=80",
    description: "Experience luxury and innovation in this futuristic metropolis.",
    rating: 4.9,
    flights: "Hub airport with global connections"
  },
  {
    name: "Tokyo, Japan",
    code: "TYO",
    image: "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80",
    description: "Where tradition meets technology in perfect harmony.",
    rating: 4.7,
    flights: "Daily flights from Dubai"
  },
  {
    name: "New York, USA",
    code: "NYC",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    description: "The city that never sleeps offers endless possibilities.",
    rating: 4.8,
    flights: "Daily flights from Dubai"
  },
  {
    name: "Istanbul, Turkey",
    code: "IST",
    image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80",
    description: "A magical blend of European and Asian cultures.",
    rating: 4.6,
    flights: "Daily flights from Dubai"
  },
  {
    name: "Bali, Indonesia",
    code: "DPS",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    description: "Paradise found with pristine beaches and rich culture.",
    rating: 4.9,
    flights: "Daily flights from Dubai"
  },
];

export default function DestinationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");

  const regions = ["All", "Europe", "Asia", "Middle East", "Americas"];

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "All" || 
      (selectedRegion === "Europe" && dest.name.includes("Paris")) ||
      (selectedRegion === "Asia" && (dest.name.includes("Tokyo") || dest.name.includes("Bali"))) ||
      (selectedRegion === "Middle East" && dest.name.includes("Dubai")) ||
      (selectedRegion === "Americas" && dest.name.includes("New York"));
    return matchesSearch && matchesRegion;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
            alt="World map background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80" />
        </div>
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Explore Destinations
          </h1>
          <p className="text-xl text-white/90">
            Discover world-class cities and breathtaking views with HRA Airlines
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                    selectedRegion === region
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Destinations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {filteredDestinations.map((dest, idx) => (
                <motion.div
                  key={dest.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <Link
                    href={{
                      pathname: "/",
                      query: { destination: dest.code },
                    }}
                    className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
                  >
                    <div className="relative h-56">
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={idx < 3}
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{dest.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900">
                          {dest.name}
                        </h2>
                        <span className="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {dest.code}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {dest.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Plane className="w-4 h-4 mr-1" />
                        {dest.flights}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No destinations found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
