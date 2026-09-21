import React from 'react';
import { DanceMove } from '../types';

interface MoveCardProps {
  move: DanceMove;
  onSelectMove: (move: DanceMove) => void;
}

export const MoveCard: React.FC<MoveCardProps> = ({
  move,
  onSelectMove,
}) => {
  const filterId = `wiggle-${move.id}`;

  return (
    <button
      type="button"
      onClick={() => onSelectMove(move)}
      className="wiggle-on-hover group relative bg-transparent p-6 flex flex-col items-center justify-between cursor-pointer select-none h-[min(48vh,380px)] w-full"
    >
      {/* Hand-Drawn Wiggly Border Box */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="calc(100% - 6px)"
          height="calc(100% - 6px)"
          rx="28"
          ry="28"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="2.75"
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* Title at Top Center (30pt) */}
      <h3 className="relative z-10 text-[30pt] font-normal font-stefan uppercase tracking-widest text-black text-center pt-2">
        {move.name}
      </h3>

      {/* Centered Illustration */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center p-3">
        {move.illustrationSrc ? (
          <img
            src={move.illustrationSrc}
            alt={move.name}
            className="max-h-52 max-w-full object-contain filter contrast-125 transition-transform duration-200 group-hover:scale-105"
            draggable={false}
          />
        ) : null}
      </div>

      {/* Bottom spacer */}
      <div className="h-2 relative z-10" />
    </button>
  );
};
