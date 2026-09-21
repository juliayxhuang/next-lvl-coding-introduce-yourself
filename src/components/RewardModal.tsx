import React, { useEffect } from 'react';
import { FunFact, DanceMove } from '../types';
import { triggerConfetti } from '../utils/confetti';
import { playUnlockSuccess, playClick } from '../services/audioEffects';
import { WiggleBox } from './WiggleBox';
import { publicAsset } from '../utils/publicAsset';

interface RewardModalProps {
  fact: FunFact;
  move: DanceMove;
  onNextMove: () => void;
  onRetrySameMove: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ fact, move, onNextMove, onRetrySameMove }) => {
  useEffect(() => {
    triggerConfetti();
    playUnlockSuccess();
  }, [fact.id]);

  return (
    <div className="absolute inset-x-[72px] top-1/2 -translate-y-1/2 flex justify-center pointer-events-none font-stefan text-black">
      <WiggleBox className="w-full max-w-[810px] min-h-[410px] p-10 md:p-11 pointer-events-auto" borderRadius={16} strokeWidth={2}>
        <div className="min-h-[320px] flex flex-col justify-between gap-8">
          <h2 className="text-[18pt] uppercase tracking-wide">{fact.category}:</h2>
          <p className="text-[18pt] uppercase tracking-wide leading-[1.35]">{fact.fact}</p>
          <div className="flex items-center justify-between gap-8 text-[18pt] uppercase tracking-wide">
            <button onClick={() => { playClick(); onRetrySameMove(); }} className="wiggle-on-hover cursor-pointer text-left">
              {move.name} AGAIN
            </button>
            <button onClick={() => { playClick(); onNextMove(); }} className="wiggle-on-hover cursor-pointer text-right">
              NEXT MOVE
            </button>
          </div>
        </div>
      </WiggleBox>
      <img
        key={fact.id}
        src={publicAsset({ dab: 'julia-dabbing.jpg', whip: 'julia-whipping.jpg', woah: 'julia-whoaing.jpg' }[move.id])}
        alt=""
        className="reward-photo-flight"
      />
    </div>
  );
};
