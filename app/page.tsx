"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plane, Globe2, Shield, Headset, ArrowRight, Star, Users, Award, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import FlightSearchWidget from "@/components/FlightSearchWidget";

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState({
    hotel1: 0,
    hotel2: 0
  });

  const hotelImages = {
    hotel1: [
      "/hotel1.jpeg",
      "/hotel1.1.jpeg",
      "/hotel1.2.jpeg",
      "/hotel1.3.jpeg"
    ],
    hotel2: [
      "/hotel2.jpeg",
      "/hotel2.1.jpeg",
      "/hotel2.2.jpeg",
      "/hotel2.3.jpeg",
      "/hotel2.4.jpeg",
      "/hotel2.5.jpeg",
      "/hotel2.6.jpeg",
      "/hotel2.7.jpeg"
    ]
  };

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => ({
        hotel1: (prev.hotel1 + 1) % hotelImages.hotel1.length,
        hotel2: (prev.hotel2 + 1) % hotelImages.hotel2.length
      }));
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const nextImage = (hotelKey: 'hotel1' | 'hotel2') => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [hotelKey]: (prev[hotelKey] + 1) % hotelImages[hotelKey].length
    }));
  };

  const prevImage = (hotelKey: 'hotel1' | 'hotel2') => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [hotelKey]: prev[hotelKey] === 0 ? hotelImages[hotelKey].length - 1 : prev[hotelKey] - 1
    }));
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-24 md:pt-32 pb-40 md:pb-40 mb-16 md:mb-0">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
            alt="Beautiful airplane flying over clouds"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-900/60" />
        </div>
        <div style={{padding: "1em"}} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-16">
          <div className="text-center text-white mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-6xl font-bold mb-6"
            >
              <span className="text-white !important">Explore the World with HRA Airlines</span>
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            
          >
            <FlightSearchWidget />
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose HRA Airlines?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of comfort, safety, and exceptional service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Plane className="w-12 h-12 text-blue-600" />,
                title: "Modern Fleet",
                description: "Travel in comfort with our state-of-the-art aircraft",
              },
              {
                icon: <Shield className="w-12 h-12 text-blue-600" />,
                title: "Safety First",
                description: "Your safety is our top priority with rigorous standards",
              },
              {
                icon: <Headset className="w-12 h-12 text-blue-600" />,
                title: "24/7 Support",
                description: "Our dedicated team is always here to assist you",
              },
              {
                icon: <Globe2 className="w-12 h-12 text-blue-600" />,
                title: "Global Network",
                description: "Connect to major destinations worldwide",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 !important">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most sought-after destinations with exclusive HRA Airlines offers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                image: hotelImages.hotel1[currentImageIndex.hotel1],
                title: "Villa Manos Santorini",
                location: "Santorini, Greece",
                description: "A luxury villa with panoramic views of the caldera",
                basePrice: 200,
                cardPrice: 170,
                stars: 5,
                badge: "New Offer"
              },
              {
                image: hotelImages.hotel2[currentImageIndex.hotel2],
                title: "Apanemo Hotel & Suites",
                location: "Santorini, Greece",
                description: "Elegant suites with breathtaking views of the caldera",
                basePrice: 150,
                cardPrice: 127,
                stars: 5,
                badge: "New Offer"
              }
            ].map((destination, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative h-[500px] rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Image
                  src={destination.image}
                  alt={destination.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                
                {/* Navigation Controls */}
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      prevImage(index === 0 ? 'hotel1' : 'hotel2');
                    }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      nextImage(index === 0 ? 'hotel1' : 'hotel2');
                    }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Image Indicators */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {(index === 0 ? hotelImages.hotel1 : hotelImages.hotel2).map((_, imgIndex) => (
                    <button
                      key={imgIndex}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(prev => ({
                          ...prev,
                          [index === 0 ? 'hotel1' : 'hotel2']: imgIndex
                        }));
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        (index === 0 ? currentImageIndex.hotel1 : currentImageIndex.hotel2) === imgIndex
                          ? 'bg-white scale-125'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute top-4 right-4">
                  <span className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-full animate-pulse">
                    {destination.badge}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(destination.stars)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{destination.title}</h3>
                  <div className="flex items-center text-blue-100 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {destination.location}
                  </div>
                  <p className="text-blue-100 mb-6">{destination.description}</p>
                  
                  <Link
                    href="/destinations"
                    className="inline-flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Book Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HRA Card Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #1e40af 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-gray-900"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Get Your HRA Card
              </h2>
              <div className="space-y-6">
                <p className="text-xl text-gray-600">
                  Save money on all your flights with the HRA Airlines card.
                </p>
                <ul className="space-y-4">
                  {[
                    "15% off on all flights worldwide"
                  ].map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-lg text-gray-700">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="pt-6"
                >
                  <Link
                    href="https://hra-epay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                  >
                    Apply Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Content - Card Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative w-full aspect-[1.586] max-w-sm mx-auto">
                <Image
                  src="/hra-experience-card.png"
                  alt="HRA Airlines Experience Card"
                  fill
                  className="object-contain drop-shadow-xl"
                />
                {/* Static Badge */}
                <div className="absolute -top-3 -right-3 bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold text-xs">
                  -15% OFF
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users className="w-12 h-12" />, value: "50K+", label: "Happy Passengers" },
              { icon: <Globe2 className="w-12 h-12" />, value: "25+", label: "Destinations" },
              { icon: <Award className="w-12 h-12" />, value: "3+", label: "Years of Excellence" },
              { icon: <Star className="w-12 h-12" />, value: "4.2/5", label: "Customer Rating" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
