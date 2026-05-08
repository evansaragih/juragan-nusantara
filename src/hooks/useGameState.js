import { useState, useCallback } from 'react';
import {
  rollDice, calculateRent, drawCard, applyCardAction, canBuildHouse,
  checkBankruptcy, initGameState
} from '../game/engine';
import {
  BOARD_SPACES, CHEST_CARDS, CHANCE_CARDS,
  GO_MONEY, JAIL_FINE, JAIL_SPACE, MAX_JAIL_TURNS
} from '../game/constants';
import { formatRp } from '../utils/format';

export function useGameState(initialPlayers) {
  const [state, setState] = useState(() => initGameState(
    initialPlayers,
    [...CHEST_CARDS].sort(() => Math.random() - 0.5),
    [...CHANCE_CARDS].sort(() => Math.random() - 0.5)
  ));

  const currentPlayer = state.players[state.currentPlayerIndex];

  const handleRoll = useCallback(() => {
    if (state.phase !== 'roll') return;
    const dice = rollDice();

    setState(prev => {
      const player = prev.players[prev.currentPlayerIndex];
      let updatedPlayers = prev.players.map(p => ({ ...p }));
      let updatedPlayer = { ...player };
      let newDoublesStreak = prev.doublesStreak;
      let messages = [...prev.messages];
      const addMsg = (t) => messages = [{ text: t, id: Date.now() + Math.random() }, ...messages].slice(0, 20);

      // Jail handling
      if (updatedPlayer.inJail) {
        updatedPlayer.jailTurns += 1;
        if (dice.isDouble) {
          updatedPlayer.inJail = false;
          updatedPlayer.jailTurns = 0;
          addMsg(`${player.name} keluar dari Macet Parah dengan doubles!`);
        } else if (updatedPlayer.jailTurns >= MAX_JAIL_TURNS) {
          updatedPlayer.money -= JAIL_FINE;
          updatedPlayer.inJail = false;
          updatedPlayer.jailTurns = 0;
          addMsg(`${player.name} bayar denda ${formatRp(50)} keluar Macet Parah.`);
        } else {
          addMsg(`${player.name} masih di Macet Parah (giliran ke-${updatedPlayer.jailTurns}).`);
          updatedPlayers = updatedPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
          return {
            ...prev, players: updatedPlayers, diceResult: dice, messages,
            phase: 'endturn', doublesStreak: 0,
          };
        }
      }

      // Doubles streak
      if (dice.isDouble) {
        newDoublesStreak = prev.doublesStreak + 1;
        if (newDoublesStreak >= 3) {
          updatedPlayer.position = JAIL_SPACE;
          updatedPlayer.inJail = true;
          updatedPlayer.jailTurns = 0;
          addMsg(`${player.name} kena Macet Parah! 3x doubles berturut-turut!`);
          updatedPlayers = updatedPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
          return {
            ...prev, players: updatedPlayers, diceResult: dice, messages,
            phase: 'endturn', doublesStreak: 0,
          };
        }
      } else {
        newDoublesStreak = 0;
      }

      addMsg(`${player.name} melempar dadu: ${dice.d1}+${dice.d2}=${dice.total}.`);
      updatedPlayers = updatedPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);

      return {
        ...prev, players: updatedPlayers, diceResult: dice, messages,
        phase: 'moving', movingSteps: dice.total, doublesStreak: newDoublesStreak,
      };
    });
  }, [state.phase]);

  const handleStep = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'moving' || !prev.movingSteps) return prev;
      
      const player = prev.players[prev.currentPlayerIndex];
      const newPos = (player.position + 1) % 40;
      const crossedGo = newPos === 0;
      
      let updatedPlayer = { ...player, position: newPos };
      let messages = [...prev.messages];
      if (crossedGo) {
         updatedPlayer.money += GO_MONEY;
         messages = [{ text: `${player.name} melewati Mulai! +${formatRp(200)}`, id: Date.now() }, ...messages].slice(0, 20);
      }
      
      let updatedPlayers = prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
      const newMovingSteps = prev.movingSteps - 1;
      
      if (newMovingSteps > 0) {
        return {
          ...prev,
          players: updatedPlayers,
          messages,
          movingSteps: newMovingSteps,
        };
      }
      
      // Reached destination! Now evaluate the space.
      const space = BOARD_SPACES[newPos];
      let newPhase = 'action';
      messages = [{ text: `${player.name} mendarat di ${space.name}`, id: Date.now() + 1 }, ...messages].slice(0, 20);
      
      if (space.type === 'gotojail') {
        updatedPlayer.position = JAIL_SPACE;
        updatedPlayer.inJail = true;
        updatedPlayer.jailTurns = 0;
        messages = [{ text: `${player.name} kena Ganjil-Genap! Langsung ke Macet Parah!`, id: Date.now() + 2 }, ...messages].slice(0, 20);
        newPhase = 'endturn';
      } else if (space.type === 'tax') {
        updatedPlayer.money -= space.amount;
        messages = [{ text: `${player.name} bayar pajak ${formatRp(space.amount)}`, id: Date.now() + 2 }, ...messages].slice(0, 20);
        newPhase = 'endturn';
      } else if (space.type === 'go' || space.type === 'jail' || space.type === 'parking') {
        newPhase = 'endturn';
      } else if (space.type === 'chest' || space.type === 'chance') {
        newPhase = 'card';
      } else if (space.type === 'property' || space.type === 'station' || space.type === 'utility') {
        newPhase = 'action';
      }
      
      updatedPlayers = updatedPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
      
      return {
        ...prev,
        players: updatedPlayers,
        messages,
        phase: newPhase,
        movingSteps: 0,
      };
    });
  }, []);

  const handleDrawCard = useCallback(() => {
    if (state.phase !== 'card') return;
    const space = BOARD_SPACES[currentPlayer.position];
    const deck = space.type === 'chest' ? state.chestDeck : state.chanceDeck;
    const card = drawCard(deck);

    setState(prev => {
      const { updatedPlayers, messages: cardMsgs, extraAction } = applyCardAction(
        card, prev.players[prev.currentPlayerIndex], prev.players, prev
      );
      let messages = [...cardMsgs.map(t => ({ text: t, id: Date.now() + Math.random() })), ...prev.messages].slice(0, 20);
      const isBankrupt = updatedPlayers.find(p => p.id === currentPlayer.id && checkBankruptcy(p));
      const finalPlayers = isBankrupt
        ? updatedPlayers.map(p => p.id === currentPlayer.id ? { ...p, bankrupt: true } : p)
        : updatedPlayers;
      if (isBankrupt) {
        messages = [{ text: `${currentPlayer.name} bangkrut! Keluar dari permainan.`, id: Date.now() }, ...messages].slice(0, 20);
      }
      return {
        ...prev,
        players: finalPlayers,
        lastCard: card,
        cardDrawCount: prev.cardDrawCount + 1,
        messages,
        phase: 'endturn',
        nearestStationDoubleRent: extraAction === 'neareststation',
      };
    });
  }, [state.phase, state.chestDeck, state.chanceDeck, currentPlayer]);

  const handleBuyProperty = useCallback((initialHouses = 0) => {
    const space = BOARD_SPACES[currentPlayer.position];
    if (!space || !['property', 'station', 'utility'].includes(space.type)) return;
    const houseCost = space.houseCost || 0;
    const totalCost = space.price + (initialHouses * houseCost);
    if (currentPlayer.money < totalCost) return;

    setState(prev => {
      const player = prev.players[prev.currentPlayerIndex];
      const updatedPlayer = {
        ...player,
        money: player.money - totalCost,
        properties: [...player.properties, { id: space.id, houses: initialHouses, mortgaged: false }],
      };
      const text = initialHouses > 0 
        ? `${player.name} membeli ${space.name} + ${initialHouses} bangunan seharga ${formatRp(totalCost)}!`
        : `${player.name} membeli ${space.name} seharga ${formatRp(totalCost)}!`;
      const messages = [{ text, id: Date.now() }, ...prev.messages].slice(0, 20);
      const isDouble = prev.diceResult?.isDouble;
      return {
        ...prev,
        players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p),
        messages,
        phase: isDouble ? 'roll' : 'endturn',
      };
    });
  }, [currentPlayer]);

  const handlePayRent = useCallback(() => {
    const space = BOARD_SPACES[currentPlayer.position];
    if (!space) return;

    setState(prev => {
      const player = prev.players[prev.currentPlayerIndex];
      const owner = prev.players.find(p =>
        p.properties.some(prop => prop.id === space.id)
      );
      if (!owner || owner.id === player.id) {
        return { ...prev, phase: prev.diceResult?.isDouble ? 'roll' : 'endturn' };
      }

      const diceTotal = prev.diceResult?.total || 0;
      let rent = calculateRent(space, owner, prev.players, diceTotal);
      if (prev.nearestStationDoubleRent && space.type === 'station') rent *= 2;

      const updatedPayer = { ...player, money: player.money - rent };
      const updatedOwner = { ...owner, money: owner.money + rent };
      const messages = [
        { text: `${player.name} bayar sewa ${formatRp(rent)} ke ${owner.name} untuk ${space.name}`, id: Date.now() },
        ...prev.messages
      ].slice(0, 20);

      const players = prev.players.map(p => {
        if (p.id === updatedPayer.id) return updatedPayer;
        if (p.id === updatedOwner.id) return updatedOwner;
        return p;
      });

      const isBankrupt = checkBankruptcy(updatedPayer);
      const finalPlayers = isBankrupt
        ? players.map(p => p.id === updatedPayer.id ? { ...p, bankrupt: true } : p)
        : players;
      if (isBankrupt) {
        messages.unshift({ text: `${updatedPayer.name} bangkrut! Keluar dari permainan.`, id: Date.now() + 3 });
      }
      return {
        ...prev, players: finalPlayers, messages,
        phase: isBankrupt ? 'endturn' : (prev.diceResult?.isDouble ? 'roll' : 'endturn'),
        nearestStationDoubleRent: false,
      };
    });
  }, [currentPlayer]);

  const handleSkipBuy = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: prev.diceResult?.isDouble ? 'roll' : 'endturn',
    }));
  }, []);

  const handlePayJailFine = useCallback(() => {
    setState(prev => {
      const player = prev.players[prev.currentPlayerIndex];
      if (player.money < JAIL_FINE) return prev;
      const updatedPlayer = { ...player, money: player.money - JAIL_FINE, inJail: false, jailTurns: 0 };
      const messages = [
        { text: `${player.name} bayar denda ${formatRp(50)} keluar Macet Parah.`, id: Date.now() },
        ...prev.messages
      ].slice(0, 20);
      return {
        ...prev,
        players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p),
        messages, phase: 'roll',
      };
    });
  }, []);

  const handleUseJailCard = useCallback(() => {
    setState(prev => {
      const player = prev.players[prev.currentPlayerIndex];
      if (!player.hasJailCard) return prev;
      const updatedPlayer = { ...player, hasJailCard: false, inJail: false, jailTurns: 0 };
      const messages = [
        { text: `${player.name} pakai kartu Bebas Macet!`, id: Date.now() },
        ...prev.messages
      ].slice(0, 20);
      return {
        ...prev,
        players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p),
        messages, phase: 'roll',
      };
    });
  }, []);

  const handleBuildHouse = useCallback((propertyId) => {
    setState(prev => {
      const player = prev.players[prev.currentPlayerIndex];
      const space = BOARD_SPACES.find(s => s.id === propertyId);
      if (!space || !canBuildHouse(player.id, propertyId, prev.players)) return prev;
      const prop = player.properties.find(p => p.id === propertyId);
      const houses = prop?.houses || 0;
      const cost = houses === 3 ? space.houseCost * 2 : space.houseCost; // Landmark costs 2x
      if (player.money < cost) return prev;
      const buildingName = houses === 3 ? 'Landmark' : 'Bangunan';
      const updatedPlayer = {
        ...player,
        money: player.money - cost,
        properties: player.properties.map(p =>
          p.id === propertyId ? { ...p, houses: p.houses + 1 } : p
        ),
      };
      const messages = [
        { text: `${player.name} membangun ${buildingName} di ${space.name}!`, id: Date.now() },
        ...prev.messages
      ].slice(0, 20);
      return {
        ...prev,
        players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p),
        messages,
      };
    });
  }, []);

  const handleEndTurn = useCallback(() => {
    setState(prev => {
      const activePlayers = prev.players.filter(p => !p.bankrupt);
      if (activePlayers.length <= 1) {
        return { ...prev, phase: 'gameover', winner: activePlayers[0] };
      }
      let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      while (prev.players[nextIndex]?.bankrupt) {
        nextIndex = (nextIndex + 1) % prev.players.length;
      }
      const messages = [
        { text: `Giliran ${prev.players[nextIndex]?.name}`, id: Date.now() },
        ...prev.messages
      ].slice(0, 20);
      return {
        ...prev,
        currentPlayerIndex: nextIndex,
        phase: 'roll',
        diceResult: null,
        lastCard: null,
        messages,
        turnCount: prev.turnCount + 1,
        doublesStreak: 0,
        nearestStationDoubleRent: false,
      };
    });
  }, []);

  const handleProposeTrade = useCallback((trade) => {
    setState(prev => {
      const from = prev.players.find(p => p.id === trade.fromId);
      const to = prev.players.find(p => p.id === trade.toId);
      if (!from || !to) return prev;

      const fromProps = trade.fromProperties.map(id => from.properties.find(p => p.id === id)).filter(Boolean);
      const toProps = trade.toProperties.map(id => to.properties.find(p => p.id === id)).filter(Boolean);

      const updatedFrom = {
        ...from,
        money: from.money - trade.fromMoney + trade.toMoney,
        properties: [
          ...from.properties.filter(p => !trade.fromProperties.includes(p.id)),
          ...toProps,
        ],
      };
      const updatedTo = {
        ...to,
        money: to.money - trade.toMoney + trade.fromMoney,
        properties: [
          ...to.properties.filter(p => !trade.toProperties.includes(p.id)),
          ...fromProps,
        ],
      };
      const messages = [
        { text: `Trade selesai antara ${from.name} dan ${to.name}!`, id: Date.now() },
        ...prev.messages
      ].slice(0, 20);
      return {
        ...prev,
        players: prev.players.map(p => {
          if (p.id === updatedFrom.id) return updatedFrom;
          if (p.id === updatedTo.id) return updatedTo;
          return p;
        }),
        messages,
      };
    });
  }, []);

  const getLandingAction = () => {
    if (!state.diceResult) return null;
    const space = BOARD_SPACES[currentPlayer?.position];
    if (!space) return null;
    if (space.type === 'property' || space.type === 'station' || space.type === 'utility') {
      const owner = state.players.find(p => p.properties.some(prop => prop.id === space.id));
      if (!owner) return 'buy';
      if (owner.id !== currentPlayer.id) return 'rent';
      return 'owned';
    }
    return null;
  };

  return {
    state,
    currentPlayer,
    landingAction: getLandingAction(),
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
  };
}
