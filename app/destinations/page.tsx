// app/destinations/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plane, Star } from "lucide-react";

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
<<<<<<< Updated upstream
=======
  {
    name: "Italy",
    code: "IT",
    image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80",
    description: "Home of incredible cuisine, art, and ancient history.",
    capital: "Rome",
    popular: false
  },
  {
    name: "Spain",
    code: "ES",
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80",
    description: "Vibrant culture, passionate people, and stunning architecture.",
    capital: "Madrid",
    popular: false
  },
];

const hotels = [
  // France
  {
    name: "Le Grand Paris Hotel",
    country: "FR",
    location: "Paris",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    description: "Luxury accommodations with a stunning view of the Eiffel Tower.",
    stars: 5,
    price: "€145"
  },
  {
    name: "Château de Loire",
    country: "FR",
    location: "Loire Valley",
    image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80",
    description: "Experience royalty in this converted castle hotel surrounded by vineyards.",
    stars: 4,
    price: "€135"
  },
  {
    name: "Côte d'Azur Resort",
    country: "FR",
    location: "Nice",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Beachfront luxury on the French Riviera.",
    stars: 5,
    price: "€150"
  },
  
  // UAE
  {
    name: "Burj Al Arab",
    country: "UAE",
    location: "Dubai",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
    description: "The world's most luxurious hotel with seven-star service.",
    stars: 7,
    price: "$150"
  },
  {
    name: "Emirates Palace",
    country: "UAE",
    location: "Abu Dhabi",
    image: "https://images.unsplash.com/photo-1573113464795-7b6060fdc4c0?auto=format&fit=crop&w=800&q=80",
    description: "Opulent accommodations fit for royalty.",
    stars: 5,
    price: "$140"
  },
  
  // Arabie Saoudite
  {
    name: "Ritz-Carlton Riyadh",
    country: "SA",
    location: "Riyadh",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    description: "Palatial luxury and impeccable service in the heart of the capital.",
    stars: 5,
    price: "SAR 150"
  },
  {
    name: "Jeddah Rosewood",
    country: "SA",
    location: "Jeddah",
    image: "https://images.unsplash.com/photo-1631049035182-249067d7618e?auto=format&fit=crop&w=800&q=80",
    description: "Waterfront elegance on the Red Sea with breathtaking views.",
    stars: 5,
    price: "SAR 145"
  },
  
  // Maroc
  {
    name: "La Mamounia",
    country: "MA",
    location: "Marrakech",
    image: "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?auto=format&fit=crop&w=800&q=80",
    description: "Legendary palace hotel with lush gardens and traditional Moroccan design.",
    stars: 5,
    price: "MAD 135"
  },
  {
    name: "Kasbah Tamadot",
    country: "MA",
    location: "Atlas Mountains",
    image: "https://images.unsplash.com/photo-1570214476695-19bd467e6f7a?auto=format&fit=crop&w=800&q=80",
    description: "Richard Branson's mountain retreat with spectacular views.",
    stars: 5,
    price: "MAD 150"
  },
  {
    name: "Riad Fès",
    country: "MA",
    location: "Fès",
    image: "https://images.unsplash.com/photo-1530968033775-2c92736b131e?auto=format&fit=crop&w=800&q=80",
    description: "Authentic riad experience in the ancient medina of Fès.",
    stars: 5,
    price: "MAD 120"
  },
  
  // Turkey
  {
    name: "Four Seasons Bosphorus",
    country: "TR",
    location: "Istanbul",
    image: "https://images.unsplash.com/photo-1573321683647-5940139216e4?auto=format&fit=crop&w=800&q=80",
    description: "Ottoman palace converted to luxury hotel on the Bosphorus strait.",
    stars: 5,
    price: "₺145"
  },
  {
    name: "Cappadocia Cave Resort",
    country: "TR",
    location: "Cappadocia",
    image: "https://images.unsplash.com/photo-1575488113217-120c6b249f21?auto=format&fit=crop&w=800&q=80",
    description: "Unique accommodations built into the region's famous caves.",
    stars: 4,
    price: "₺120"
  },
  
  // Grèce
  {
    name: "Apanemo Hotel & Suites",
    country: "GR",
    location: "Santorini",
    image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80",
    description: "Elegant suites with stunning caldera views in the iconic island of Santorini.",
    stars: 5,
    price: "€150"
  },
  {
    name: "Grande Bretagne",
    country: "GR",
    location: "Athens",
    image: "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80",
    description: "Historic luxury hotel overlooking the Acropolis and Syntagma Square.",
    stars: 5,
    price: "€140"
  },
  {
    name: "Blue Palace Resort",
    country: "GR",
    location: "Crete",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Beachfront luxury with private pools and Mediterranean views.",
    stars: 5,
    price: "€130"
  },
  
  // Italy
  {
    name: "Hotel Hassler Roma",
    country: "IT",
    location: "Rome",
    image: "https://images.unsplash.com/photo-1560233069-902238bd8a8a?auto=format&fit=crop&w=800&q=80",
    description: "Legendary luxury hotel at the top of the Spanish Steps.",
    stars: 5,
    price: "€145"
  },
  {
    name: "Gritti Palace",
    country: "IT",
    location: "Venice",
    image: "https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?auto=format&fit=crop&w=800&q=80",
    description: "Historic palace on the Grand Canal with stunning views.",
    stars: 5,
    price: "€150"
  },
  
  // Spain
  {
    name: "Hotel Arts Barcelona",
    country: "ES",
    location: "Barcelona",
    image: "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?auto=format&fit=crop&w=800&q=80",
    description: "Iconic beachfront hotel with panoramic Mediterranean views.",
    stars: 5,
    price: "€140"
  },
  {
    name: "Alhambra Palace",
    country: "ES",
    location: "Granada",
    image: "https://images.unsplash.com/photo-1585361779627-a583b9436734?auto=format&fit=crop&w=800&q=80",
    description: "Historic hotel with views of the famous Alhambra fortress.",
    stars: 4,
    price: "€125"
  },
>>>>>>> Stashed changes
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
<<<<<<< Updated upstream
                  <Link
                    href={{
                      pathname: "/",
                      query: { destination: dest.code } }}
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
=======
                  ← Back to Countries
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="wait">
                  {countryHotels.map((hotel, idx) => (
                    <motion.div
                      key={hotel.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                      <div className="relative h-56">
                        <Image
                          src={hotel.image}
                          alt={hotel.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={idx < 3}
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                          {[...Array(hotel.stars)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {hotel.name}
                          </h3>
                          <span className="text-sm font-semibold text-blue-600">
                            {hotel.price}/night
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          {hotel.location}
                        </div>
                        <p className="text-gray-600 mb-4">
                          {hotel.description}
                        </p>
                        <Link
                          href="https://hra-experience.com"
                          target="_blank"
                          className="inline-flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                          <Building className="w-4 h-4 mr-2" />
                          Book this Hotel
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {countryHotels.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hotels found for this country.</p>
                </div>
              )}
>>>>>>> Stashed changes
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
