import React from 'react';

interface WiggleBoxProps {
  children: React.ReactNode;
  className?: string;
  filterId?: string;
  strokeWidth?: number;
  borderRadius?: number;
  fill?: string;
  stroke?: string;
  onClick?: () => void;
  borderOnTop?: boolean;
}

export const WiggleBox: React.FC<WiggleBoxProps> = ({
  children,
  className = '',
  filterId = 'wiggle-general',
  strokeWidth = 2.5,
  borderRadius = 28,
  fill = '#ffffff',
  stroke = '#000000',
  onClick,
  borderOnTop = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-transparent ${className}`}
    >
      {/* Hand-drawn SVG border */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none overflow-visible ${borderOnTop ? 'z-20' : 'z-0'}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={strokeWidth / 2 + 1}
          y={strokeWidth / 2 + 1}
          width={`calc(100% - ${strokeWidth + 2}px)`}
          height={`calc(100% - ${strokeWidth + 2}px)`}
          rx={borderRadius}
          ry={borderRadius}
          fill={borderOnTop ? 'none' : fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* Content wrapper with crisp text */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
