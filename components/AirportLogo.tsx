"use client";

import React, { useState } from "react";
import Image from "next/image";

interface AirportLogoProps {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AirportLogo({ code, size = "md", className = "" }: AirportLogoProps) {
  const [imageError, setImageError] = useState(false);

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
    sm: "text-blue-600 text-xs font-semibold",
    md: "text-blue-600 text-sm font-semibold",
    lg: "text-blue-600 text-base font-semibold"
  };

  // Si l'image a échoué ou si on n'a pas de code, afficher directement le fallback
  if (imageError || !code) {
    return (
      <div className={`${sizeClasses[size]} ${bgColors[size]} rounded-full flex items-center justify-center ${className}`}>
        <span className={textColors[size]}>
          {code || "N/A"}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${bgColors[size]} rounded-full flex items-center justify-center ${className}`}>
      <Image
        src={`https://www.gstatic.com/flights/airline_logos/70px/${code}.png`}
        alt={`${code} Airport`}
        width={size === "sm" ? 32 : size === "md" ? 48 : 64}
        height={size === "sm" ? 32 : size === "md" ? 48 : 64}
        className="w-full h-full object-contain"
        onError={() => {
          setImageError(true);
        }}
      />
    </div>
  );
} 