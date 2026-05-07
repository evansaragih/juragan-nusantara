# 🦅 Juragan Nusantara
**Tycoon of the Archipelago — Indonesian-Themed Monopoly Board Game**

Built by **Evan Saragih** as a UI/UX Case Study.

---

## 🚀 Setup

```bash
npm install
npm start
```

Opens at `http://localhost:3000`

---

## 🎮 Features

### Core Gameplay
- ✅ 2–8 players hot-seat multiplayer
- ✅ 40-space board (all Indonesian cities/regions)
- ✅ Roll dice, move token, take space action
- ✅ Buy properties, stations, utilities
- ✅ Pay rent to property owners
- ✅ Doubles = roll again; 3x doubles = Macet Parah (Jail)
- ✅ Kartu Dana Gotong Royong (Community Chest)
- ✅ Kartu Nasib (Chance)
- ✅ Macet Parah (Jail) with fine / card / doubles escape
- ✅ Build Warungs (Houses) and Resorts (Hotels)
- ✅ Trading window (properties + cash)
- ✅ Bankruptcy detection
- ✅ Winner detection
- ✅ Game log / history

### Indonesian Theme
- 🏙️ All 40 spaces are Indonesian cities/landmarks
- 🗺️ Properties grouped by region (Papua, Sulawesi, Kalimantan, etc.)
- 🎭 8 culturally-themed player tokens
- 💰 Koin Nusantara (KN) currency
- 🃏 10 Gotong Royong cards + 10 Nasib cards with local flavor
- 🦅 Garuda eagle center emblem
- 🎨 Batik-inspired dark board aesthetic
- ✈️ Pelabuhan, Stasiun, Terminal, Bandara as transport hubs

### Design System
- Dark gold batik aesthetic (Cinzel font family)
- Color-coded regional property groups
- Glassmorphism player panels
- Animated dice rolling
- Responsive game log

---

## 📁 File Structure

```
juragan-nusantara/
├── public/
│   └── index.html
├── src/
│   ├── game/
│   │   ├── constants.js     Board spaces, cards, tokens, rules
│   │   └── engine.js        Pure game logic functions
│   ├── hooks/
│   │   └── useGameState.js  React state + all game actions
│   ├── components/
│   │   ├── Lobby.js         Player setup screen
│   │   ├── Board.js         40-space visual board
│   │   └── GamePanel.js     Dice, actions, trade, build panel
│   ├── App.js               Root component
│   ├── index.js             Entry point
│   └── index.css            Global styles
└── package.json
```

---

## 🗺️ Board Layout

| Corner | Meaning |
|--------|---------|
| 0 - Mulai | Go — collect 200 KN |
| 10 - Macet Parah | Jail / Gridlock |
| 20 - Alun-Alun | Free Parking |
| 30 - Ganjil-Genap | Go to Jail |

| Color | Region | Cities |
|-------|--------|--------|
| 🟤 Brown | Papua | Merauke, Jayapura |
| 🩵 Light Blue | Nusa Tenggara | Kupang, Mataram, Ambon |
| 🩷 Pink | Sulawesi | Palu, Manado, Makassar |
| 🟠 Orange | Kalimantan | Pontianak, Samarinda, Balikpapan |
| 🔴 Red | Sumatra | Padang, Palembang, Medan |
| 🟡 Yellow | Central Java | Solo, Yogyakarta, Semarang |
| 🟢 Green | Bali & West Java | Bandung, Surabaya, Denpasar |
| 🔵 Dark Blue | Megacities | IKN Nusantara, Jakarta |

---

## 🎯 How to Play

1. **Setup**: Name your players, pick tokens, click Mulai
2. **Your Turn**: Click "Lempar Dadu" to roll
3. **Landing**: Buy the property, pay rent, or draw a card
4. **Building**: Once you own a full color group, build Warungs then Resorts
5. **Trading**: Use the Trade window to negotiate with other players
6. **Jail**: Pay 50 KN fine, use Bebas Macet card, or roll doubles to escape
7. **Win**: Bankrupt all other players to become Juragan!

---

## 🔮 Future Enhancements

- [ ] Real-time WebSocket multiplayer (Socket.io)
- [ ] Animated 3D dice with teak wood texture
- [ ] Mortgage system
- [ ] Auction for unowned properties
- [ ] Sound effects (wooden dice, currency sounds)
- [ ] Mobile responsive layout
- [ ] Persistent game rooms with unique codes (JKT88X format)

---

## 🧠 Case Study Notes

This project demonstrates:
- **System-level UX thinking** — designing a complete game flow with 40 unique spaces, 20 cards, 8 players
- **State management** — complex React state with turns, phases, jail, doubles streaks, bankruptcy
- **Cultural design** — integrating Indonesian heritage (batik aesthetics, local cities, cultural cards)
- **Component architecture** — clean separation of game engine, UI, and state
- **Product thinking** — designed for hot-seat play, scalable to WebSocket multiplayer

---

*Juragan Nusantara — built with ❤️ for Indonesia*
