import {
  BOARD_SPACES, GO_MONEY, JAIL_SPACE, STARTING_MONEY
} from './constants';
import { formatRp } from '../utils/format';

export function createPlayer(id, name, token, color) {
  return {
    id, name, token, color,
    position: 0,
    money: STARTING_MONEY,
    properties: [],
    inJail: false,
    jailTurns: 0,
    hasJailCard: false,
    bankrupt: false,
    doublesCount: 0,
  };
}

export function rollDice() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, total: d1 + d2, isDouble: d1 === d2 };
}


export function getPropertyOwner(propertyId, players) {
  return players.find(p => p.properties.some(prop => prop.id === propertyId));
}

export function hasColorGroup(playerId, color, players, properties) {
  const player = players.find(p => p.id === playerId);
  if (!player) return false;
  const colorProps = BOARD_SPACES.filter(s => s.type === 'property' && s.color === color);
  return colorProps.every(p => player.properties.some(pp => pp.id === p.id));
}

export function getStationCount(player) {
  return BOARD_SPACES.filter(s => s.type === 'station')
    .filter(s => player.properties.some(p => p.id === s.id)).length;
}

export function getUtilityCount(player) {
  return BOARD_SPACES.filter(s => s.type === 'utility')
    .filter(s => player.properties.some(p => p.id === s.id)).length;
}

export function calculateRent(space, owner, allPlayers, diceRoll) {
  if (space.type === 'station') {
    const count = getStationCount(owner);
    const stationRents = [25, 50, 100, 200];
    return stationRents[count - 1] || 25;
  }
  if (space.type === 'utility') {
    const count = getUtilityCount(owner);
    const mult = count === 2 ? 10 : 4;
    return diceRoll * mult;
  }
  if (space.type === 'property') {
    const prop = owner.properties.find(p => p.id === space.id);
    if (!prop) return 0;
    const houses = prop.houses || 0;
    const monopoly = hasColorGroup(owner.id, space.color, allPlayers);
    if (houses === 0 && monopoly) return space.rent[0] * 2;
    return space.rent[houses] || space.rent[0];
  }
  return 0;
}

export function canBuildHouse(playerId, propertyId, players) {
  const player = players.find(p => p.id === playerId);
  if (!player) return false;
  const prop = BOARD_SPACES.find(s => s.id === propertyId);
  if (!prop || prop.type !== 'property') return false;
  if (!hasColorGroup(playerId, prop.color, players)) return false;
  const playerProp = player.properties.find(p => p.id === propertyId);
  if (!playerProp || playerProp.houses >= 5) return false;
  // Even building rule
  const colorProps = BOARD_SPACES.filter(s => s.type === 'property' && s.color === prop.color);
  const minHouses = Math.min(...colorProps.map(cp => {
    const pp = player.properties.find(p => p.id === cp.id);
    return pp ? (pp.houses || 0) : 0;
  }));
  return (playerProp.houses || 0) <= minHouses;
}

export function drawCard(deck) {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return shuffled[0];
}

export function findNearestStation(position) {
  const stations = BOARD_SPACES.filter(s => s.type === 'station').map(s => s.id);
  for (let i = 1; i <= 40; i++) {
    const check = (position + i) % 40;
    if (stations.includes(check)) return check;
  }
  return stations[0];
}

export function applyCardAction(card, currentPlayer, allPlayers, gameState) {
  let updatedPlayer = { ...currentPlayer };
  let updatedPlayers = allPlayers.map(p => ({ ...p }));
  let messages = [];
  let newPosition = updatedPlayer.position;
  let extraAction = null;

  switch (card.action) {
    case 'collect':
      updatedPlayer.money += card.amount;
      messages.push(`${currentPlayer.name} menerima ${formatRp(card.amount)}`);
      break;
    case 'pay':
      updatedPlayer.money -= card.amount;
      messages.push(`${currentPlayer.name} membayar ${formatRp(card.amount)}`);
      break;
    case 'payall':
      const others = updatedPlayers.filter(p => p.id !== currentPlayer.id && !p.bankrupt);
      updatedPlayer.money -= card.amount * others.length;
      updatedPlayers = updatedPlayers.map(p => {
        if (p.id !== currentPlayer.id && !p.bankrupt) return { ...p, money: p.money + card.amount };
        return p;
      });
      messages.push(`${currentPlayer.name} membayar THR ${formatRp(card.amount)} ke setiap pemain`);
      break;
    case 'goto':
      if (card.target === 0 || card.target !== undefined) {
        const target = card.target ?? 0;
        const crossedGo = target <= currentPlayer.position && target !== currentPlayer.position;
        if (crossedGo || target === 0) updatedPlayer.money += GO_MONEY;
        newPosition = target;
        updatedPlayer.position = newPosition;
        if (card.amount > 0) updatedPlayer.money += card.amount;
      }
      messages.push(`${currentPlayer.name} pindah ke ${BOARD_SPACES[newPosition]?.name}`);
      break;
    case 'moveback':
      newPosition = (currentPlayer.position - card.amount + 40) % 40;
      updatedPlayer.position = newPosition;
      messages.push(`${currentPlayer.name} mundur ${card.amount} petak ke ${BOARD_SPACES[newPosition]?.name}`);
      break;
    case 'gotojail':
      updatedPlayer.position = JAIL_SPACE;
      updatedPlayer.inJail = true;
      updatedPlayer.jailTurns = 0;
      messages.push(`${currentPlayer.name} masuk Macet Parah!`);
      break;
    case 'neareststation':
      newPosition = findNearestStation(currentPlayer.position);
      updatedPlayer.position = newPosition;
      extraAction = 'neareststation';
      messages.push(`${currentPlayer.name} pindah ke stasiun terdekat: ${BOARD_SPACES[newPosition]?.name}`);
      break;
    case 'propertytax':
      const houses = updatedPlayer.properties.reduce((acc, p) => acc + (p.houses < 5 ? p.houses : 0), 0);
      const resorts = updatedPlayer.properties.filter(p => p.houses === 5).length;
      const tax = houses * 25 + resorts * 100;
      updatedPlayer.money -= tax;
      messages.push(`${currentPlayer.name} bayar PBB: ${formatRp(tax)} (${houses} Warung, ${resorts} Resort)`);
      break;
    case 'jailcard':
      updatedPlayer.hasJailCard = true;
      messages.push(`${currentPlayer.name} mendapat kartu Bebas Macet!`);
      break;
    default:
      break;
  }

  updatedPlayers = updatedPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
  return { updatedPlayers, messages, extraAction };
}

export function checkBankruptcy(player) {
  return player.money < 0;
}

export function initGameState(players, chestDeck, chanceDeck) {
  return {
    players,
    currentPlayerIndex: 0,
    phase: 'roll',
    diceResult: null,
    lastCard: null,
    cardDrawCount: 0,
    messages: [],
    properties: {},
    chestDeck,
    chanceDeck,
    winner: null,
    turnCount: 0,
    doublesStreak: 0,
    nearestStationDoubleRent: false,
  };
}
