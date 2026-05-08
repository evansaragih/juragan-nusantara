import React, { useState, useEffect, useRef } from 'react'; // eslint-disable-line

const DOT_POSITIONS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 21], [72, 21], [28, 50], [72, 50], [28, 79], [72, 79]],
};

function DieDots({ value }) {
  const dots = DOT_POSITIONS[value] || [];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {dots.map(([x, y], i) => (
        <div key={i} className="dice-dot" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }} />
      ))}
    </div>
  );
}

function Die({ value, isRolling, delay = 0 }) {
  const faceRots = {
    1: 'rotateX(90deg)',
    2: 'rotateZ(-90deg)',
    3: 'rotateX(0deg)',
    4: 'rotateX(180deg)',
    5: 'rotateZ(90deg)',
    6: 'rotateX(-90deg)',
  };
  const finalRot = value
    ? `rotateX(-25deg) rotateY(-45deg) ${faceRots[value]}`
    : 'rotateX(-25deg) rotateY(-45deg)';
  return (
    <div className="dice-container">
      <div
        className={`dice-3d ${isRolling ? 'rolling' : ''}`}
        style={{
          transform: !isRolling ? finalRot : undefined,
          animationDelay: isRolling ? `${delay}ms` : '0ms',
        }}
      >
        <div className="dice-face" style={{ transform: 'translateZ(25px)' }}><DieDots value={1} /></div>
        <div className="dice-face" style={{ transform: 'rotateY(180deg) translateZ(25px)' }}><DieDots value={6} /></div>
        <div className="dice-face" style={{ transform: 'rotateY(90deg) translateZ(25px)' }}><DieDots value={2} /></div>
        <div className="dice-face" style={{ transform: 'rotateY(-90deg) translateZ(25px)' }}><DieDots value={5} /></div>
        <div className="dice-face" style={{ transform: 'rotateX(90deg) translateZ(25px)' }}><DieDots value={3} /></div>
        <div className="dice-face" style={{ transform: 'rotateX(-90deg) translateZ(25px)' }}><DieDots value={4} /></div>
      </div>
    </div>
  );
}

// animState machine: hidden → rolling → result → exiting → hidden
export default function DiceOverlay({ diceResult, isRolling }) {
  const [animState, setAnimState] = useState('hidden');
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRolling) {
      clearTimeout(timerRef.current);
      setAnimState('rolling');
    }
  }, [isRolling]);

  useEffect(() => {
    if (!isRolling && diceResult && animState === 'rolling') {
      setAnimState('result');
      timerRef.current = setTimeout(() => {
        setAnimState('exiting');
        setTimeout(() => setAnimState('hidden'), 520);
      }, 2600);
    }
  }, [isRolling, diceResult, animState]);

  // When turn ends diceResult is nulled — hide immediately
  useEffect(() => {
    if (!diceResult) {
      clearTimeout(timerRef.current);
      setAnimState('hidden');
    }
  }, [diceResult]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (animState === 'hidden') return null;

  const diceWrapAnim =
    animState === 'rolling' ? 'dice-enter 0.52s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
    : animState === 'exiting' ? 'dice-exit 0.48s ease-in forwards'
    : 'none';

  return (
    <div style={{
      position: 'fixed',
      top: '44%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 60,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
    }}>
      {/* Golden result ball (like Get Rich) */}
      {animState === 'result' && diceResult && (
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 30%, #FFF9A0, #FFB300 55%, #E07800 100%)',
          border: '3px solid rgba(255,245,100,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 44,
          color: '#5A2800',
          textShadow: '0 1px 3px rgba(255,255,200,0.5)',
          boxShadow: '0 0 55px rgba(255,200,0,0.95), 0 8px 30px rgba(0,0,0,0.7), inset 0 2px 6px rgba(255,255,200,0.4)',
          animation: 'result-pop 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        }}>
          {diceResult.total}
        </div>
      )}

      {/* Dice pair */}
      <div style={{ display: 'flex', gap: 30, animation: diceWrapAnim }}>
        <Die value={diceResult?.d1} isRolling={animState === 'rolling'} delay={0} />
        <Die value={diceResult?.d2} isRolling={animState === 'rolling'} delay={110} />
      </div>
    </div>
  );
}
