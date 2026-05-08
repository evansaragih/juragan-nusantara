import React, { useState, useEffect, useCallback } from 'react'; // eslint-disable-line
import Lobby from './components/Lobby';
import Board from './components/Board';
import GamePanel from './components/GamePanel';
import DiceOverlay from './components/DiceOverlay';
import { useGameState } from './hooks/useGameState';
import { BOARD_SPACES } from './game/constants';

function Game({ initialPlayers }) {
  const {
    state,
    currentPlayer,
    landingAction,
    handleRoll,
    handleStep,
    handleDrawCard,
    handleBuyProperty,
    handlePayRent,
    handleSkipBuy,
    handlePayJailFine,
    handleUseJailCard,
    handleBuildHouse,
    handleEndTurn,
    handleProposeTrade,
  } = useGameState(initialPlayers);

  const [isRolling, setIsRolling] = useState(false);

  // Handle Robot actions & Block-by-Block Movement
  useEffect(() => {
    if (state.winner) return;

    // Movement animation step
    if (state.phase === 'moving') {
      const timer = setTimeout(() => {
        handleStep();
      }, 350); // Jump every 350ms
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.movingSteps, state.winner, handleStep]);

  const handleRollWrapper = useCallback(() => {
    setIsRolling(true);
    setTimeout(() => {
      setIsRolling(false);
      handleRoll();
    }, 800);
  }, [handleRoll]);

  // Robot AI
  useEffect(() => {
    if (!currentPlayer || !currentPlayer.isRobot || state.winner) return;
    if (state.phase === 'moving' || isRolling) return;

    const timer = setTimeout(() => {
      const space = BOARD_SPACES[currentPlayer.position];
      if (state.phase === 'roll') {
        if (currentPlayer.inJail) {
          if (currentPlayer.hasJailCard) handleUseJailCard();
          else if (currentPlayer.money > 200) handlePayJailFine();
          else handleRollWrapper();
        } else {
          handleRollWrapper();
        }
      } else if (state.phase === 'card') {
        handleDrawCard();
      } else if (state.phase === 'action') {
        if (landingAction === 'buy') {
          if (currentPlayer.money >= (space?.price || 0) + 200) handleBuyProperty();
          else handleSkipBuy();
        } else if (landingAction === 'rent') {
          handlePayRent();
        } else if (landingAction === 'owned') {
          handleSkipBuy();
        }
      } else if (state.phase === 'endturn') {
        handleEndTurn();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [state.phase, currentPlayer, landingAction, handleRoll, handleDrawCard, handleBuyProperty, handleSkipBuy, handlePayRent, handleEndTurn, handlePayJailFine, handleUseJailCard, state.winner, handleRollWrapper, isRolling]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0D0800 0%, #1A0F00 50%, #0A0500 100%)',
      position: 'relative',
      fontFamily: "'Outfit', sans-serif",
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        ::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.3); border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      {/* Board centered with perspective */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -46%)',
        zIndex: 1,
        perspective: '1200px',
      }}>
        <Board players={state.players} />
      </div>

      {/* Dice overlay — fixed position, flies in/out on roll */}
      <DiceOverlay diceResult={state.diceResult} isRolling={isRolling} />

      {/* Game Panel Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        <GamePanel
          state={state}
          currentPlayer={currentPlayer}
          landingAction={landingAction}
          onRoll={handleRollWrapper}
          onDrawCard={handleDrawCard}
          onBuy={handleBuyProperty}
          onPayRent={handlePayRent}
          onSkip={handleSkipBuy}
          onPayJail={handlePayJailFine}
          onUseJailCard={handleUseJailCard}
          onBuildHouse={handleBuildHouse}
          onEndTurn={handleEndTurn}
          onTrade={handleProposeTrade}
          onRolling={setIsRolling}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [gamePlayers, setGamePlayers] = useState(null);

  if (!gamePlayers) {
    return <Lobby onStartGame={setGamePlayers} />;
  }

  return <Game key={JSON.stringify(gamePlayers.map(p => p.id))} initialPlayers={gamePlayers} />;
}
