// components/ui/Spinner.tsx
import React from "react";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  /** diameter in pixels */
  size?: number;
}

/**
 * A simple SVG spinner that inherits current text-color.
 * - size: width/height in px (default 24)
 * - any other SVG props (className, style, etc.) are forwarded
 */
export function Spinner({ size = 24, className = "", ...props }: SpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4z"
      />
    </svg>
  );
}
