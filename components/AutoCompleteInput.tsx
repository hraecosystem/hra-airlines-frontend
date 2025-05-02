// components/AutoCompleteInput.tsx
"use client";

import React, {
  FC,
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import Fuse from "fuse.js";
import api from "@/lib/api";

export interface Airport {
  AirportCode: string;
  AirportName: string;
  City: string;
  Country: string;
  Type?: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  inputClassName?: string;
}

const AutoCompleteInput: FC<Props> = ({
  value,
  onChange,
  placeholder = "",
  label = "",
  inputClassName = "",
}) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // initialize ref with null
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1) Load airport list once
  useEffect(() => {
    (async () => {
      try {
        const resp = await api.post<{ data: Airport[] }>("/airports/list", {});
        setAirports(resp.data.data);
        sessionStorage.setItem("hra_airports", JSON.stringify(resp.data.data));
      } catch {
        const cached = sessionStorage.getItem("hra_airports");
        if (cached) {
          setAirports(JSON.parse(cached));
        }
      }
    })();
  }, []);

  // 2) Debounced search via Fuse.js
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const fuse = new Fuse(airports, {
        keys: ["AirportCode", "AirportName", "City", "Country"],
        threshold: 0.3,
      });
      const results = fuse.search(value).map((r) => r.item);
      setSuggestions(results);
      setOpen(results.length > 0);
      setHighlightedIndex(-1);
    }, 200);
  }, [value, airports]);

  // 3) Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 4) Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i < suggestions.length - 1 ? i + 1 : 0
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i > 0 ? i - 1 : suggestions.length - 1
      );
    }
    if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectAirport(suggestions[highlightedIndex]);
    }
  };

  const selectAirport = (a: Airport) => {
    onChange(a.AirportCode);
    setOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type="text"
        className={`${inputClassName} bg-white text-gray-800`}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value.toUpperCase())
        }
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute inset-x-0 z-50 mt-1 max-h-60 overflow-auto rounded border border-gray-300 bg-white text-black shadow-lg">
          {suggestions.map((a, idx) => (
            <li
              key={`${a.AirportCode}-${idx}`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectAirport(a);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`flex cursor-pointer items-center justify-between px-4 py-2 ${
                idx === highlightedIndex
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="font-semibold">{a.AirportCode}</span>
              <span className="ml-2 flex-1 truncate">
                {a.AirportName}, {a.City}
              </span>
              {a.Type && (
                <span className="ml-2 text-xs text-gray-500">{a.Type}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteInput;
