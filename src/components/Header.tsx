import React from 'react';
import { playClick } from '../services/audioEffects';
import { publicAsset } from '../utils/publicAsset';

interface HeaderProps {
  unlockedCount: number;
  totalCount: number;
  onOpenAbout: () => void;
  onGoParty: () => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unlockedCount,
  totalCount,
  onOpenAbout,
  onGoParty,
  onBack,
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-4 select-none font-stefan">
      {/* Left: Brand Title (30pt) */}
      <div className="flex items-center gap-5 shrink-0">
        {onBack ? (
          <button onClick={onBack} className="wiggle-on-hover shrink-0 cursor-pointer" aria-label="Back to dance moves">
            <img src={publicAsset('back-button.png')} alt="" className="header-doodle w-11 h-11 object-contain" />
          </button>
        ) : (
          <img src={publicAsset('squiggle.png')} alt="" className="header-doodle w-11 h-11 object-contain shrink-0" />
        )}
        <h1 aria-label="Jiggle with Julia" className="text-[30pt] font-normal uppercase tracking-normal text-black whitespace-nowrap">
          <span className="jiggle-word">JI<button type="button" className="jiggle-g-button" onClick={() => { playClick(); onGoParty(); }} aria-label="Go to party page"><span className="jiggle-letter">G</span><span className="jiggle-letter">G</span></button>LE</span> WITH JULIA
        </h1>
      </div>

      {/* Right: Fun Facts Counter & About Button */}
      <div className="flex items-center gap-6 shrink-0 text-[30pt] font-normal uppercase tracking-normal text-black">
        <span className="whitespace-nowrap">
          FUN FACTS {unlockedCount}/{totalCount}
        </span>

        <button
          onClick={() => {
            playClick();
            onOpenAbout();
          }}
          className="wiggle-on-hover uppercase cursor-pointer"
        >
          ABOUT
        </button>
      </div>
    </header>
  );
};
