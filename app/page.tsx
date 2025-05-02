"use client";

import React from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FlightSearchWidget from "@/components/FlightSearchWidget";
import PromotionalSlider from "@/components/PromotionalSlider";
import PopularDestinations from "@/components/PopularDestinations";
import Link from "next/link";

const features = [
  {
    icon: "💳",
    title: "Secure Payments",
    description: "Your payment info is always protected with industry-leading encryption.",
  },
  {
    icon: "🏆",
    title: "Best Price Guarantee",
    description: "We ensure unbeatable fares across all destinations.",
  },
  {
    icon: "🤝",
    title: "24/7 Customer Support",
    description: "Travel experts available anytime you need assistance.",
  },
] as const;

const testimonials = [
  {
    quote: "“Booked last minute and everything was smooth! Will fly again!”",
    author: "Sarah K.",
  },
  {
    quote: "“Fantastic support during our international trip. 5 stars!”",
    author: "Adeel R.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="flex flex-col bg-white text-gray-800">
      {/* ===== HERO ===== */}
      <section
        id="hero"
        aria-labelledby="hero-heading"
        className="relative w-full min-h-screen overflow-hidden"
      >
        {/* Full-screen background carousel */}
        <HeroSection backgroundOnly />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <motion.h1
            id="hero-heading"
            className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Discover the World with HRA Airlines
          </motion.h1>

          <motion.div
            className="mt-8 w-full max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <FlightSearchWidget />
          </motion.div>

          {/* Thumbnail preview */}
          <div className="mt-12 w-full max-w-5xl">
            <HeroSection thumbnailsOnly />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        aria-labelledby="features-heading"
        className="bg-gray-50 py-16 px-4"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-3">
          <h2 id="features-heading" className="sr-only">
            Key Features
          </h2>
          {features.map(({ icon, title, description }, idx) => (
            <motion.article
              key={title}
              className="flex flex-col items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-shadow hover:shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl">{icon}</div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ===== TOP OFFERS ===== */}
      <section aria-labelledby="offers-heading" className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2
            id="offers-heading"
            className="mb-8 text-3xl font-bold text-gray-900"
          >
            Top Offers
          </h2>
          <PromotionalSlider />
        </div>
      </section>

      {/* ===== POPULAR DESTINATIONS ===== */}
      <section
        aria-labelledby="destinations-heading"
        className="bg-gray-50 py-16 px-4"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="destinations-heading"
            className="mb-8 text-3xl font-bold text-gray-900"
          >
            Popular Destinations
          </h2>
          <PopularDestinations />
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section
        aria-labelledby="testimonials-heading"
        className="py-16 px-4"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2
            id="testimonials-heading"
            className="mb-4 text-3xl font-bold text-gray-900"
          >
            What Our Travelers Say
          </h2>
          <p className="mb-12 text-gray-600">
            Real stories from our valued passengers around the world.
          </p>
          <div className="space-y-10">
            {testimonials.map(({ quote, author }, idx) => (
              <motion.blockquote
                key={author}
                className="mx-auto max-w-2xl border-l-4 border-pink-500 pl-6 italic text-gray-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <p>{quote}</p>
                <footer className="mt-2 text-sm font-medium text-gray-900">
                  — {author}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section className="bg-gradient-to-br from-pink-600 to-purple-600 py-24 px-4 text-white">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Fly?</h2>
          <p className="mb-6 text-lg text-white/90">
            Get the best flight deals, personalized experiences, and priority support with HRA Airlines.
          </p>
          <Link
            href="#hero"
            scroll={false}
            className="inline-block rounded-md bg-white px-6 py-3 text-lg font-semibold text-pink-600 transition hover:bg-gray-200"
            aria-label="Scroll back to search"
          >
            Start Exploring
          </Link>
        </div>
      </section>
    </main>
  );
}
