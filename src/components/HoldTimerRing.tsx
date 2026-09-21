import React from 'react';

interface HoldTimerRingProps {
  progress: number; // 0 to 1
  remainingSeconds: number;
  isMatching: boolean;
  size?: number;
}

export const HoldTimerRing: React.FC<HoldTimerRingProps> = ({
  progress,
  remainingSeconds,
  isMatching,
  size = 110,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer subtle glow ring */}
        {isMatching && progress > 0.05 && (
          <div
            className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse"
            style={{ width: size, height: size }}
          />
        )}

        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
          />

          {/* Animated progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={isMatching ? '#10b981' : '#6366f1'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          {progress > 0 ? (
            <>
              <span className="text-xl font-bold font-mono tracking-tight text-white">
                {Math.max(0, remainingSeconds).toFixed(1)}s
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">
                HOLD
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                READY
              </span>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping mt-1" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
