// app/offers/page.tsx
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import { useState } from "react";

interface Offer {
  title: string;
  description: string;
  code: string;
  image: string;
  validUntil: string;
  discount: string;
  category: string;
}

const OFFERS: Offer[] = [
  {
    title: "Dubai → London",
    description:
      "Enjoy discounted fares on all direct flights to London. Limited seats available!",
    code: "HRAUK20",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    validUntil: "April 30th, 2024",
    discount: "20% OFF",
    category: "Europe"
  },
  {
    title: "Maldives Special",
    description:
      "Fly to Maldives with exclusive HRA packages. Includes taxes & meals.",
    code: "HRAMAL499",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    validUntil: "May 15th, 2024",
    discount: "$499",
    category: "Asia"
  },
  {
    title: "Business Class Upgrade",
    description:
      "Upgrade to business class with just $150 extra on selected international flights.",
    code: "HRAEXEC",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
    validUntil: "June 30th, 2024",
    discount: "$150",
    category: "Premium"
  },
];

export default function OffersPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredOffers = selectedCategory === "All" 
    ? OFFERS 
    : OFFERS.filter(offer => offer.category === selectedCategory);

  return (
    <>
      <Head>
        <title>Special Offers | HRA Airlines</title>
        <meta
          name="description"
          content="Discover HRA Airlines' limited-time flight deals. Save on Premium Economy, Business Class, and more!"
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
              alt="Luxury travel experience"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80" />
          </div>
          <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Special Offers
            </h1>
            <p className="text-xl text-white/90">
              Discover exclusive flight deals and limited‑time promotions
            </p>
          </div>
        </section>

        {/* Offers Section */}
        <section className="py-16 px-6 sm:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-12 justify-center">
              {["All", "Europe", "Asia", "Premium"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full transition ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:text-blue-600 shadow-sm hover:shadow-md"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOffers.map((offer, idx) => (
                <motion.div
                  key={idx}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                    {/* Image */}
                    <div className="relative h-48">
                      <Image
                        src={offer.image}
                        alt={offer.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {offer.discount}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">
                          {offer.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {offer.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4">
                        {offer.description}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Calendar className="w-4 h-4" />
                        <span>Valid until {offer.validUntil}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-mono bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">
                          {offer.code}
                        </span>
                        <Link
                          href={`/search?promo=${offer.code}`}
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Book Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Newsletter Section */}
            <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-8 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  Never Miss a Deal!
                </h2>
                <p className="mb-4 sm:mb-6 text-white/90 text-sm sm:text-base">
                  Subscribe to our newsletter and be the first to know about our exclusive offers and promotions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg text-white placeholder-white/70 bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button className="w-full sm:w-auto bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
