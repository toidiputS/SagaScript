import React from "react";

type ProgressRingProps = {
  value: number;  // 0-100
  size?: number;  // diameter in pixels
  strokeWidth?: number;
  strokeColor?: string;
  bgStrokeColor?: string;
};

export default function ProgressRing({
  value,
  size = 36,
  strokeWidth = 3,
  strokeColor = "var(--primary)",
  bgStrokeColor = "var(--muted)"
}: ProgressRingProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle 
        cx={size / 2} 
        cy={size / 2} 
        r={radius} 
        fill="none" 
        stroke={bgStrokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Progress circle */}
      <circle 
        className="transition-all duration-300 ease-in-out"
        cx={size / 2} 
        cy={size / 2} 
        r={radius} 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
