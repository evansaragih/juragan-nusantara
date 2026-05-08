import React, { useState, useEffect, useRef, useCallback } from 'react'; // eslint-disable-line
import { BOARD_SPACES } from '../game/constants';
import { formatRp } from '../utils/format';
import { hasColorGroup } from '../game/engine';

const COLOR_HEX = {
  brown: '#8B4513', lightblue: '#87CEEB', pink: '#FF69B4',
  orange: '#FF8C00', red: '#DC143C', yellow: '#DAA520',
  green: '#2D6A4F', darkblue: '#00008B',
};

// ─── Hold-to-roll button ────────────────────────────────────────────────────

function RollButton({ onRoll, onRolling, isDouble }) {
  const [isPressing, setIsPressing] = useState(false);
  const [power, setPower]           = useState(0);
  const rafRef    = useRef(null);
  const startRef  = useRef(0);
  const activeRef = useRef(false); // prevents double-fire on mouseleave+mouseup

  const startPress = (e) => {
    e.preventDefault();
    if (activeRef.current) return;
    activeRef.current = true;
    setIsPressing(true);
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1800;
      setPower((1 - Math.cos(elapsed * Math.PI * 2)) / 2); // smooth 0→1→0 wave
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const endPress = () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setIsPressing(false);
    setPower(0);
    if (onRolling) onRolling(true);
    onRoll();
    setTimeout(() => onRolling && onRolling(false), 860);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const ringDeg   = Math.round(power * 360);
  const btnScale  = isPressing ? 1 + power * 0.13 : 1;
  const glowSize  = isPressing ? 20 + power * 30 : 14;

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', touchAction: 'none' }}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={() => activeRef.current && endPress()}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={endPress}
    >
      {/* Spinning outer glow while charging */}
      {isPressing && (
        <div style={{
          position: 'absolute',
          width: 140, height: 140,
          borderRadius: '50%',
          background: `conic-gradient(rgba(255,80,190,0.85) ${ringDeg}deg, transparent ${ringDeg}deg)`,
          filter: 'blur(3px)',
          animation: 'none',
        }} />
      )}

      {/* Power arc ring */}
      <div style={{
        position: 'absolute',
        width: 124, height: 124,
        borderRadius: '50%',
        background: isPressing
          ? `conic-gradient(#FF4DC8 ${ringDeg}deg, rgba(80,0,50,0.35) ${ringDeg}deg)`
          : 'rgba(80,0,50,0.25)',
        transition: isPressing ? 'none' : 'background 0.3s',
      }} />

      {/* Dark gap between ring and button */}
      <div style={{ position: 'absolute', width: 114, height: 114, borderRadius: '50%', background: 'rgba(8,0,6,0.92)' }} />

      {/* Static glow border */}
      <div style={{
        position: 'absolute',
        width: 108, height: 108,
        borderRadius: '50%',
        border: `3px solid rgba(255,90,180,${isPressing ? 0.85 : 0.45})`,
        boxShadow: [
          `0 0 ${glowSize}px rgba(255,80,190,${isPressing ? 0.8 : 0.35})`,
          `0 0 ${glowSize * 2}px rgba(255,80,190,${isPressing ? 0.4 : 0.15})`,
        ].join(', '),
        transition: 'box-shadow 0.08s, border-color 0.08s',
      }} />

      {/* Main clickable button face */}
      <div style={{
        position: 'relative',
        width: 98, height: 98,
        borderRadius: '50%',
        background: isPressing
          ? 'radial-gradient(circle at 36% 32%, #FFA8E0, #D4108A)'
          : 'radial-gradient(circle at 36% 32%, #FF78C4, #B8107E)',
        boxShadow: [
          `0 0 ${glowSize * 1.2}px rgba(255,80,190,${isPressing ? 0.95 : 0.55})`,
          '0 8px 24px rgba(0,0,0,0.75)',
          'inset 0 3px 7px rgba(255,200,235,0.5)',
          'inset 0 -4px 10px rgba(0,0,0,0.35)',
        ].join(', '),
        border: '2.5px solid rgba(255,190,225,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        cursor: 'pointer',
        transform: `scale(${btnScale})`,
        transition: 'transform 0.04s, background 0.08s',
        zIndex: 2,
      }}>
        <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 2 }}>🎲</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 13, color: '#fff', letterSpacing: 3, textShadow: '0 1px 4px rgba(0,0,0,0.55)' }}>
          ROLL
        </div>
      </div>

      {/* Doubles badge */}
      {isDouble && (
        <div style={{
          position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #B8860B, #FFD700)',
          borderRadius: 8, padding: '3px 10px',
          fontSize: 10, fontWeight: 800, color: '#1A0F00',
          whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 2px 8px rgba(255,215,0,0.5)',
        }}>
          🎲 Doubles! Lempar Lagi
        </div>
      )}

      {/* Power bar text feedback */}
      {isPressing && (
        <div style={{
          position: 'absolute', bottom: -26, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: '#FF69B4',
          textShadow: '0 0 8px rgba(255,80,190,0.9)',
          whiteSpace: 'nowrap', letterSpacing: 1,
        }}>
          {'█'.repeat(Math.round(power * 10))}{'░'.repeat(10 - Math.round(power * 10))}
        </div>
      )}
    </div>
  );
}

