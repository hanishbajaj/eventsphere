// SplashScreen.jsx — Cinematic EventSphere splash screen
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// ── Event icons that orbit the globe ──────────────────────────────────────────
const ORBIT_ICONS = [
  { emoji: '🎤', angle: 0,   radius: 1,    size: '1.5rem', delay: 0.6  },
  { emoji: '🎬', angle: 60,  radius: 1.08, size: '1.3rem', delay: 0.9  },
  { emoji: '🎵', angle: 120, radius: 0.95, size: '1.4rem', delay: 1.1  },
  { emoji: '🎭', angle: 180, radius: 1.05, size: '1.35rem', delay: 0.7 },
  { emoji: '🎟', angle: 240, radius: 1,    size: '1.3rem', delay: 1.0  },
  { emoji: '🎉', angle: 300, radius: 1.1,  size: '1.25rem', delay: 0.8 },
];

// ── Floating background particles ─────────────────────────────────────────────
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1.5 + Math.random() * 2.5,
  duration: 6 + Math.random() * 8,
  delay: Math.random() * 5,
  opacity: 0.15 + Math.random() * 0.35,
}));

// ── Globe SVG lines (latitude + longitude arcs) ────────────────────────────────
function GlobeLines({ size = 260 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  // Generate latitude lines
  const latLines = [-60, -30, 0, 30, 60].map((deg) => {
    const y = cy + r * Math.sin((deg * Math.PI) / 180);
    const rx = r * Math.cos((deg * Math.PI) / 180);
    return { y, rx };
  });

  // Generate longitude lines (full vertical ellipses at different tilt angles)
  const lngAngles = [0, 30, 60, 90, 120, 150];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c9a84c" stopOpacity="0.18" />
          <stop offset="60%"  stopColor="#5c8ce0" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0d0d1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="globeFill" cx="42%" cy="36%" r="60%">
          <stop offset="0%"   stopColor="#1a1830" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#08080f" stopOpacity="0.95" />
        </radialGradient>
        <clipPath id="globeClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Globe fill */}
      <circle cx={cx} cy={cy} r={r} fill="url(#globeFill)" />

      {/* Glow overlay */}
      <circle cx={cx} cy={cy} r={r} fill="url(#globeGlow)" />

      {/* Grid lines clipped to globe */}
      <g clipPath="url(#globeClip)" opacity="0.55">
        {/* Latitude arcs */}
        {latLines.map(({ y, rx }, i) => (
          <ellipse
            key={`lat-${i}`}
            cx={cx} cy={y}
            rx={rx} ry={rx * 0.18}
            fill="none"
            stroke={i === 2 ? '#c9a84c' : '#4a6fa5'}
            strokeWidth={i === 2 ? 0.9 : 0.6}
            opacity={i === 2 ? 0.8 : 0.5}
            filter="url(#softGlow)"
          />
        ))}

        {/* Longitude ellipses */}
        {lngAngles.map((angle, i) => (
          <ellipse
            key={`lng-${i}`}
            cx={cx} cy={cy}
            rx={r * 0.28}
            ry={r}
            fill="none"
            stroke={i % 3 === 0 ? '#c9a84c' : '#3a5a8a'}
            strokeWidth={i % 3 === 0 ? 0.85 : 0.55}
            opacity={i % 3 === 0 ? 0.65 : 0.4}
            transform={`rotate(${angle}, ${cx}, ${cy})`}
            filter="url(#softGlow)"
          />
        ))}
      </g>

      {/* Rim glow */}
      <circle
        cx={cx} cy={cy} r={r - 1}
        fill="none"
        stroke="#c9a84c"
        strokeWidth="1.5"
        opacity="0.35"
        filter="url(#softGlow)"
      />

      {/* Specular highlight */}
      <ellipse
        cx={cx - r * 0.28} cy={cy - r * 0.32}
        rx={r * 0.22} ry={r * 0.13}
        fill="white" opacity="0.04"
        transform={`rotate(-25, ${cx - r * 0.28}, ${cy - r * 0.32})`}
      />

      {/* Dot grid overlay */}
      <g clipPath="url(#globeClip)" opacity="0.3">
        {Array.from({ length: 9 }, (_, row) =>
          Array.from({ length: 18 }, (_, col) => {
            const dotX = (col / 17) * size;
            const dotY = (row / 8) * size;
            const dist = Math.hypot(dotX - cx, dotY - cy);
            if (dist > r - 8) return null;
            return (
              <circle
                key={`dot-${row}-${col}`}
                cx={dotX} cy={dotY} r="1.2"
                fill={col % 6 === 0 ? '#c9a84c' : '#5c8ce0'}
                opacity={0.4 + (1 - dist / r) * 0.4}
              />
            );
          })
        )}
      </g>
    </svg>
  );
}

