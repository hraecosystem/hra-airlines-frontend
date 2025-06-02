"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plane,
  MapPin,
  Gift,
  Phone,
  Info,
  HelpCircle,
  Hotel,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "Home", href: "/", icon: Plane },
    { label: "Destinations", href: "/destinations", icon: MapPin },
    { label: "Offers", href: "/offers", icon: Gift },
    { label: "Contact", href: "/contact", icon: Phone },
    { label: "About", href: "/about", icon: Info },
    { label: "FAQs", href: "/faqs", icon: HelpCircle },
    { label: "Hotels", href: "https://hra-experience.com", icon: Hotel, external: true },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-300 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Logo and Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <Link href="/" className="inline-block mb-6 transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo-hra.png"
                alt="HRA Airlines"
                width={180}
                height={45}
                className="h-12 w-auto brightness-0 invert hover:brightness-100 transition-all duration-300"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              HRA Airlines is committed to providing exceptional air travel
              experiences with safety, comfort, and reliability.
            </p>
          </motion.div>

          {/* Navigation Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {navLinks.map(({ label, href, icon: Icon, external }, index) => (
              <Link
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex items-center text-gray-300 hover:text-white transition-all duration-300"
              >
                <div className="relative flex items-center">
                  <Icon className="w-4 h-4 mr-3 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                  <span className="relative">
                    {label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>

          {/* Social Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center md:text-left"
          >
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              Follow Us
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-blue-400" />
            </h3>
            <div className="flex justify-center md:justify-start space-x-6">
              {[
                { icon: Facebook, href: "https://facebook.com" },
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Instagram, href: "https://instagram.com" },
                { icon: () => (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-300 transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12a9 9 0 0 0 9 9" />
                    <path d="M9 3a9 9 0 0 1 9 9" />
                    <path d="M8.5 20.5L14 13l-5.5-7.5" />
                    <path d="M14 13h7" />
                    <path d="M14 13H7" />
                  </svg>
                ), href: "https://tiktok.com" },
              ].map(({ icon: Icon, href }, index) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className="relative z-10 p-2 rounded-full bg-gray-800/50 backdrop-blur-sm group-hover:bg-blue-500/20 transition-all duration-300">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-gray-800/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} HRA Airlines. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