// ─── Player card ────────────────────────────────────────────────────────────

function PlayerCard({ player, isActive, players, moneyAnims, rank }) {
  const ownedProps = BOARD_SPACES.filter(s => player.properties.some(p => p.id === s.id));
  const colorGroups = [...new Set(ownedProps.filter(p => p.color).map(p => p.color))]
    .filter(c => hasColorGroup(player.id, c, players));

  const totalAssets = player.money + ownedProps.reduce((sum, p) => {
    const pp = player.properties.find(x => x.id === p.id);
    return sum + (p.price || 0) + (pp.houses || 0) * (p.houseCost || 0);
  }, 0);

  const teamBg      = player.team === 'red' ? 'rgba(200,20,50,0.9)' : 'rgba(0,90,230,0.9)';
  const activeGlow  = isActive ? `0 0 22px ${player.team === 'red' ? '#FF2244' : '#2266FF'}, 0 0 6px ${player.team === 'red' ? '#FF2244' : '#2266FF'}` : 'none';
  const rankColors  = ['#FFD700', '#C0C0C0', '#CD7F32', '#888'];
  const rankLabel   = ['1st', '2nd', '3rd', '4th'];

  return (
    <div style={{
      width: 208,
      background: 'rgba(12,6,0,0.88)',
      border: `2px solid ${isActive ? '#FFD700' : 'rgba(255,255,255,0.18)'}`,
      borderRadius: 14,
      overflow: 'visible',
      transition: 'all 0.3s',
      opacity: player.bankrupt ? 0.38 : 1,
      boxShadow: [isActive ? `0 0 28px ${player.team === 'red' ? '#CC1133' : '#1155EE'}` : '0 4px 16px rgba(0,0,0,0.65)', activeGlow].filter(Boolean).join(', '),
      backdropFilter: 'blur(6px)',
      position: 'relative',
    }}>
      {/* Rank badge */}
      {rank !== undefined && (
        <div style={{
          position: 'absolute', top: -10, right: -8,
          width: 30, height: 30, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${rankColors[rank] || '#888'}, rgba(0,0,0,0.8))`,
          border: `2px solid ${rankColors[rank] || '#888'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 900, color: '#fff',
          boxShadow: `0 0 10px ${rankColors[rank] || '#888'}66`,
          zIndex: 5,
        }}>
          {rankLabel[rank] || '?'}
        </div>
      )}

      {/* Header */}
      <div style={{ background: teamBg, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: '12px 12px 0 0' }}>
        <div style={{ fontSize: 22 }}>{player.token.emoji}</div>
        <div style={{ flex: 1, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, color: '#FFF', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {player.name}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '9px 12px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ fontSize: 11, color: '#C8A96E', fontWeight: 600 }}>Total</div>
          <div style={{ fontSize: 12, color: '#FFF', fontWeight: 800 }}>{formatRp(totalAssets)}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ fontSize: 11, color: '#C8A96E', fontWeight: 600 }}>Marble</div>
          <div style={{ fontSize: 12, color: '#4CAF50', fontWeight: 800 }}>{formatRp(player.money)}</div>
          {moneyAnims?.filter(a => a.playerId === player.id).map(a => (
            <div key={a.id} className="money-flying" style={{
              color: a.amount > 0 ? '#4CAF50' : '#FF6B6B',
              position: 'absolute', right: 0, top: -10,
              fontSize: 14, fontWeight: 800,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}>
              {a.amount > 0 ? '+' : ''}{formatRp(a.amount)}
            </div>
          ))}
        </div>
        {colorGroups.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            {colorGroups.map(c => (
              <div key={c} style={{ width: 14, height: 8, borderRadius: 2, background: COLOR_HEX[c], border: '1px solid rgba(255,255,255,0.3)' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modals (unchanged) ─────────────────────────────────────────────────────

function CardModal({ card, onClose }) {
  if (!card) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }} onClick={onClose}>
      <div style={{ background: 'linear-gradient(135deg, #1A0F00 0%, #2D1A00 100%)', border: '2px solid #FFD700', borderRadius: 16, padding: 32, maxWidth: 340, textAlign: 'center', boxShadow: '0 0 40px rgba(255,215,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎴</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", color: '#FFD700', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>{card.text}</div>
        <button onClick={onClose} style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#1A0F00', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>OK</button>
      </div>
    </div>
  );
}

function TradeModal({ currentPlayer, players, onTrade, onClose }) {
  const [targetId, setTargetId] = useState('');
  const [fromProps, setFromProps] = useState([]);
  const [toProps, setToProps]     = useState([]);
  const [fromMoney, setFromMoney] = useState(0);
  const [toMoney, setToMoney]     = useState(0);

  const target    = players.find(p => p.id === targetId);
  const myProps   = BOARD_SPACES.filter(s => currentPlayer.properties.some(p => p.id === s.id));
  const theirProps = target ? BOARD_SPACES.filter(s => target.properties.some(p => p.id === s.id)) : [];
  const toggle    = (id, list, set) => set(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #1A0F00 0%, #2D1A00 100%)', border: '2px solid #FFD700', borderRadius: 16, padding: 24, width: 500, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 0 40px rgba(255,215,0,0.3)' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", color: '#FFD700', fontSize: 16, marginBottom: 16 }}>🤝 Trade Window</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: '#C8A96E', fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>Pilih Lawan Trade:</label>
          <select value={targetId} onChange={e => { setTargetId(e.target.value); setToProps([]); }} style={{ width: '100%', background: '#1A0F00', color: '#FFD700', border: '1px solid #C8A96E', borderRadius: 6, padding: '6px 8px', fontFamily: "'Outfit', sans-serif", fontSize: 12, marginTop: 4 }}>
            <option value="">-- Pilih Pemain --</option>
            {players.filter(p => p.id !== currentPlayer.id && !p.bankrupt).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Properti Kamu:', props: myProps, selected: fromProps, setSelected: setFromProps, money: fromMoney, setMoney: setFromMoney, maxMoney: currentPlayer.money },
            { label: `Properti ${target?.name || 'Mereka'}:`, props: theirProps, selected: toProps, setSelected: setToProps, money: toMoney, setMoney: setToMoney, maxMoney: target?.money || 0 },
          ].map(({ label, props, selected, setSelected, money, setMoney, maxMoney }) => (
            <div key={label}>
              <div style={{ color: '#FFD700', fontSize: 11, fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>{label}</div>
              {props.map(p => (
                <div key={p.id} onClick={() => toggle(p.id, selected, setSelected)} style={{ padding: '4px 8px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', background: selected.includes(p.id) ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selected.includes(p.id) ? '#FFD700' : 'rgba(255,255,255,0.1)'}`, color: '#C8A96E', fontSize: 11, fontFamily: "'Outfit', sans-serif" }}>
                  {p.name}{p.color && <span style={{ marginLeft: 4, width: 8, height: 8, borderRadius: 2, display: 'inline-block', background: COLOR_HEX[p.color] }} />}
                </div>
              ))}
              <input type="number" min={0} max={maxMoney} value={money} onChange={e => setMoney(Number(e.target.value))} style={{ width: '100%', background: '#1A0F00', color: '#4CAF50', border: '1px solid #C8A96E', borderRadius: 6, padding: '4px 8px', fontFamily: "'Outfit', sans-serif", fontSize: 12, marginTop: 4 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => { if (!targetId) return; onTrade({ fromId: currentPlayer.id, toId: targetId, fromProperties: fromProps, toProperties: toProps, fromMoney, toMoney }); onClose(); }} style={{ flex: 1, background: 'linear-gradient(135deg, #B8860B, #FFD700)', border: 'none', borderRadius: 8, padding: '10px', color: '#1A0F00', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Setuju Trade</button>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #C8A96E', borderRadius: 8, padding: '10px', color: '#C8A96E', fontFamily: "'Outfit', sans-serif", fontSize: 12, cursor: 'pointer' }}>Batal</button>
        </div>
      </div>
    </div>
  );
}

// ─── GamePanel ──────────────────────────────────────────────────────────────

export default function GamePanel({
  state, currentPlayer, landingAction,
  onRoll, onDrawCard, onBuy, onPayRent, onSkip,
  onPayJail, onUseJailCard, onBuildHouse, onEndTurn, onTrade,
  onRolling,
}) {
  const [showTrade, setShowTrade] = useState(false);
  const [showCard,  setShowCard]  = useState(false);
  const [showBuild, setShowBuild] = useState(false);
  const [moneyAnims, setMoneyAnims] = useState([]);
  const prevMoneyRef    = useRef({});
  const prevDrawCount   = useRef(0);
  const cardAutoClose   = useRef(null);

  // Reset modals at the start of every new turn
  useEffect(() => {
    if (state.phase === 'roll' || state.phase === 'moving') {
      setShowBuild(false);
      setShowTrade(false);
      setShowCard(false);
    }
  }, [state.phase]);

  // Show card modal whenever any player draws a card (human or robot)
  useEffect(() => {
    if (state.cardDrawCount > prevDrawCount.current) {
      prevDrawCount.current = state.cardDrawCount;
      clearTimeout(cardAutoClose.current);
      setShowCard(true);
      setShowTrade(false);   // never overlap card + trade
      setShowBuild(false);
      // Auto-dismiss for robot turns so game keeps flowing
      if (currentPlayer?.isRobot) {
        cardAutoClose.current = setTimeout(() => setShowCard(false), 1800);
      }
    }
  }, [state.cardDrawCount, currentPlayer]);

  useEffect(() => () => clearTimeout(cardAutoClose.current), []);

  useEffect(() => {
    state.players.forEach(p => {
      const prev = prevMoneyRef.current[p.id];
      if (prev !== undefined && prev !== p.money) {
        const diff  = p.money - prev;
        const anim  = { id: Date.now() + Math.random(), playerId: p.id, amount: diff };
        setMoneyAnims(a => [...a, anim]);
        setTimeout(() => setMoneyAnims(a => a.filter(x => x.id !== anim.id)), 1000);
      }
      prevMoneyRef.current[p.id] = p.money;
    });
  }, [state.players]);

  const space       = currentPlayer ? BOARD_SPACES[currentPlayer.position] : null;
  const owner       = space ? state.players.find(p => p.properties.some(pp => pp.id === space.id)) : null;
  const canAffordBuy = space && currentPlayer && currentPlayer.money >= (space.price || 0);

  const buildableProps = currentPlayer
    ? currentPlayer.properties.map(p => BOARD_SPACES.find(s => s.id === p.id)).filter(s => s?.type === 'property')
    : [];

  // Rank players by total assets
  const ranked = [...state.players]
    .map((p, i) => ({ ...p, _orig: i }))
    .sort((a, b) => {
      const assetsFn = pl => pl.money + BOARD_SPACES.filter(s => pl.properties.some(pp => pp.id === s.id)).reduce((sum, s) => sum + (s.price || 0), 0);
      return assetsFn(b) - assetsFn(a);
    });

  const btnBase = { border: 'none', borderRadius: 10, padding: '11px 16px', fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'auto' };
  const btnGold = { ...btnBase, background: 'linear-gradient(135deg, #B8860B, #FFD700)', color: '#1A0F00', boxShadow: '0 4px 18px rgba(255,215,0,0.45)' };
  const btnRed  = { ...btnBase, background: 'linear-gradient(135deg, #8B0000, #DC143C)', color: '#fff', boxShadow: '0 4px 15px rgba(220,20,60,0.4)' };
  const btnGray = { ...btnBase, background: 'rgba(0,0,0,0.82)', color: '#C8A96E', border: '1px solid rgba(255,215,0,0.3)', backdropFilter: 'blur(10px)' };

  const corners = [
    { top: 20, left: 20 },
    { top: 20, right: 20 },
    { bottom: 20, left: 20 },
    { bottom: 20, right: 20 },
  ];

  const isRollPhase   = !state.winner && currentPlayer && state.phase === 'roll' && !currentPlayer.inJail;
  const isActionPhase = !state.winner && currentPlayer && !['roll', 'moving'].includes(state.phase);
  const isJailPhase   = !state.winner && currentPlayer?.inJail && state.phase === 'roll';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* ── Player cards at screen corners ── */}
      {state.players.map((p, i) => {
        const rankIdx = ranked.findIndex(r => r.id === p.id);
        return (
          <div key={p.id} style={{ position: 'absolute', ...corners[i % 4], pointerEvents: 'auto', zIndex: 20 }}>
            <PlayerCard
              player={p}
              isActive={state.currentPlayerIndex === i && !state.winner}
              players={state.players}
              moneyAnims={moneyAnims}
              rank={rankIdx}
            />
          </div>
        );
      })}

      {/* ── Log at top center ── */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,215,0,0.22)', borderRadius: 12,
        padding: '10px 18px', width: 420, pointerEvents: 'auto', zIndex: 15,
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      }}>
        <div style={{ color: '#FFD700', fontSize: 12, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 5 }}>📜 Log Kejadian</div>
        <div style={{ maxHeight: 72, overflowY: 'auto' }}>
          {state.messages.slice(0, 5).map((m, i) => (
            <div key={m.id} style={{ color: i === 0 ? '#FFF' : 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.4, marginBottom: 3, fontFamily: "'Outfit', sans-serif" }}>
              {m.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Winner banner ── */}
      {state.winner && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          textAlign: 'center', padding: '30px 44px',
          background: 'rgba(10,5,0,0.92)', backdropFilter: 'blur(12px)',
          border: '2px solid #FFD700', borderRadius: 22,
          boxShadow: '0 0 60px rgba(255,215,0,0.55)', zIndex: 50, pointerEvents: 'auto',
        }}>
          <div style={{ fontSize: 68 }}>🏆</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: '#FFD700', fontSize: 26, marginTop: 12 }}>{state.winner.name}</div>
          <div style={{ color: '#C8A96E', fontSize: 15, fontFamily: "'Outfit', sans-serif" }}>Juragan Nusantara!</div>
        </div>
      )}

      {/* ── ROLL button — lower center inside the board ── */}
      {isRollPhase && (
        <div style={{ position: 'absolute', top: '72%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, pointerEvents: 'auto' }}>
          <RollButton onRoll={onRoll} onRolling={onRolling} isDouble={!!state.diceResult?.isDouble} />
        </div>
      )}

      {/* ── Action phase overlay (Info card + Buttons) ── */}
      {isActionPhase && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          zIndex: 30, width: 310, pointerEvents: 'none',
        }}>
          {/* Space info card */}
          {space && (
            <div style={{
              background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,215,0,0.4)', borderRadius: 14,
              padding: '13px 22px', textAlign: 'center',
              pointerEvents: 'auto', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', width: '100%'
            }}>
              <div style={{ color: '#FFD700', fontSize: 17, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
                {space.icon || '📍'} {space.name}
              </div>
              {space.price && <div style={{ color: '#C8A96E', fontSize: 13 }}>Harga: {formatRp(space.price)}</div>}
              {owner && owner.id !== currentPlayer?.id && <div style={{ color: '#FF6B6B', fontSize: 12, fontWeight: 700, marginTop: 4 }}>Milik: {owner.name}</div>}
              {owner && owner.id === currentPlayer?.id && <div style={{ color: '#4CAF50', fontSize: 12, fontWeight: 700, marginTop: 4 }}>✓ Milik kamu</div>}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', pointerEvents: 'auto' }}>
          {/* Card action */}
          {state.phase === 'card' && (
            <button style={{ ...btnGold, width: '100%' }} onClick={onDrawCard}>
              🎴 Ambil Kartu
            </button>
          )}

          {/* Buy / Rent / Owned */}
          {state.phase === 'action' && landingAction === 'buy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                <button style={{ ...btnGray, flex: 1 }} onClick={onSkip}>⏭ Lewat</button>
                {canAffordBuy && (
                  <button style={{ ...btnGold, flex: 1.5 }} onClick={() => onBuy(0)}>
                    Tanah ({formatRp(space?.price || 0)})
                  </button>
                )}
              </div>
              {space?.houseCost && (
                <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                  {currentPlayer.money >= space.price + space.houseCost && (
                    <button style={{ ...btnGold, flex: 1 }} onClick={() => onBuy(1)}>
                      Tanah + 1 ({formatRp(space.price + space.houseCost)})
                    </button>
                  )}
                  {currentPlayer.money >= space.price + space.houseCost * 2 && (
                    <button style={{ ...btnGold, flex: 1 }} onClick={() => onBuy(2)}>
                      Tanah + 2 ({formatRp(space.price + space.houseCost * 2)})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {state.phase === 'action' && landingAction === 'rent' && (
            <button style={{ ...btnRed, width: '100%' }} onClick={onPayRent}>
              💸 Bayar Sewa ke {owner?.name}
            </button>
          )}
          {state.phase === 'action' && landingAction === 'owned' && space?.houseCost && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              <button style={{ ...btnGray, width: '100%' }} onClick={onSkip}>⏭ Lanjut Tanpa Bangun</button>
              {(() => {
                const prop = currentPlayer.properties.find(p => p.id === space.id);
                const houses = prop?.houses || 0;
                if (houses < 3 && currentPlayer.money >= space.houseCost) {
                  return (
                    <button style={{ ...btnGold, width: '100%' }} onClick={() => { onBuildHouse(space.id); onSkip(); }}>
                      🏗️ Bangun +1 ({formatRp(space.houseCost)})
                    </button>
                  );
                } else if (houses === 3 && currentPlayer.money >= space.houseCost * 2) {
                  return (
                    <button style={{ ...btnGold, width: '100%' }} onClick={() => { onBuildHouse(space.id); onSkip(); }}>
                      🏰 Bangun Landmark ({formatRp(space.houseCost * 2)})
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          )}
          {state.phase === 'action' && landingAction === 'owned' && !space?.houseCost && (
            <button style={{ ...btnGray, width: '100%' }} onClick={onSkip}>⏭ Lanjut</button>
          )}

          {/* End turn */}
          {state.phase === 'endturn' && (
            <button style={{ ...btnGold, width: '100%' }} onClick={onEndTurn}>➡️ Akhiri Giliran</button>
          )}

          {/* Build / Trade toggles */}
          {(state.phase === 'endturn') && buildableProps.length > 0 && (
            <button style={{ ...btnGray, width: '100%' }} onClick={() => setShowBuild(!showBuild)}>
              🏗️ Bangun Warung / Resort
            </button>
          )}
          {(state.phase === 'endturn') && state.players.length > 1 && (
            <button style={{ ...btnGray, width: '100%' }} onClick={() => setShowTrade(true)}>
              🤝 Tawar Properti (Trade)
            </button>
          )}
          </div>
        </div>
      )}

      {/* ── Roll phase secondary actions (trade/build) ── */}
      {isRollPhase && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 10, zIndex: 30, pointerEvents: 'auto',
        }}>
          {buildableProps.length > 0 && (
            <button style={{ ...btnGray, fontSize: 12, padding: '8px 14px' }} onClick={() => setShowBuild(!showBuild)}>
              🏗️ Bangun
            </button>
          )}
          {state.players.length > 1 && (
            <button style={{ ...btnGray, fontSize: 12, padding: '8px 14px' }} onClick={() => setShowTrade(true)}>
              🤝 Trade
            </button>
          )}
        </div>
      )}

      {/* ── Jail options ── */}
      {isJailPhase && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
          border: '1px solid #FF6B6B', borderRadius: 14, padding: 20,
          width: 300, pointerEvents: 'auto', zIndex: 30,
          boxShadow: '0 0 30px rgba(220,20,60,0.3)',
        }}>
          <div style={{ color: '#FF6B6B', fontSize: 15, fontWeight: 900, fontFamily: "'Outfit', sans-serif", marginBottom: 14, textAlign: 'center' }}>
            🚦 Kamu di Macet Parah!
          </div>
          {currentPlayer.hasJailCard && (
            <button style={{ ...btnGold, width: '100%', marginBottom: 8 }} onClick={onUseJailCard}>🃏 Pakai Kartu Bebas</button>
          )}
          {currentPlayer.money >= 50 && (
            <button style={{ ...btnGray, width: '100%', marginBottom: 8 }} onClick={onPayJail}>💸 Bayar Denda {formatRp(50)}</button>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <RollButton onRoll={onRoll} onRolling={onRolling} isDouble={false} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center', marginTop: 30, fontFamily: "'Outfit', sans-serif" }}>
            Tahan tombol ROLL untuk lempar dadu
          </div>
        </div>
      )}

      {/* ── Build panel ── */}
      {showBuild && currentPlayer && !state.winner && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(10,5,0,0.96)', border: '1px solid #FFD700', borderRadius: 16,
          padding: 20, width: 400, pointerEvents: 'auto', zIndex: 40,
          maxHeight: '40vh', overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ color: '#FFD700', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
              🏗️ Pilih properti untuk dibangun:
            </div>
            <button onClick={() => setShowBuild(false)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: 18, cursor: 'pointer' }}>✖</button>
          </div>
          {buildableProps.map(p => {
            const pp      = currentPlayer.properties.find(pp => pp.id === p.id);
            const houses  = pp?.houses || 0;
            const monopoly = hasColorGroup(currentPlayer.id, p.color, state.players);
            return (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 8, marginBottom: 8, opacity: monopoly ? 1 : 0.5 }}>
                <div>
                  <div style={{ color: '#C8A96E', fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#AAA' }}>{houses < 5 ? `${'🏠'.repeat(houses)} ${houses}/4 Warung` : '🏨 Resort'}{!monopoly && ' (Perlu monopoli)'}</div>
                </div>
                <button disabled={!monopoly || houses >= 5 || currentPlayer.money < p.houseCost} onClick={() => onBuildHouse(p.id)} style={{ ...btnGold, marginBottom: 0, padding: '6px 12px', fontSize: 12, opacity: (monopoly && houses < 5 && currentPlayer.money >= p.houseCost) ? 1 : 0.3 }}>
                  +{formatRp(p.houseCost)}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showTrade && <TradeModal currentPlayer={currentPlayer} players={state.players} onTrade={onTrade} onClose={() => setShowTrade(false)} />}
      {showCard && state.lastCard && <CardModal card={state.lastCard} onClose={() => setShowCard(false)} />}
    </div>
  );
}
