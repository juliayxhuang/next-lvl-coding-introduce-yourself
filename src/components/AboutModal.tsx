import React from 'react';
import { playClick } from '../services/audioEffects';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDismiss = () => {
    playClick();
    onClose();
  };

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white text-black px-[72px] py-[64px] select-none font-stefan cursor-pointer"
    >
      {/* Container with exact 72px / 64px layout */}
      <div className="relative w-full h-full flex flex-col justify-between">
        {/* Top Right Close 'X' (18pt) */}
        <div className="flex justify-end">
          <button
            onClick={handleDismiss}
            className="wiggle-on-hover text-[18pt] font-normal font-stefan p-2"
            aria-label="Close"
          >
            X
          </button>
        </div>

        {/* Center/Main Hand-Drawn Message (18pt) */}
        <div className="max-w-3xl mx-auto my-auto space-y-6 text-left">
          <h2 className="text-[18pt] font-normal font-stefan tracking-wide uppercase leading-snug">
            HI, MY NAME IS JULIA!
          </h2>

          <p className="text-[18pt] font-normal font-stefan tracking-wide uppercase leading-relaxed">
            I REALLY LIKE DANCING, AND I LOVE A GOOD LAUGH! SHOW ME YOUR MOVES TO LEARN MORE ABOUT ME :)
          </p>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
};
