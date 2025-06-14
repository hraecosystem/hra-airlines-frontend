"use client";

import React from "react";
import Image from "next/image";

interface AirportLogoProps {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AirportLogo({ code, size = "md", className = "" }: AirportLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const bgColors = {
    sm: "bg-blue-50",
    md: "bg-blue-50",
    lg: "bg-blue-50"
  };

  const textColors = {
    sm: "text-blue-600 text-sm",
    md: "text-blue-600",
    lg: "text-blue-600 text-lg"
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${bgColors[size]} rounded-full flex items-center justify-center ${className}`}>
      <Image
        src={`https://www.gstatic.com/flights/airline_logos/70px/${code}.png`}
        alt={`${code} Airport`}
        width={size === "sm" ? 32 : size === "md" ? 48 : 64}
        height={size === "sm" ? 32 : size === "md" ? 48 : 64}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Si l'image n'existe pas, on affiche le code de l'aéroport
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            const fallback = document.createElement("span");
            fallback.className = `${textColors[size]} font-semibold`;
            fallback.textContent = code;
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  );
} 