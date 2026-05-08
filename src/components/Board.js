import React from 'react'; // eslint-disable-line
import { BOARD_SPACES, COLOR_GROUPS } from '../game/constants';

const COLOR_HEX_LEGEND = {
  brown: '#8B4513', lightblue: '#87CEEB', pink: '#FF69B4',
  orange: '#FF8C00', red: '#DC143C', yellow: '#DAA520',
  green: '#2D6A4F', darkblue: '#00008B',
};

const PROP_BG = {
  brown:    '#D4955A',
  lightblue:'#3AAAD8',
  pink:     '#E05898',
  orange:   '#E88828',
  red:      '#D83030',
  yellow:   '#C8A818',
  green:    '#389830',
  darkblue: '#2840A8',
};

// ─── CSS 3D Building Cube ─────────────────────────────────────────────────
// Board is rotateX(52deg) rotateZ(-45deg). Visible faces of a cube on the board:
//   Top (+Z):   filter brightness 1.35
//   Front (+Y): filter brightness 1.0  — transform: rotateX(90deg)  from bottom edge
//   Left (-X):  filter brightness 0.68 — transform: rotateY(-90deg) from left edge

function BuildCube({ color, w = 10, d = 10, h = 11 }) {
  return (
    <div style={{ width: w, height: d, position: 'relative', transformStyle: 'preserve-3d', flexShrink: 0 }}>
      {/* Top face */}
      <div style={{
        position: 'absolute', inset: 0,
        background: color,
        filter: 'brightness(1.38)',
        transform: `translateZ(${h}px)`,
        borderRadius: 2,
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.45)',
      }} />
      {/* Front face — facing +Y (toward viewer in isometric) */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        width: w, height: h,
        background: `linear-gradient(to bottom, ${color}, color-mix(in srgb, ${color} 80%, #000 20%))`,
        transformOrigin: 'bottom center',
        transform: 'rotateX(90deg)',
        borderTop: '0.5px solid rgba(255,255,255,0.3)',
      }} />
      {/* Left face — facing −X (other visible side in isometric) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: h, height: d,
        background: `linear-gradient(to right, color-mix(in srgb, ${color} 55%, #000 45%), color-mix(in srgb, ${color} 70%, #000 30%))`,
        transformOrigin: 'left center',
        transform: 'rotateY(-90deg)',
        borderRight: '0.5px solid rgba(255,255,255,0.25)',
      }} />
    </div>
  );
}

// ─── Building Stack ───────────────────────────────────────────────────────

function BuildingStack({ houses, color }) {
  if (!houses || houses === 0) return null;

  if (houses >= 5) {
    // Resort / Landmark: tall center tower flanked by shorter towers
    return (
      <div style={{ display: 'flex', gap: 2, transformStyle: 'preserve-3d', alignItems: 'flex-end' }}>
        <BuildCube color={color} w={9} d={11} h={14} />
        <BuildCube color={color} w={11} d={11} h={28} />
        <BuildCube color={color} w={9} d={11} h={14} />
      </div>
    );
  }

  // 1–4 Warungs
  return (
    <div style={{ display: 'flex', gap: 2, transformStyle: 'preserve-3d' }}>
      {Array.from({ length: houses }).map((_, i) => (
        <BuildCube key={i} color={color} w={12} d={12} h={16} />
      ))}
    </div>
  );
}

// ─── Player Figure ─────────────────────────────────────────────────────────

function PlayerFigure({ p }) {
  const c = p.color;
  return (
    <div style={{
      transform: 'translateZ(26px)',
      pointerEvents: 'none',
      flexShrink: 0,
    }}>
      <svg width="30" height="50" viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ground shadow */}
        <ellipse cx="15" cy="48" rx="11" ry="3" fill="rgba(0,0,0,0.38)" />
        {/* Left leg */}
        <rect x="7"  y="33" width="7" height="13" rx="3.5" fill={c} />
        <rect x="7"  y="33" width="7" height="5"  rx="2"   fill="rgba(255,255,255,0.18)" />
        {/* Right leg */}
        <rect x="16" y="33" width="7" height="13" rx="3.5" fill={c} />
        <rect x="16" y="33" width="7" height="5"  rx="2"   fill="rgba(255,255,255,0.18)" />
        {/* Body */}
        <rect x="5" y="18" width="20" height="17" rx="6" fill={c} />
        <rect x="6" y="19" width="10" height="6"  rx="3" fill="rgba(255,255,255,0.38)" />
        <rect x="5" y="27" width="20" height="8"  rx="0" fill={c} style={{filter:'brightness(0.82)'}} />
        {/* Left arm */}
        <rect x="0"  y="20" width="6" height="11" rx="3" fill={c} style={{filter:'brightness(0.88)'}} />
        {/* Right arm */}
        <rect x="24" y="20" width="6" height="11" rx="3" fill={c} style={{filter:'brightness(0.88)'}} />
        {/* Neck */}
        <rect x="12" y="13" width="6" height="6" rx="2" fill={c} style={{filter:'brightness(0.92)'}} />
        {/* Head */}
        <circle cx="15" cy="10" r="9.5" fill={c} />
        <ellipse cx="11.5" cy="7.5" rx="4.5" ry="4" fill="rgba(255,255,255,0.5)" />
        <circle  cx="15" cy="10" r="9.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ─── Board Space Cell ──────────────────────────────────────────────────────

