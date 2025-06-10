// components/Navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Plane,
  MapPin,
  Gift,
  Phone,
  Info,
  HelpCircle,
  Hotel,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import CurrencySelector from "./ui/CurrencySelector";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <style jsx global>{`
        .sign-in-button {
          color: white !important;
        }
        .sign-in-button:hover {
          color: white !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-hra.png"
              alt="HRA Airlines"
              width={160}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center space-x-8">
            {navLinks.map(({ label, href, icon: Icon, external }) => (
              <Link
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex items-center text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200 no-underline"
              >
                <Icon className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                {label}
              </Link>
            ))}

            {/* Currency Selector */}
            <CurrencySelector />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((o) => !o)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="User menu"
                >
                  <User size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-600" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User size={16} className="mr-2" /> Profile
                      </Link>
                      <Link
                        href="/dashboard/bookings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard size={16} className="mr-2" /> My Bookings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <LogOut size={16} className="mr-2" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                style={{ color: '#ffffff', backgroundColor: '#2563eb' }}
              >
                <span style={{ color: '#ffffff' }}>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-white border-t border-gray-200 shadow-md"
          >
            <div className="px-4 py-6 space-y-6 flex flex-col items-center">
              {navLinks.map(({ label, href, icon: Icon, external }) => (
                <Link
                  key={href}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-center text-gray-800 hover:text-blue-600 font-medium text-base w-full no-underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </Link>
              ))}

              {/* Currency Selector for Mobile */}
              <div className="w-full flex justify-center py-2">
                <CurrencySelector />
              </div>

              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center justify-center text-gray-800 hover:text-blue-600 w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/bookings"
                    className="flex items-center justify-center text-gray-800 hover:text-blue-600 w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center text-red-600 text-left font-medium w-full"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center w-full max-w-xs"
                  style={{ color: '#ffffff', backgroundColor: '#2563eb' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span style={{ color: '#ffffff' }}>Sign In</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
