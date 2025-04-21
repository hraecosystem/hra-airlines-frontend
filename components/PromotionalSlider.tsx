"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PromotionalSlider() {
  const promotions = [
    {
      title: "Summer Special",
      description: "Get 20% off on flights to Europe.",
      bg: "from-pink-600 via-purple-600 to-blue-600",
    },
    {
      title: "Family Travel Deals",
      description: "Save up to 25% on family bookings.",
      bg: "from-emerald-500 via-teal-500 to-cyan-500",
    },
    {
      title: "Weekend Getaways",
      description: "Enjoy quick breaks with exclusive offers.",
      bg: "from-orange-500 via-red-500 to-pink-500",
    },
    {
      title: "Asia on Sale",
      description: "Flat 30% off on selected Asian destinations.",
      bg: "from-indigo-500 via-blue-500 to-sky-500",
    },
  ];

  return (
    <section className="bg-white rounded-xl shadow-lg px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Top Deals</h2>

      <div className="flex overflow-x-auto snap-x snap-mandatory space-x-6 scrollbar-hide pb-2">
        {promotions.map((promo, idx) => (
          <motion.div
            key={idx}
            className={`min-w-[280px] snap-center rounded-xl p-6 text-white bg-gradient-to-r ${promo.bg} shadow-lg relative overflow-hidden flex flex-col justify-between transition-transform duration-300 hover:scale-105`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-1">{promo.title}</h3>
              <p className="text-sm text-white/90">{promo.description}</p>
            </div>
            <button className="mt-4 self-start px-4 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition">
              Book Now
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
