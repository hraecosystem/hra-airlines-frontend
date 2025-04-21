"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api"; // ✅ centralized API instance
import Fuse from "fuse.js";

interface Airport {
  AirportCode: string;
  AirportName: string;
  City: string;
  Country: string;
  Type?: string;
}

interface AutoCompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function AutoCompleteInput({
  value,
  onChange,
  placeholder = "",
  label = "",
}: AutoCompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [allAirports, setAllAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSelected, setIsSelected] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("hra_airports");

    if (cached) {
      setAllAirports(JSON.parse(cached));
    } else {
      api
        .post("/airports/list")
        .then((res) => {
          setAllAirports(res.data);
          sessionStorage.setItem("hra_airports", JSON.stringify(res.data));
        })
        .catch((err) => {
          console.error("⚠️ Failed to fetch airport list", err);
        });
    }
  }, []);

  useEffect(() => {
    if (value.trim().length < 2 || isSelected) {
      setSuggestions([]);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setIsLoading(true);
      const fuse = new Fuse(allAirports, {
        keys: ["AirportCode", "AirportName", "City", "Country"],
        threshold: 0.3,
      });
      const result = fuse.search(value).map((r) => r.item);
      setSuggestions(result);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [value, allAirports, isSelected]);

  const handleSelect = (airport: Airport) => {
    onChange(airport.AirportCode);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSelected(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setIsSelected(false);
          onChange(e.target.value);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        className="w-full p-3 rounded-lg bg-gray-50 border border-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
        autoComplete="off"
      />
      {isLoading && (
        <div className="absolute right-3 top-3 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full w-4 h-4"></div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 bg-white border border-gray-300 rounded mt-1 w-full max-h-60 overflow-auto shadow-xl">
          {suggestions.map((airport, idx) => (
            <li
              key={idx}
              className={`p-3 cursor-pointer flex items-center justify-between transition-colors duration-150 ${
                idx === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onMouseDown={() => handleSelect(airport)}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              <div>
                <span className="font-bold text-gray-800">{airport.AirportCode}</span> – {airport.AirportName}, {airport.City}
                <div className="text-xs text-gray-500">{airport.Country}</div>
              </div>
              <span className="text-xs text-blue-500 font-medium">
                {airport.Type || "Intl"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
