// components/common/FiltersSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Plane, SlidersHorizontal, ArrowUpDown, DollarSign, Utensils, Luggage } from "lucide-react";

export type Filters = {
  airline: string;
  stops: "all" | "0" | "1" | "2+";
  sortBy: "price-asc" | "price-desc";
  meals: string[];
  baggage: string[];
  priceRange: [number, number];
};

interface Props {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  airlineOptions: string[];
}

export default function FiltersSidebar({
  filters,
  setFilters,
  airlineOptions,
}: Props) {
  // Local slider state mirrors filters.priceRange
  const [localPrice, setLocalPrice] = useState<Filters["priceRange"]>(
    filters.priceRange
  );

  // Sync back after a debounce
  useEffect(() => {
    const tid = setTimeout(() => {
      setFilters((prev) => ({ ...prev, priceRange: localPrice }));
    }, 200);
    return () => clearTimeout(tid);
  }, [localPrice, setFilters]);

  const toggleArray = (key: "meals" | "baggage", value: string) => {
    setFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  return (
    <aside className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 w-full space-y-6">
      <div className="flex items-center gap-2 text-xl font-bold text-gray-800 border-b pb-3">
        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
        <span>Flight Filters</span>
      </div>

      {/* Airlines */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-600" />
          Airlines
        </label>
        <select
          value={filters.airline}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, airline: e.target.value }))
          }
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value="">All Airlines</option>
          {airlineOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Stops */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-blue-600" />
          Stops
        </label>
        <select
          value={filters.stops}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              stops: e.target.value as Filters["stops"],
            }))
          }
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value="all">All</option>
          <option value="0">Non-stop</option>
          <option value="1">1 Stop</option>
          <option value="2+">2+ Stops</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          Price (${localPrice[0]} – ${localPrice[1]})
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            min={0}
            max={10000}
            value={localPrice[0]}
            onChange={(e) =>
              setLocalPrice([Number(e.target.value), localPrice[1]])
            }
            className="w-20 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            min={0}
            max={10000}
            value={localPrice[1]}
            onChange={(e) =>
              setLocalPrice([localPrice[0], Number(e.target.value)])
            }
            className="w-20 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
        <input
          type="range"
          min={0}
          max={10000}
          step={50}
          value={localPrice[1]}
          onChange={(e) =>
            setLocalPrice([localPrice[0], Number(e.target.value)])
          }
          className="w-full accent-blue-600"
        />
      </div>

      {/* Meal Preferences */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-blue-600" />
          Meal Preferences
        </p>
        <div className="space-y-2 text-sm text-gray-700">
          {["Veg", "Non-Veg", "Halal", "Kosher"].map((m) => (
            <label
              key={m}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={filters.meals.includes(m)}
                onChange={() => toggleArray("meals", m)}
                className="accent-blue-600 w-4 h-4"
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* Baggage */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Luggage className="w-4 h-4 text-blue-600" />
          Baggage Allowance
        </p>
        <div className="space-y-2 text-sm text-gray-700">
          {["15kg", "20kg", "30kg+"].map((b) => (
            <label
              key={b}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={filters.baggage.includes(b)}
                onChange={() => toggleArray("baggage", b)}
                className="accent-blue-600 w-4 h-4"
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-blue-600" />
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              sortBy: e.target.value as Filters["sortBy"],
            }))
          }
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
}
