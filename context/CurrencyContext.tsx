"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Currency data with exchange rates relative to USD and proper display information
const CURRENCY_DATA = {
  USD: { symbol: "$", name: "US Dollar", rate: 1, flag: "🇺🇸" },
  EUR: { symbol: "€", name: "Euro", rate: 0.92, flag: "🇪🇺" },
  AED: { symbol: "د.إ", name: "UAE Dirham", rate: 3.67, flag: "🇦🇪" },
  TRY: { symbol: "₺", name: "Turkish Lira", rate: 32.17, flag: "🇹🇷" },
  GBP: { symbol: "£", name: "British Pound", rate: 0.79, flag: "🇬🇧" },
  INR: { symbol: "₹", name: "Indian Rupee", rate: 83.40, flag: "🇮🇳" },
};

export type CurrencyCode = keyof typeof CURRENCY_DATA;
export type CurrencyInfo = typeof CURRENCY_DATA[CurrencyCode];

interface CurrencyContextType {
  currencyCode: CurrencyCode;
  setCurrencyCode: (code: CurrencyCode) => void;
  currencyInfo: CurrencyInfo;
  formatPrice: (amount: number | string, originalCurrency?: string) => string;
  convertPrice: (amount: number | string, fromCurrency: string, toCurrency?: CurrencyCode) => number;
  availableCurrencies: CurrencyCode[];
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Default to USD or detect from browser locale
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");
  
  // Try to get saved currency from localStorage on initial load
  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferredCurrency");
    if (savedCurrency && Object.keys(CURRENCY_DATA).includes(savedCurrency)) {
      setCurrencyCode(savedCurrency as CurrencyCode);
    }
  }, []);
  
  // Save currency preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("preferredCurrency", currencyCode);
  }, [currencyCode]);

  const currencyInfo = CURRENCY_DATA[currencyCode];
  const availableCurrencies = Object.keys(CURRENCY_DATA) as CurrencyCode[];

  // Convert price from one currency to another
  const convertPrice = (amount: number | string, fromCurrency: string, toCurrency: CurrencyCode = currencyCode): number => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    // If the amount is in the target currency already, return as is
    if (fromCurrency === toCurrency) return numAmount;
    
    // If fromCurrency is not in our list, return original amount
    if (!Object.keys(CURRENCY_DATA).includes(fromCurrency)) return numAmount;
    
    // Convert to USD first (as base currency), then to target currency
    const amountInUSD = numAmount / CURRENCY_DATA[fromCurrency as CurrencyCode].rate;
    const convertedAmount = amountInUSD * CURRENCY_DATA[toCurrency].rate;
    
    return convertedAmount;
  };

  // Format price with currency symbol
  const formatPrice = (amount: number | string, originalCurrency = "USD"): string => {
    const convertedAmount = convertPrice(amount, originalCurrency);
    return `${currencyInfo.symbol} ${convertedAmount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencyCode,
        setCurrencyCode,
        currencyInfo,
        formatPrice,
        convertPrice,
        availableCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
} 