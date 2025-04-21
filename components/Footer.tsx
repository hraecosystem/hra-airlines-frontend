"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 mt-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">About HRA Airlines</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Redefining travel with modern aircraft, seamless bookings, and personalized service. Whether for business or leisure, fly smarter with HRA Airlines.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/destinations", label: "Destinations" },
                { href: "/offers", label: "Special Offers" },
                { href: "/contact", label: "Contact Us" },
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-pink-500 transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Get in Touch</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-pink-500" />
                <span>123 Airline St, Skyview Tower, Paris, France</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-500" />
                <a href="tel:+33123456789" className="hover:text-white transition">
                  +33 (0)1 23 45 67 89
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-500" />
                <a href="mailto:contact@hra-airlines.com" className="hover:text-white transition">
                  contact@hra-airlines.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Follow Us</h3>
            <div className="flex gap-4">
              {[
                { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
                { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
                { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
                { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-gray-400 hover:text-pink-500 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p className="text-center md:text-left">&copy; {currentYear} HRA Airlines. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4 justify-center md:justify-end">
            <Link href="/terms" className="hover:text-pink-500 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-pink-500 transition">Privacy</Link>
            <Link href="/faq" className="hover:text-pink-500 transition">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
