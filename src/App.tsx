import React, { useState } from 'react';
import { DanceMove, FunFact, AppView } from './types';
import { DANCE_MOVES } from './data/moves';
import { FUN_FACTS_BANK } from './data/facts';
import { Header } from './components/Header';
import { MoveCard } from './components/MoveCard';
import { PoseDetectorView } from './components/PoseDetectorView';
import { RewardModal } from './components/RewardModal';
import { AboutModal } from './components/AboutModal';
import { WiggleFilters } from './components/WiggleFilters';
import { playClick } from './services/audioEffects';
import { CompletionModal } from './components/CompletionModal';
import { PartyPage } from './components/PartyPage';

export const App: React.FC = () => {
  const [unlockedFactIds, setUnlockedFactIds] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('menu');
  const [selectedMove, setSelectedMove] = useState<DanceMove | null>(null);
  const [activeRewardFact, setActiveRewardFact] = useState<FunFact | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(true);

  // Handle selecting a move from menu
  const handleSelectMove = (move: DanceMove) => {
    playClick();
    setSelectedMove(move);
    setCurrentView('camera');
  };

  // Handle random move selection
  const handleRandomMove = () => {
    playClick();
    const randomMove = DANCE_MOVES[Math.floor(Math.random() * DANCE_MOVES.length)];
    handleSelectMove(randomMove);
  };

  // Handle successful completion of ANY pose -> unlocks ANY unread fact!
  const handleMoveSuccess = (_move: DanceMove) => {
    const unreadFacts = FUN_FACTS_BANK.filter((f) => !unlockedFactIds.includes(f.id));

    if (unreadFacts.length === 0) {
      setCurrentView('party');
      return;
    }

    const factToReward = unreadFacts[0];

    if (factToReward) {
      if (!unlockedFactIds.includes(factToReward.id)) {
        setUnlockedFactIds((prev) => [...prev, factToReward.id]);
      }
      if (unreadFacts.length === 1) {
        setCurrentView('complete');
      } else {
        setActiveRewardFact(factToReward);
        setCurrentView('reward');
      }
    }
  };

  // Switch to next move in sequence
  const handleNextMove = () => {
    if (!selectedMove) return;
    const currentIndex = DANCE_MOVES.findIndex((m) => m.id === selectedMove.id);
    const nextIndex = (currentIndex + 1) % DANCE_MOVES.length;
    const nextMove = DANCE_MOVES[nextIndex];
    setSelectedMove(nextMove);
    setCurrentView('camera');
  };

  // Retry same move
  const handleRetrySameMove = () => {
    if (selectedMove) {
      setCurrentView('camera');
    }
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setSelectedMove(null);
  };

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden bg-white text-black px-[72px] py-[64px] flex flex-col justify-between select-none font-stefan">
      {/* SVG Wiggle Filters */}
      <WiggleFilters />

      {/* Top Header */}
      <Header
        unlockedCount={unlockedFactIds.length}
        totalCount={FUN_FACTS_BANK.length}
        onOpenAbout={() => setIsAboutOpen(true)}
        onGoParty={() => {
          setIsAboutOpen(false);
          setCurrentView('party');
        }}
        onBack={currentView === 'menu' ? undefined : handleBackToMenu}
      />

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col justify-center items-center my-auto overflow-hidden">
        {currentView === 'menu' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6">
            {/* 3 Dance Move Cards Grid */}
            <div className="w-full grid grid-cols-3 gap-6 md:gap-8 max-w-5xl">
              {DANCE_MOVES.map((move) => (
                <MoveCard
                  key={move.id}
                  move={move}
                  onSelectMove={handleSelectMove}
                />
              ))}
            </div>

            {/* Centered RANDOM Button at bottom (30pt) */}
            <div className="pt-2">
              <button
                onClick={handleRandomMove}
                className="wiggle-on-hover text-[30pt] font-normal font-stefan uppercase tracking-widest text-black cursor-pointer"
              >
                RANDOM
              </button>
            </div>
          </div>
        )}

        {currentView === 'camera' && selectedMove && (
          <PoseDetectorView
            move={selectedMove}
            onBack={handleBackToMenu}
            onMoveSuccess={handleMoveSuccess}
          />
        )}
        {currentView === 'party' && <PartyPage />}
      </main>

      {currentView === 'reward' && activeRewardFact && selectedMove && (
        <RewardModal
          fact={activeRewardFact}
          move={selectedMove}
          onNextMove={handleNextMove}
          onRetrySameMove={handleRetrySameMove}
        />
      )}

      {currentView === 'complete' && <CompletionModal onClose={() => setCurrentView('party')} />}

      {/* Welcome / About Julia Overlay */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

    </div>
  );
};

export default App;
