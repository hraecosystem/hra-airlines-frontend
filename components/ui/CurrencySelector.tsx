"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency, CurrencyCode } from '@/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CurrencySelector() {
  const { currencyCode, setCurrencyCode, availableCurrencies, currencyInfo } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (currency: CurrencyCode) => {
    setCurrencyCode(currency);
    setIsOpen(false);
  };

  // Get currency info for the current code
  const getCurrencyInfo = (code: CurrencyCode) => {
    return CURRENCY_DATA[code];
  };

  // Import CURRENCY_DATA from the context to avoid circular dependencies
  const CURRENCY_DATA = {
    USD: { symbol: "$", name: "US Dollar", rate: 1, flag: "🇺🇸" },
    EUR: { symbol: "€", name: "Euro", rate: 0.92, flag: "🇪🇺" },
    AED: { symbol: "د.إ", name: "UAE Dirham", rate: 3.67, flag: "🇦🇪" },
    TRY: { symbol: "₺", name: "Turkish Lira", rate: 32.17, flag: "🇹🇷" },
    GBP: { symbol: "£", name: "British Pound", rate: 0.79, flag: "🇬🇧" },
    INR: { symbol: "₹", name: "Indian Rupee", rate: 83.40, flag: "🇮🇳" },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
        aria-label="Select currency"
      >
        <span className="font-medium flex items-center">
          <span className="mr-1 text-base">{CURRENCY_DATA[currencyCode].flag}</span>
          <span>{currencyCode}</span>
        </span>
        <ChevronDown size={16} className="text-gray-600" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
          >
            {availableCurrencies.map((code) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-50 ${
                  currencyCode === code ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{CURRENCY_DATA[code].flag}</span>
                  <span>{code} - {CURRENCY_DATA[code].name}</span>
                </div>
                <span className="text-lg font-medium">{CURRENCY_DATA[code].symbol}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 