function SpaceCell({ space, players, size = 60, side }) {
  const playersHere = players.filter(p => p.position === space.id && !p.bankrupt);
  const isCorner    = [0, 10, 20, 30].includes(space.id);
  const dim         = isCorner ? Math.round(size * 1.6) : size;

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const owner        = players.find(p => p.properties.some(prop => prop.id === space.id && !p.bankrupt));
  const propertyData = owner ? owner.properties.find(prop => prop.id === space.id) : null;
  const houses       = propertyData?.houses || 0;
  const propColor    = PROP_BG[space.color];

  // Building position — toward the "back" of each cell in isometric view
  const buildPos = {
    bottom: { top: 2, left: 4 },
    top:    { bottom: 2, left: 4 },
    left:   { top: 2, right: 4 },
    right:  { top: 2, left: 4 },
  }[side] || { top: 2, left: 4 };

  return (
    <div style={{
      width: dim, height: dim,
      background: isCorner ? '#F0EAD2' : '#F7F2E8',
      border: '1px solid rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
      flexShrink: 0,
      cursor: 'pointer',
      transformStyle: 'preserve-3d',
    }}>
      {/* Color bar */}
      {propColor && (
        <div style={{ width: '100%', height: 10, background: propColor, borderBottom: '1px solid rgba(0,0,0,0.2)', flexShrink: 0 }} />
      )}

      {isCorner && (
        <div style={{ fontSize: 26, zIndex: 3, marginBottom: 2 }}>{space.icon}</div>
      )}
      {!isCorner && space.icon && (
        <div style={{ fontSize: 13, zIndex: 3 }}>{space.icon}</div>
      )}

      <div style={{
        fontSize: isCorner ? 10 : 7.5,
        fontFamily: "'Outfit', sans-serif",
        color: '#222',
        textAlign: 'center',
        lineHeight: 1.2,
        padding: '2px',
        wordBreak: 'break-word',
        zIndex: 3,
        maxWidth: '92%',
        fontWeight: 700,
      }}>
        {space.name}
      </div>

      {space.price && (
        <div style={{ fontSize: 7.5, color: '#666', fontFamily: "'Outfit', sans-serif", zIndex: 3, fontWeight: 600 }}>
          {formatRp(space.price)}
        </div>
      )}

      {/* 3D Buildings */}
      {houses > 0 && !isCorner && propColor && (
        <div style={{ position: 'absolute', ...buildPos, zIndex: 8, transformStyle: 'preserve-3d' }}>
          <BuildingStack houses={houses} color={propColor} />
        </div>
      )}

      {/* Player Figures */}
      {playersHere.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 2, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 1, zIndex: 10,
          transformStyle: 'preserve-3d',
        }}>
          {playersHere.map(p => (
            <PlayerFigure key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Board ─────────────────────────────────────────────────────────────────

export default function Board({ players }) {
  const CELL   = 60;
  const CORNER = Math.round(CELL * 1.6);
  const FRAME  = 22;
  const THICK  = 30;

  const boardSize  = 2 * CORNER + 9 * CELL;
  const totalSize  = boardSize + 2 * FRAME;
  const centerSize = 9 * CELL;

  const bottom = [BOARD_SPACES[0], ...BOARD_SPACES.slice(31, 40).reverse(), BOARD_SPACES[30]];
  const left   = BOARD_SPACES.slice(1, 10);
  const top    = BOARD_SPACES.slice(10, 21);
  const right  = BOARD_SPACES.slice(21, 30);

  return (
    <div style={{
      position: 'relative',
      width: totalSize, height: totalSize,
      flexShrink: 0,
      transform: 'rotateX(52deg) rotateZ(-45deg)',
      transformStyle: 'preserve-3d',
      transition: 'transform 0.5s ease',
    }}>

      {/* WEST thickness face */}
      <div style={{
        position: 'absolute',
        left: -(THICK - 2), top: THICK * 0.15,
        width: THICK, height: totalSize * 0.86,
        background: 'linear-gradient(to right, #1A0C00, #5C3800, #3A2200)',
        borderRadius: `${FRAME * 0.6}px 0 0 ${FRAME * 0.6}px`,
        zIndex: -1,
      }} />

      {/* SOUTH thickness face */}
      <div style={{
        position: 'absolute',
        bottom: -(THICK - 2), left: THICK * 0.15,
        width: totalSize * 0.86, height: THICK,
        background: 'linear-gradient(to bottom, #5C3800, #3A2200, #1A0C00)',
        borderRadius: `0 0 ${FRAME * 0.6}px ${FRAME * 0.6}px`,
        zIndex: -1,
      }} />

      {/* Golden frame surface */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(145deg, #E8C040 0%, #C89000 12%, #F0D060 25%, #B07800 38%, #D4A830 50%, #906000 62%, #C89828 75%, #A07420 88%, #784800 100%)',
        borderRadius: FRAME * 0.85,
        border: '2px solid rgba(255,220,80,0.55)',
        boxShadow: 'inset 0 2px 4px rgba(255,240,100,0.35), inset 0 -2px 4px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.5)',
        zIndex: 0,
      }} />

      {/* Inner recess shadow */}
      <div style={{
        position: 'absolute',
        top: FRAME - 3, left: FRAME - 3,
        width: boardSize + 6, height: boardSize + 6,
        borderRadius: 6,
        boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.65), inset 0 4px 8px rgba(0,0,0,0.5)',
        zIndex: 5, pointerEvents: 'none',
      }} />

      {/* Frame corner rivets */}
      {[{ top: 4, left: 4 }, { top: 4, right: 4 }, { bottom: 4, left: 4 }, { bottom: 4, right: 4 }].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: 18, height: 18, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #FFE060, #A07000)',
          border: '1px solid rgba(255,230,80,0.6)', zIndex: 6,
        }} />
      ))}

      {/* Board cells — preserve-3d so buildings use translateZ */}
      <div style={{ position: 'absolute', top: FRAME, left: FRAME, width: boardSize, height: boardSize, zIndex: 1, transformStyle: 'preserve-3d' }}>

        {/* Bottom row */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', width: boardSize }}>
          {bottom.map(s => <SpaceCell key={s.id} space={s} players={players} size={CELL} side="bottom" />)}
        </div>

        {/* Left column */}
        <div style={{ position: 'absolute', left: 0, bottom: CORNER, display: 'flex', flexDirection: 'column-reverse' }}>
          {left.map(s => <SpaceCell key={s.id} space={s} players={players} size={CELL} side="left" />)}
        </div>

        {/* Top row */}
        <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: boardSize }}>
          {top.map(s => <SpaceCell key={s.id} space={s} players={players} size={CELL} side="top" />)}
        </div>

        {/* Right column */}
        <div style={{ position: 'absolute', right: 0, top: CORNER, display: 'flex', flexDirection: 'column' }}>
          {right.map(s => <SpaceCell key={s.id} space={s} players={players} size={CELL} side="right" />)}
        </div>

        {/* Center */}
        <div style={{
          position: 'absolute',
          top: CORNER, left: CORNER,
          width: centerSize, height: centerSize,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          background: [
            'radial-gradient(ellipse at 45% 40%,',
            '  rgba(20,55,110,0.72) 0%,',
            '  rgba(8,28,72,0.82) 55%,',
            '  rgba(2,10,40,0.88) 100%)',
          ].join(''),
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: [
              'repeating-linear-gradient(0deg,   rgba(100,160,255,0.06) 0px, rgba(100,160,255,0.06) 1px, transparent 1px, transparent 44px)',
              'repeating-linear-gradient(90deg,  rgba(100,160,255,0.06) 0px, rgba(100,160,255,0.06) 1px, transparent 1px, transparent 44px)',
            ].join(', '),
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,20,0.5) 100%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 88, filter: 'drop-shadow(0 0 32px rgba(255,200,0,0.55))', zIndex: 2, userSelect: 'none', animation: 'float-bob 4s ease-in-out infinite', lineHeight: 1 }}>🦅</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 22, color: '#FFD700', textShadow: '0 0 24px rgba(255,215,0,0.9)', letterSpacing: '4px', zIndex: 2, marginTop: 8 }}>JURAGAN</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#C8A96E', letterSpacing: '7px', zIndex: 2, marginBottom: 20 }}>NUSANTARA</div>
          <div style={{ display: 'flex', gap: 6, zIndex: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '60%', marginTop: 4 }}>
            {Object.keys(COLOR_GROUPS).map(key => (
              <div key={key} style={{ width: 14, height: 8, borderRadius: 2, background: PROP_BG[key] || COLOR_HEX_LEGEND[key], border: '1px solid rgba(255,255,255,0.25)', boxShadow: `0 0 5px ${PROP_BG[key] || '#888'}88` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
