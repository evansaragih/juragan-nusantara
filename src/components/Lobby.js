import React, { useState } from 'react';
import { TOKENS, PLAYER_COLORS } from '../game/constants';
import { createPlayer } from '../game/engine';

export default function Lobby({ onStartGame }) {
  const [players, setPlayers] = useState([
    { name: 'Pemain 1', tokenId: 'angkot', color: PLAYER_COLORS[0], isRobot: false, team: 'red' },
    { name: 'PC (Robot)', tokenId: 'komodo', color: PLAYER_COLORS[1], isRobot: true, team: 'blue' },
  ]);

  const addPlayer = () => {
    if (players.length >= 4) return;
    const idx = players.length;
    const usedTokens = players.map(p => p.tokenId);
    const nextToken = TOKENS.find(t => !usedTokens.includes(t.id))?.id || TOKENS[idx % TOKENS.length].id;
    setPlayers([...players, {
      name: `Pemain ${idx + 1}`,
      tokenId: nextToken,
      color: PLAYER_COLORS[idx],
      isRobot: false,
      team: idx % 2 === 0 ? 'red' : 'blue',
    }]);
  };

  const removePlayer = (idx) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== idx));
  };

  const updatePlayer = (idx, key, val) => {
    setPlayers(players.map((p, i) => i === idx ? { ...p, [key]: val } : p));
  };

  const handleStart = () => {
    const gamePlayers = players.map((p, i) => {
      const token = TOKENS.find(t => t.id === p.tokenId) || TOKENS[i];
      const player = createPlayer(`p${i}`, p.name, token, p.color);
      player.isRobot = p.isRobot;
      player.team = p.team;
      return player;
    });
    onStartGame(gamePlayers);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D0800 0%, #1A0F00 50%, #0A0500 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif",
      padding: '2rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        ::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.3); border-radius: 3px; }
      `}</style>

      {/* Background pattern */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `repeating-linear-gradient(
          45deg, rgba(255,215,0,0.02) 0, rgba(255,215,0,0.02) 1px,
          transparent 0, transparent 50%
        )`,
        backgroundSize: '20px 20px',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 580,
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 12, filter: 'drop-shadow(0 0 20px rgba(255,180,0,0.6))' }}>🦅</div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            color: '#FFD700', fontSize: 32, margin: '0 0 8px',
            textShadow: '0 0 30px rgba(255,215,0,0.6)',
            letterSpacing: 3,
          }}>
            Juragan Nusantara
          </h1>
          <p style={{ color: '#C8A96E', fontSize: 13, margin: 0, letterSpacing: 4 }}>
            TYCOON OF THE ARCHIPELAGO
          </p>
        </div>

        {/* Players Setup */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 16, padding: '24px',
          backdropFilter: 'blur(10px)',
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20,
          }}>
            <div style={{ color: '#FFD700', fontSize: 14, fontWeight: 700 }}>
              Pemain ({players.length}/4)
            </div>
            {players.length < 4 && (
              <button onClick={addPlayer} style={{
                background: 'linear-gradient(135deg, #B8860B, #FFD700)',
                border: 'none', borderRadius: 8, padding: '6px 16px',
                color: '#1A0F00', fontFamily: "'Outfit', sans-serif",
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>+ Tambah Pemain</button>
            )}
          </div>

          {players.map((player, idx) => (
            <div key={idx} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              marginBottom: 12, padding: '12px',
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.15)',
              borderRadius: 10,
            }}>
              {/* Color dot */}
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: player.color, flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.3)',
              }} />

              {/* Name input */}
              <input
                value={player.name}
                onChange={e => updatePlayer(idx, 'name', e.target.value)}
                style={{
                  flex: 1, background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  borderRadius: 6, padding: '6px 10px',
                  color: '#FFD700', fontFamily: "'Outfit', sans-serif",
                  fontSize: 12, outline: 'none',
                }}
              />

              {/* Token select */}
              <select
                value={player.tokenId}
                onChange={e => updatePlayer(idx, 'tokenId', e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  borderRadius: 6, padding: '6px 8px',
                  color: '#C8A96E', fontFamily: "'Outfit', sans-serif",
                  fontSize: 12, cursor: 'pointer', outline: 'none',
                }}
              >
                {TOKENS.map(t => (
                  <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
                ))}
              </select>

              {/* Team select */}
              <select
                value={player.team}
                onChange={e => updatePlayer(idx, 'team', e.target.value)}
                style={{
                  background: player.team === 'red' ? 'rgba(220,20,60,0.3)' : 'rgba(0,191,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6, padding: '6px 8px',
                  color: 'white', fontFamily: "'Outfit', sans-serif",
                  fontSize: 12, cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="red">Red Team</option>
                <option value="blue">Blue Team</option>
              </select>

              {/* Robot Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FFD700', fontSize: 10 }}>
                <input
                  type="checkbox"
                  checked={player.isRobot}
                  onChange={e => updatePlayer(idx, 'isRobot', e.target.checked)}
                />
                Robot
              </label>

              {/* Remove */}
              {players.length > 2 && (
                <button onClick={() => removePlayer(idx)} style={{
                  background: 'transparent',
                  border: '1px solid rgba(220,20,60,0.4)',
                  borderRadius: 6, padding: '4px 8px',
                  color: '#DC143C', cursor: 'pointer', fontSize: 14,
                }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Rules quick summary */}
        <div style={{
          background: 'rgba(255,215,0,0.04)',
          border: '1px solid rgba(255,215,0,0.15)',
          borderRadius: 12, padding: '16px 20px',
          marginBottom: 20,
        }}>
          <div style={{ color: '#FFD700', fontSize: 12, marginBottom: 10, fontWeight: 700 }}>
            📜 Cara Bermain
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              '🎲 Lempar dadu & pindah token',
              '🏠 Beli properti untuk sewa',
              '🏗️ Bangun 4 Warung → Resort',
              '💸 Bayar sewa kalau melintas',
              '🤝 Trade properti antar pemain',
              '🚦 3x doubles = Macet Parah',
              '🎴 Kartu Nasib & Gotong Royong',
              '🏆 Bangkrutkan semua lawan!',
            ].map((r, i) => (
              <div key={i} style={{ color: '#C8A96E', fontSize: 10, lineHeight: 1.5 }}>{r}</div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={players.length < 2}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #8B6914 0%, #FFD700 50%, #B8860B 100%)',
            border: 'none', borderRadius: 12, padding: '16px',
            color: '#1A0F00', fontFamily: "'Outfit', sans-serif",
            fontSize: 16, fontWeight: 800, cursor: 'pointer',
            letterSpacing: 2,
            boxShadow: '0 4px 20px rgba(255,215,0,0.4)',
            transition: 'all 0.2s',
          }}
        >
          🦅 Mulai Permainan!
        </button>
      </div>
    </div>
  );
}
