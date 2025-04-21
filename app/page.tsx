"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FlightSearchWidget from "@/components/FlightSearchWidget";
import PromotionalSlider from "@/components/PromotionalSlider";
import PopularDestinations from "@/components/PopularDestinations";

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);

  return (
    <main className="flex flex-col bg-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[110vh]">
        <HeroSection backgroundOnly />

        <div className="relative z-10 flex flex-col items-center text-white text-center px-4 pt-36 sm:pt-40">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Discover the World with HRA Airlines
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-full max-w-5xl"
          >
            <FlightSearchWidget />
          </motion.div>

          <div className="mt-12 sm:mt-16 w-full">
            <HeroSection thumbnailsOnly />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            "💳 Secure Payments",
            "🏆 Best Price Guarantee",
            "🤝 24/7 Customer Support"
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl mb-2">{feature.split(" ")[0]}</div>
              <h4 className="text-lg font-semibold text-hra-dark">
                {feature.split(" ").slice(1).join(" ")}
              </h4>
              <p className="mt-2 text-gray-600">
                {i === 0
                  ? "Your payment info is always protected."
                  : i === 1
                  ? "We ensure unbeatable prices across all destinations."
                  : "Talk to our travel experts anytime you need."}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DEALS SECTION */}
      <section className="bg-white px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-hra-dark mb-8">Top Offers</h2>
          <PromotionalSlider />
        </div>
      </section>

      {/* DESTINATIONS SECTION */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-hra-dark mb-8">Popular Destinations</h2>
          <PopularDestinations />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-hra-dark mb-4">What Our Travelers Say</h2>
          <p className="text-gray-600 mb-12">
            Real stories from our valued passengers around the world.
          </p>
          <div className="space-y-10">
            {[
              "\u201cBooked last minute and everything was smooth! Will fly again!\u201d",
              "\u201cFantastic support during our international trip. 5 stars!\u201d"
            ].map((quote, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="border-l-4 border-hra-pink pl-6 italic text-gray-700"
              >
                <p>{quote}</p>
                <footer className="mt-2 text-sm font-medium text-hra-dark">
                  {i === 0 ? "– Sarah K." : "– Adeel R."}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-br from-pink-600 to-purple-600 text-white py-24 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Fly?</h2>
          <p className="mb-6 text-white/90">
            Get the best flight deals, personalized experiences, and priority support with HRA.
          </p>
          <button
            className="bg-white text-pink-600 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Start Exploring
          </button>
        </div>
      </section>
    </main>
  );
}