"use client";

import React, { useState, useEffect } from "react";

interface Filters {
  airline: string;
  stops: string;
  sortBy: string;
  meals: string[];
  baggage: string[];
  price: [number, number];
}

interface Props {
  filters: Filters;
  setFilters: (filters: Filters | ((prev: Filters) => Filters)) => void;
  airlineOptions: string[];
}

export default function FiltersSidebar({
  filters,
  setFilters,
  airlineOptions,
}: Props) {
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.price || [0, 2000]);

  // Sync local price state to parent filter
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, price: priceRange }));
    }, 250);
    return () => clearTimeout(timeout);
  }, [priceRange]);

  const handleCheckboxChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const current = prev[key] as string[];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  return (
    <aside className="bg-white p-6 rounded-xl border border-gray-200 shadow w-full space-y-6">
      <h3 className="text-xl font-bold text-hra-dark border-b pb-3">✈️ Filter Flights</h3>

      {/* Airline */}
      <div>
        <label htmlFor="airline" className="block text-sm font-medium text-gray-800 mb-1">Airlines</label>
        <select
          id="airline"
          value={filters.airline}
          onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">All Airlines</option>
          {airlineOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Stops */}
      <div>
        <label htmlFor="stops" className="block text-sm font-medium text-gray-800 mb-1">Stops</label>
        <select
          id="stops"
          value={filters.stops}
          onChange={(e) => setFilters({ ...filters, stops: e.target.value })}
          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">All</option>
          <option value="0">Non-stop</option>
          <option value="1">1 Stop</option>
          <option value="2">2+ Stops</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Price Range (${priceRange[0]} – ${priceRange[1]})
        </label>
        <div className="flex items-center gap-3 mb-2">
          <input
            type="number"
            min={0}
            max={2000}
            value={priceRange[0]}
            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
            className="w-20 border rounded text-sm p-1"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            min={0}
            max={2000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="w-20 border rounded text-sm p-1"
          />
        </div>
        <input
          type="range"
          min={0}
          max={2000}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
          className="w-full accent-pink-600"
        />
      </div>

      {/* Meal Preferences */}
      <div>
        <p className="text-sm font-medium text-gray-800 mb-1">Meal Preferences</p>
        <div className="space-y-1 text-sm text-gray-700">
          {["Veg", "Non-Veg", "Halal", "Kosher"].map((meal) => (
            <label key={meal} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.meals.includes(meal)}
                onChange={() => handleCheckboxChange("meals", meal)}
                className="accent-pink-600"
              />
              {meal}
            </label>
          ))}
        </div>
      </div>

      {/* Baggage */}
      <div>
        <p className="text-sm font-medium text-gray-800 mb-1">Baggage Allowance</p>
        <div className="space-y-1 text-sm text-gray-700">
          {["15kg", "20kg", "30kg+"].map((bag) => (
            <label key={bag} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.baggage.includes(bag)}
                onChange={() => handleCheckboxChange("baggage", bag)}
                className="accent-pink-600"
              />
              {bag}
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label htmlFor="sort" className="text-sm font-medium text-gray-800 block mb-1">Sort By</label>
        <select
          id="sort"
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="price">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
}