// ── Orbiting icon component ────────────────────────────────────────────────────
function OrbitIcon({ emoji, angle, radius, size, delay, globeSize, animating }) {
  const baseRadius = (globeSize / 2) * radius * 1.42;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={animating ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18 + angle * 0.05, repeat: Infinity, ease: 'linear', delay: delay * 0.3 }}
        style={{ position: 'absolute', width: 0, height: 0 }}
      >
        <motion.span
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: delay }}
          style={{
            position: 'absolute',
            fontSize: size,
            left: baseRadius * Math.cos((angle * Math.PI) / 180) - 14,
            top: baseRadius * Math.sin((angle * Math.PI) / 180) - 14,
            filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.5))',
            display: 'block',
          }}
        >
          {emoji}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

// ── Main SplashScreen ──────────────────────────────────────────────────────────
export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // enter → hold → exit
  const GLOBE_SIZE = 260;

  useEffect(() => {
    // Hold → start exit at 3.2s
    const exitTimer = setTimeout(() => setPhase('exit'), 3200);
    // Notify parent after fade-out completes (~3.9s)
    const doneTimer = setTimeout(() => onComplete?.(), 3900);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'exit' ? 0 : 1 }}
          transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={() => { if (phase === 'exit') setPhase('done'); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 40%, #12102a 0%, #0a0914 40%, #06060e 100%)',
            overflow: 'hidden',
          }}
        >
          {/* ── Background particles ── */}
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: p.id % 4 === 0 ? '#c9a84c' : '#5c8ce0',
                opacity: 0,
              }}
              animate={{
                opacity: [0, p.opacity, 0],
                y: [0, -30 - Math.random() * 20, 0],
                x: [0, (Math.random() - 0.5) * 20, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* ── Deep radial glow behind globe ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 520,
              height: 520,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(92,140,224,0.07) 40%, transparent 70%)',
              filter: 'blur(32px)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Pulsing ring ── */}
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.08, 0.25] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: GLOBE_SIZE + 80,
              height: GLOBE_SIZE + 80,
              borderRadius: '50%',
              border: '1.5px solid rgba(201,168,76,0.4)',
              pointerEvents: 'none',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.32, 1], opacity: [0.12, 0.03, 0.12] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{
              position: 'absolute',
              width: GLOBE_SIZE + 120,
              height: GLOBE_SIZE + 120,
              borderRadius: '50%',
              border: '1px solid rgba(92,140,224,0.3)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Globe + orbit wrapper ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', width: GLOBE_SIZE, height: GLOBE_SIZE, marginBottom: 52 }}
          >
            {/* Rotating globe */}
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              style={{
                width: GLOBE_SIZE,
                height: GLOBE_SIZE,
                position: 'relative',
                transformStyle: 'preserve-3d',
              }}
            >
              <GlobeLines size={GLOBE_SIZE} />
            </motion.div>

            {/* Orbiting icons */}
            {ORBIT_ICONS.map((icon) => (
              <OrbitIcon
                key={icon.emoji}
                {...icon}
                globeSize={GLOBE_SIZE}
                animating={true}
              />
            ))}
          </motion.div>

          {/* ── Title ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', position: 'relative' }}
          >
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              fontFamily: 'inherit',
            }}>
              <span style={{ color: '#e8e2d0' }}>Event</span>
              <motion.span
                animate={{ textShadow: [
                  '0 0 18px rgba(201,168,76,0.4)',
                  '0 0 36px rgba(201,168,76,0.75)',
                  '0 0 18px rgba(201,168,76,0.4)',
                ]}}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                style={{
                  background: 'linear-gradient(135deg, #c9a84c, #e8c96e, #f0d88a, #c9a84c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Sphere
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.45em' }}
              animate={{ opacity: 0.55, letterSpacing: '0.22em' }}
              transition={{ duration: 1.2, delay: 1.1, ease: 'easeOut' }}
              style={{
                margin: '14px 0 0',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                color: '#c9a84c',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            >
              Where Extraordinary Happens
            </motion.p>

            {/* Thin gold underline */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                marginTop: 18,
                height: 1,
                background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
                transformOrigin: 'center',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
