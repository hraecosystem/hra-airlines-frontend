"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const featuredDestinations = [
  {
    city: "Paris",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=90",
  },
  {
    city: "Dubai",
    image:
      "https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=2000&q=90",
  },
  {
    city: "New York",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2000&q=90",
  },
  {
    city: "Tokyo",
    image:
      "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=2000&q=90",
  },
];

type HeroSectionProps = {
  backgroundOnly?: boolean;
  thumbnailsOnly?: boolean;
  currentIndex?: number;
  setCurrentIndex?: (val: number) => void;
};

export default function HeroSection({
  backgroundOnly,
  thumbnailsOnly,
  currentIndex,
  setCurrentIndex,
}: HeroSectionProps) {
  const [localIndex, setLocalIndex] = useState(0);

  // Auto‑rotate
  useEffect(() => {
    const iv = setInterval(() => {
      setLocalIndex((i) => (i + 1) % featuredDestinations.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const activeIndex = currentIndex ?? localIndex;
  const changeIndex = setCurrentIndex ?? setLocalIndex;

  if (backgroundOnly) {
    const { image, city } = featuredDestinations[activeIndex];
    return (
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={`View of ${city}`}
          fill
          sizes="100vw"
          priority
          className="object-cover transition-opacity duration-1000 ease-in-out"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>
    );
  }

  if (thumbnailsOnly) {
    return (
      <div className="w-full z-10 px-4 pt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredDestinations.map((dest, idx) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: idx === activeIndex ? 1 : 0.6 }}
              animate={{
                opacity: idx === activeIndex ? 1 : 0.6,
                scale: idx === activeIndex ? 1 : 0.95,
              }}
              transition={{ duration: 0.4 }}
              onClick={() => changeIndex(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") changeIndex(idx);
              }}
              className={`relative overflow-hidden rounded-2xl cursor-pointer shadow-lg ring-1 ring-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500`}
            >
              <Image
                src={dest.image}
                alt={dest.city}
                width={300}
                height={180}
                sizes="(max-width: 640px) 50vw, 25vw"
                loading="lazy"
                className="object-cover w-full h-[120px] sm:h-[140px] transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-medium">{dest.city}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
