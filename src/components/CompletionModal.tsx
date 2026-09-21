import React, { useEffect } from 'react';
import { triggerConfetti } from '../utils/confetti';
import { playClick } from '../services/audioEffects';

interface CompletionModalProps {
  onClose: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ onClose }) => {
  useEffect(() => { triggerConfetti(); }, []);

  const close = () => {
    playClick();
    onClose();
  };

  return (
    <div onClick={close} className="fixed inset-0 z-50 bg-white font-stefan text-black cursor-pointer" role="dialog" aria-modal="true" aria-labelledby="completion-title" aria-label="Click anywhere to go to the party page">
      <button onClick={(event) => { event.stopPropagation(); close(); }} className="wiggle-on-hover absolute top-[9%] right-[5%] text-[18pt] cursor-pointer" aria-label="Close and go to party page">X</button>
      <div className="h-full flex items-center justify-center px-10">
        <div className="w-full max-w-[780px] space-y-12 text-[18pt] uppercase tracking-wider leading-relaxed">
          <p id="completion-title">NOW THAT YOU KNOW ABOUT ME...</p>
          <p>LET'S PARTY!!!</p>
          <p>AND LISTEN TO SOME OF MY FAVORITE SONGS!</p>
        </div>
      </div>
    </div>
  );
};
