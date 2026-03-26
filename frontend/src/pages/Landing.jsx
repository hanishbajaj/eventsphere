// pages/Landing.jsx — Cinematic animated landing page
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MagneticWrapper } from '../components/Interactive';

const CATEGORIES = [
  { name: 'Concert / Music', icon: '🎵', color: '#d878d8' },
  { name: 'Sports', icon: '⚡', color: '#4caf7d' },
  { name: 'Conference', icon: '🧠', color: '#5c8ce0' },
  { name: 'Workshop', icon: '✦', color: '#e09a4c' },
  { name: 'Theater', icon: '🎭', color: '#c9a84c' },
  { name: 'Festival', icon: '🎪', color: '#e05c5c' },
  { name: 'Webinar', icon: '🌐', color: '#4cb8c9' },
  { name: 'Charity Gala', icon: '♥', color: '#af4c8c' },
];

const TESTIMONIALS = [
  {
    name: 'Mira Castillo',
    role: 'Event Buyer',
    rating: '★★★★★',
    text: 'EventSphere made finding and booking the perfect concert effortless. The seat selection UI is beautiful.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mira',
  },
  {
    name: 'Liam Novak',
    role: 'Event Organizer',
    rating: '★★★★★',
    text: 'Managing sponsor requests and ticket analytics has never been this smooth. I have doubled my events this year.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
  },
  {
    name: 'Dana Okoye',
    role: 'Corporate Sponsor',
    rating: '★★★★★',
    text: 'The sponsorship dashboard gives me real visibility into ROI. I love the calendar view for planning campaigns.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana',
  },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Tickets Sold' },
  { value: 1200, suffix: '', label: 'Events Listed' },
  { value: 340, suffix: '', label: 'Sponsors' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
];

const FEATURED_EVENTS = [
  {
    title: 'Nocturne: A Symphony Under the Stars',
    category: 'Concert / Music',
    date: 'Aug 15',
    price: '₹7,000',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
  },
  {
    title: 'TechSummit 2026: AI Frontier',
    category: 'Conference',
    date: 'Sep 10',
    price: '₹37,000',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  },
  {
    title: 'Aurora Festival of Lights',
    category: 'Festival',
    date: 'Oct 01',
    price: '₹5,500',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
  },
  {
    title: 'Gala for Education',
    category: 'Charity Gala',
    date: 'Nov 14',
    price: '₹41,000',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
  },
];

const LIVE_EVENTS = [
  {
    title: 'Midnight Rooftop Sessions',
    viewers: '4.2K watching',
    tag: 'Live DJ Set',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&q=80',
  },
  {
    title: 'Founders Summit Main Stage',
    viewers: '2.8K watching',
    tag: 'Keynote in Progress',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&q=80',
  },
  {
    title: 'Grand Theatre Rehearsal',
    viewers: '1.9K watching',
    tag: 'Backstage Access',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&q=80',
  },
  {
    title: 'City Lights Film Premiere',
    viewers: '3.4K watching',
    tag: 'Red Carpet Feed',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
  },
];

const TIMELINE_EVENTS = [
  {
    month: 'Aug 2026',
    title: 'Nocturne Concert',
    type: 'Concert',
    summary: 'A premium open-air orchestra experience under a star-lit skyline.',
  },
  {
    month: 'Sep 2026',
    title: 'Tech Conference',
    type: 'Conference',
    summary: 'Founders, operators, and AI builders sharing what is next.',
  },
  {
    month: 'Oct 2026',
    title: 'Theater Festival',
    type: 'Theater',
    summary: 'Three weeks of contemporary performance, drama, and live stage craft.',
  },
  {
    month: 'Nov 2026',
    title: 'Charity Gala',
    type: 'Charity Gala',
    summary: 'A black-tie philanthropic evening with live performances and auctions.',
  },
];

const WHY_FEATURES = [
  {
    title: 'Discover Events',
    icon: '✨',
    description: 'Curated discovery with cinematic previews, live moments, and premium recommendations.',
  },
  {
    title: 'Visual Seat Selection',
    icon: '🎟️',
    description: 'Choose seats with clarity, confidence, and real-time availability before checkout.',
  },
  {
    title: 'Smart Sponsorship Matching',
    icon: '🤝',
    description: 'Connect sponsors and organizers through aligned audiences, value, and campaign fit.',
  },
];

const HERO_WORDS = ['Move', 'Inspire', 'Captivate', 'Electrify', 'Enchant', 'Elevate'];

const HERO_PARTICLES = [
  { icon: '🎵', left: '8%', top: '18%', size: '1.3rem', duration: 16, delay: 0 },
  { icon: '🎤', left: '16%', top: '62%', size: '1.4rem', duration: 18, delay: 1.5 },
  { icon: '🎭', left: '30%', top: '24%', size: '1.45rem', duration: 15, delay: 0.8 },
  { icon: '🎬', left: '55%', top: '16%', size: '1.4rem', duration: 17, delay: 2.2 },
  { icon: '🎟️', left: '68%', top: '64%', size: '1.35rem', duration: 19, delay: 0.4 },
  { icon: '🎉', left: '82%', top: '28%', size: '1.3rem', duration: 14, delay: 1.2 },
  { icon: '🎵', left: '90%', top: '72%', size: '1.1rem', duration: 20, delay: 2.8 },
  { icon: '🎬', left: '42%', top: '74%', size: '1.2rem', duration: 16, delay: 1.8 },
];

const EXPERIENCE_ICONS = [
  { icon: '🎤', top: '18%', duration: 14, delay: 0 },
  { icon: '🎶', top: '38%', duration: 18, delay: 2 },
  { icon: '🎟️', top: '58%', duration: 16, delay: 1 },
  { icon: '🎭', top: '74%', duration: 20, delay: 3 },
];

function AnimatedCounter({ value, suffix = '', start }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;

    let frameId;
    const animationDuration = 1600;
    const startedAt = performance.now();

    const updateCounter = (now) => {
      const progress = Math.min((now - startedAt) / animationDuration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(updateCounter);
      }
    };

    frameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(frameId);
  }, [start, value]);

  return `${new Intl.NumberFormat('en-US').format(displayValue)}${suffix}`;
}

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heroY = useTransform(heroScrollProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.7], [1, 0]);
  const particleParallax = useTransform(heroScrollProgress, [0, 1], ['0%', '18%']);
  const waveParallax = useTransform(heroScrollProgress, [0, 1], ['0%', '10%']);
  const experienceParallax = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [statsStarted, setStatsStarted] = useState(false);
  const [heroWordIndex, setHeroWordIndex] = useState(0);

  // useEffect(() => {
  //   if (user) navigate(`/dashboard/${user.role}`);
  // }, [user, navigate]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveTestimonial((currentIndex) => (currentIndex + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setHeroWordIndex((i) => (i + 1) % HERO_WORDS.length);
    }, 2000);

    return () => clearInterval(wordInterval);
  }, []);

  return (
    <div style={{ overflowX: 'clip', position: 'relative' }}>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, var(--gold-light), var(--gold), var(--gold-light))',
          transformOrigin: '0% 50%',
          scaleX: progressScaleX,
          zIndex: 30,
          boxShadow: '0 0 18px var(--gold-glow)',
        }}
      />

      {/* ─── HERO ────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'clip',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ y: heroY, opacity: heroOpacity, position: 'absolute', inset: 0, zIndex: 0 }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1540039155733-5bb30b4a4d3d?w=1920&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'var(--hero-brightness)',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'var(--hero-overlay)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 36%, var(--gold-glow) 0%, var(--gold-glow-fade) 72%)' }} />
        </motion.div>

        <div className="gradient-blob" style={{ width: 520, height: 520, top: -120, left: -210, background: 'var(--gold-glow)' }} />
        <div className="gradient-blob" style={{ width: 340, height: 340, bottom: 100, right: -100, background: 'rgba(92,140,224,0.03)' }} />

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {HERO_PARTICLES.map((particle) => (
            <motion.div
              key={`${particle.icon}-${particle.left}-${particle.top}`}
              style={{
                position: 'absolute',
                left: particle.left,
                top: particle.top,
                y: particleParallax,
                opacity: 0.12,
                filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.18))',
              }}
            >
              <motion.div
                animate={{
                  y: [0, -14, 0],
                  x: [0, 8, -4, 0],
                  rotate: [0, 8, -6, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: 'easeInOut',
                }}
                style={{ fontSize: particle.size }}
              >
                {particle.icon}
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 100, paddingBottom: 100 }}>
          <div style={{ maxWidth: 900, position: 'relative' }}>
            <motion.div
              style={{
                position: 'absolute',
                inset: '-16% -8% auto -8%',
                height: 280,
                borderRadius: '50%',
                background: 'linear-gradient(90deg, var(--gold-glow-fade) 0%, var(--gold-glow) 25%, var(--gold-glow) 50%, var(--gold-glow-fade) 100%)',
                filter: 'blur(28px)',
                opacity: 0.8,
                y: waveParallax,
              }}
              animate={{ x: ['-12%', '10%', '-12%'] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32, position: 'relative', zIndex: 1 }}
            >
              <div style={{ width: 40, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Where Extraordinary Happens
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.12 }}
              style={{ marginBottom: 28, fontWeight: 700, position: 'relative', zIndex: 1, fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', lineHeight: 1.15, overflow: 'visible' }}
            >
              Events That{' '}
              <span
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  overflow: 'visible',
                  verticalAlign: 'baseline',
                  whiteSpace: 'nowrap',
                  /* Extra right padding accounts for italic slant overhang on the last letter */
                  paddingRight: '0.35em',
                }}
              >
                {/* Invisible italic sizer — gives the span its natural width including italic metrics */}
                <em
                  aria-hidden="true"
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 700,
                    visibility: 'hidden',
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    paddingRight: '0.35em',
                  }}
                >
                  {HERO_WORDS.reduce((a, b) => (a.length >= b.length ? a : b))}
                </em>
                {/* Inner wrapper clips vertically for the slot-scroll effect, overflow:visible on right for italic */}
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  right: 0,
                  overflow: 'hidden',
                  paddingRight: '0.35em',
                  display: 'block',
                }}>
                  <AnimatePresence mode="wait">
                    <motion.em
                      key={HERO_WORDS[heroWordIndex]}
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '-100%', opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        fontStyle: 'italic',
                        fontWeight: 700,
                        paddingRight: '0.35em',
                        background: 'linear-gradient(135deg, #c9a84c, #e8c96e, #f0d88a, #c9a84c)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                      }}
                    >
                      {HERO_WORDS[heroWordIndex]}
                    </motion.em>
                  </AnimatePresence>
                </span>
              </span>
              <br />
              You
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.24 }}
              style={{
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
                maxWidth: 560,
                marginBottom: 48,
                lineHeight: 1.7,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Discover, create, and sponsor the world&apos;s most unforgettable experiences.
              From intimate workshops to stadium concerts, every moment lives in one cinematic platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.36 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}
            >
              <Link to="/events">
                <MagneticWrapper strength={35}>
                  <motion.button
                    className="btn btn-gold btn-lg"
                    whileHover={{ scale: 1.04, boxShadow: '0 0 22px var(--gold-glow)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Explore Events →
                  </motion.button>
                </MagneticWrapper>
              </Link>
              <Link to="/register">
                <MagneticWrapper strength={25}>
                  <motion.button
                    className="btn btn-outline btn-lg"
                    whileHover={{ scale: 1.04, boxShadow: '0 0 18px rgba(201,168,76,0.12)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Organize Now
                  </motion.button>
                </MagneticWrapper>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ─── HERO RIGHT: Animated Globe Visual ──────── */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '50%',
            pointerEvents: 'none',
            zIndex: 1,
            overflow: 'hidden',
          }}
          className="hero-globe-desktop"
        >
          {/* Layer 1 — radial glow base */}
          <motion.div
            animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 560, height: 560,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.11) 0%, rgba(92,140,224,0.06) 45%, var(--gold-glow-fade) 72%)',
              filter: 'blur(24px)',
            }}
          />

          {/* Layer 2 — outer ring pulse */}
          <motion.div
            animate={{ opacity: [0.18, 0.06, 0.18], scale: [1, 1.22, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500, height: 500,
              borderRadius: '50%',
              border: '1.5px solid rgba(201,168,76,0.35)',
            }}
          />
          <motion.div
            animate={{ opacity: [0.1, 0.03, 0.1], scale: [1, 1.38, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500, height: 500,
              borderRadius: '50%',
              border: '1px solid rgba(201,168,76,0.2)',
            }}
          />

          {/* Layer 3 — SVG globe with rotating grid */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420, height: 420,
          }}>
            <motion.svg
              viewBox="0 0 420 420"
              style={{ width: '100%', height: '100%', opacity: 0.55 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            >
              <defs>
                <radialGradient id="hgGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.15" />
                  <stop offset="60%" stopColor="#5c8ce0" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#08080f" stopOpacity="0" />
                </radialGradient>
                <clipPath id="hgClip">
                  <circle cx="210" cy="210" r="192" />
                </clipPath>
                <filter id="hgBlur">
                  <feGaussianBlur stdDeviation="1.5" />
                </filter>
              </defs>

              {/* Globe fill */}
              <circle cx="210" cy="210" r="192" fill="url(#hgGlow)" opacity="0.9" />

              {/* Latitude lines */}
              {[-70, -45, -20, 0, 20, 45, 70].map((deg, i) => {
                const y = 210 + 192 * Math.sin((deg * Math.PI) / 180);
                const rx = 192 * Math.cos((deg * Math.PI) / 180);
                const isEquator = deg === 0;
                return (
                  <ellipse
                    key={`lat${i}`}
                    cx="210" cy={y}
                    rx={rx} ry={rx * 0.16}
                    fill="none"
                    stroke={isEquator ? '#c9a84c' : '#3a5a8a'}
                    strokeWidth={isEquator ? 0.9 : 0.5}
                    opacity={isEquator ? 0.7 : 0.38}
                    clipPath="url(#hgClip)"
                  />
                );
              })}

              {/* Longitude ellipses */}
              {[0, 24, 48, 72, 96, 120, 144].map((angle, i) => (
                <ellipse
                  key={`lng${i}`}
                  cx="210" cy="210"
                  rx="62" ry="192"
                  fill="none"
                  stroke={i % 3 === 0 ? '#c9a84c' : '#3a5a8a'}
                  strokeWidth={i % 3 === 0 ? 0.8 : 0.45}
                  opacity={i % 3 === 0 ? 0.55 : 0.3}
                  transform={`rotate(${angle}, 210, 210)`}
                  clipPath="url(#hgClip)"
                />
              ))}

              {/* Dot grid overlay */}
              {Array.from({ length: 11 }, (_, row) =>
                Array.from({ length: 22 }, (_, col) => {
                  const dx = (col / 21) * 420;
                  const dy = (row / 10) * 420;
                  const dist = Math.hypot(dx - 210, dy - 210);
                  if (dist > 188) return null;
                  const brightness = 1 - dist / 192;
                  return (
                    <circle
                      key={`d${row}-${col}`}
                      cx={dx} cy={dy} r="1.5"
                      fill={col % 5 === 0 ? '#c9a84c' : '#5c8ce0'}
                      opacity={0.25 + brightness * 0.35}
                    />
                  );
                })
              )}

              {/* Rim */}
              <circle cx="210" cy="210" r="191"
                fill="none" stroke="#c9a84c" strokeWidth="1.2" opacity="0.28" />
            </motion.svg>

            {/* Counter-rotate inner details for depth */}
            <motion.svg
              viewBox="0 0 420 420"
              style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, opacity: 0.3 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
            >
              <defs>
                <clipPath id="hgClip2">
                  <circle cx="210" cy="210" r="188" />
                </clipPath>
              </defs>
              {[15, 55, 95, 135].map((angle, i) => (
                <ellipse
                  key={`inner${i}`}
                  cx="210" cy="210"
                  rx="30" ry="188"
                  fill="none"
                  stroke="#c9a84c"
                  strokeWidth="0.6"
                  opacity="0.4"
                  transform={`rotate(${angle}, 210, 210)`}
                  clipPath="url(#hgClip2)"
                />
              ))}
            </motion.svg>
          </div>

          {/* Layer 4 — orbiting event icons */}
          {[
            { emoji: '🎤', angle: 0,   orbitR: 235, size: '1.5rem', dur: 22, delay: 0 },
            { emoji: '🎵', angle: 58,  orbitR: 215, size: '1.3rem', dur: 28, delay: 1.4 },
            { emoji: '🎬', angle: 115, orbitR: 245, size: '1.35rem', dur: 24, delay: 0.7 },
            { emoji: '🎭', angle: 180, orbitR: 220, size: '1.4rem', dur: 30, delay: 2.1 },
            { emoji: '🎟', angle: 238, orbitR: 230, size: '1.25rem', dur: 26, delay: 0.3 },
            { emoji: '🎉', angle: 295, orbitR: 210, size: '1.2rem', dur: 20, delay: 1.8 },
          ].map((item) => (
            <motion.div
              key={item.emoji + item.angle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: item.delay + 0.8, duration: 0.8 }}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: 0, height: 0,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: item.dur, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', width: 0, height: 0 }}
              >
                <motion.span
                  animate={{ opacity: [0.65, 1, 0.65] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
                  style={{
                    position: 'absolute',
                    fontSize: item.size,
                    left: item.orbitR * Math.cos((item.angle * Math.PI) / 180) - 12,
                    top:  item.orbitR * Math.sin((item.angle * Math.PI) / 180) - 12,
                    filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.55))',
                    display: 'block',
                  }}
                >
                  {item.emoji}
                </motion.span>
              </motion.div>
            </motion.div>
          ))}

          {/* Layer 5 — floating ambient particles */}
          {Array.from({ length: 18 }, (_, i) => ({
            x: 15 + Math.sin(i * 1.37) * 45,
            y: 10 + (i / 17) * 80,
            size: 1.5 + (i % 4) * 0.8,
            dur: 7 + (i % 5) * 2.2,
            delay: (i * 0.55) % 6,
            gold: i % 3 === 0,
          })).map((p, i) => (
            <motion.div
              key={`ap${i}`}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: p.gold ? '#c9a84c' : '#5c8ce0',
                opacity: 0,
              }}
              animate={{
                opacity: [0, p.gold ? 0.55 : 0.35, 0],
                y: [0, -28 - (i % 3) * 10, 0],
                x: [0, (i % 2 === 0 ? 1 : -1) * 8, 0],
              }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {/* Layer 6 — gold gradient light sweep (right edge) */}
          <motion.div
            animate={{ x: ['-100%', '120%'] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
            style={{
              position: 'absolute',
              top: '20%', bottom: '20%',
              left: 0,
              width: '40%',
              background: 'linear-gradient(90deg, var(--gold-glow-fade), rgba(201,168,76,0.06), rgba(201,168,76,0.12), rgba(201,168,76,0.06), var(--gold-glow-fade))',
              filter: 'blur(16px)',
              pointerEvents: 'none',
            }}
          />

          {/* Layer 7 — vertical cinematic light flare */}
          <motion.div
            animate={{ opacity: [0, 0.22, 0], scaleY: [0.6, 1.2, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.5, repeatDelay: 5 }}
            style={{
              position: 'absolute',
              top: '10%', bottom: '10%',
              left: '48%',
              width: 2,
              background: 'linear-gradient(to bottom, var(--gold-glow-fade), rgba(201,168,76,0.5), rgba(201,168,76,0.7), rgba(201,168,76,0.5), var(--gold-glow-fade))',
              filter: 'blur(3px)',
              transformOrigin: 'center',
            }}
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            zIndex: 2,
          }}
        >
          <span>Scroll</span>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </section>

      {/* ─── STATS STRIP ────────────────────────────────── */}
      <motion.section
        onViewportEnter={() => setStatsStarted(true)}
        viewport={{ once: true, amount: 0.5 }}
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '40px 0', flexWrap: 'wrap', gap: 24 }}>
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} start={statsStarted} />
                </div>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginTop: 8 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── LIVE EVENTS NOW ────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: 32 }}
          >
            <div style={{ color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>
              Live Events Now
            </div>
            <h2 style={{ fontWeight: 300 }}>What Audiences Are Watching <em style={{ fontStyle: 'italic' }}>Right Now</em></h2>
          </motion.div>

          <div className="landing-horizontal-scroll" style={{ display: 'flex', gap: 18, overflowX: 'auto', paddingBottom: 10 }}>
            {LIVE_EVENTS.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 22px 48px rgba(201,168,76,0.14)' }}
                style={{
                  minWidth: 320,
                  flex: '0 0 320px',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, var(--bg-card) 100%)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div style={{ position: 'relative', height: 188, overflow: 'hidden' }}>
                  <motion.img
                    src={event.image}
                    alt={event.title}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.45 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.74)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.8), rgba(8,8,15,0.12))' }} />
                  <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <motion.span
                      animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 14px rgba(224,92,92,0.4)' }}
                    />
                    <span style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>🔴 Live</span>
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ color: 'var(--gold)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
                    {event.tag}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>
                    {event.title}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{event.viewers}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <div style={{ color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Browse by Category</div>
            <h2 style={{ fontWeight: 300 }}>Find Your <em style={{ fontStyle: 'italic' }}>Kind</em> of Event</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ scale: 1.05, y: -8, borderColor: `${category.color}60`, boxShadow: `0 18px 38px ${category.color}18` }}
                onClick={() => navigate(`/events?category=${encodeURIComponent(category.name)}`)}
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, var(--bg-card) 100%)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <motion.div
                  animate={{ rotate: [-8, 8, -4, 0], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 7 + index * 0.3, ease: 'easeInOut' }}
                  style={{ fontSize: '2rem', marginBottom: 12 }}
                >
                  {category.icon}
                </motion.div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: category.color }}>{category.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ───────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: 28 }}
          >
            <div style={{ color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>
              Upcoming Experiences
            </div>
            <h2 style={{ fontWeight: 300 }}>The Season Ahead, <em style={{ fontStyle: 'italic' }}>Mapped Out</em></h2>
          </motion.div>

          <div className="landing-horizontal-scroll" style={{ overflowX: 'auto', paddingBottom: 12 }}>
            <div style={{ minWidth: 860, position: 'relative', paddingTop: 18 }}>
              <div style={{ position: 'absolute', left: 24, right: 24, top: 44, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-dim), transparent)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {TIMELINE_EVENTS.map((event, index) => (
                  <motion.button
                    key={event.month}
                    type="button"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    onHoverStart={() => setActiveTimeline(index)}
                    onFocus={() => setActiveTimeline(index)}
                    onClick={() => setActiveTimeline(index)}
                    style={{
                      background: index === activeTimeline ? 'rgba(201,168,76,0.08)' : 'var(--bg-card)',
                      border: index === activeTimeline ? '1px solid var(--border-gold)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '28px 22px 24px',
                      textAlign: 'left',
                      color: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    <motion.div
                      animate={{ scale: index === activeTimeline ? [1, 1.08, 1] : 1 }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--gold)', marginBottom: 20, boxShadow: '0 0 18px rgba(201,168,76,0.24)' }}
                    />
                    <div style={{ color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12 }}>
                      {event.month}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 8 }}>{event.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{event.type}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 26, minHeight: 120 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={TIMELINE_EVENTS[activeTimeline].month}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, var(--bg-card) 100%)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 28,
                  maxWidth: 720,
                }}
              >
                <div style={{ color: 'var(--gold)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>
                  Event Preview
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 10 }}>
                  {TIMELINE_EVENTS[activeTimeline].title}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7 }}>
                  {TIMELINE_EVENTS[activeTimeline].summary}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── WHY EVENTSPHERE ────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <div style={{ color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 14 }}>
              Why Choose EventSphere
            </div>
            <h2 style={{ fontWeight: 300 }}>Designed for Premium Event Discovery</h2>
          </motion.div>

          <div className="grid-3">
            {WHY_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 22px 48px rgba(201,168,76,0.14)' }}
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, var(--bg-card) 100%)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 32,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: '-40% auto auto -10%',
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
                    filter: 'blur(18px)',
                  }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 8, repeat: Infinity, delay: index * 0.6 }}
                />
                <motion.div
                  animate={{ y: [0, -4, 0], rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 6 + index, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: '2rem', marginBottom: 18, position: 'relative', zIndex: 1 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 style={{ marginBottom: 12, position: 'relative', zIndex: 1 }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS / ROLES ───────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{ fontWeight: 300 }}>For <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Everyone</em> in the Ecosystem</h2>
          </motion.div>

          <div className="grid-2" style={{ gap: 24 }}>
            {[
              { role: 'Ticket Buyer', color: '#e05c5c', icon: '🎫', desc: 'Browse thousands of events, select your seats visually, and get instant QR-coded digital tickets.', cta: 'Buy Tickets', path: '/register?role=buyer' },
              { role: 'Event Organizer', color: '#5c8ce0', icon: '📋', desc: 'Create and manage events with powerful tools. Receive sponsor offers and track ticket sales in real time.', cta: 'Organize Now', path: '/register?role=organizer' },
              { role: 'Sponsor', color: '#4caf7d', icon: '🤝', desc: 'Discover events aligned with your brand. Submit sponsorship requests and track campaign performance.', cta: 'Sponsor Events', path: '/register?role=sponsor' },
              { role: 'Administrator', color: '#c9a84c', icon: '⚙️', desc: 'Full control over the platform. Moderate events, manage users, and view system-wide analytics.', cta: 'Admin Access', path: '/login' },
            ].map((item, index) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -6, borderColor: `${item.color}55`, boxShadow: `0 18px 40px ${item.color}14` }}
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, var(--bg-card) 100%)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '36px',
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 6, -6, 0], y: [0, -3, 0] }}
                  transition={{ duration: 7 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-md)',
                    background: `${item.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    flexShrink: 0,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  {item.icon}
                </motion.div>
                <div>
                  <h3 style={{ marginBottom: 10, fontSize: '1.3rem' }}>{item.role}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: 20, lineHeight: 1.65 }}>{item.desc}</p>
                  <Link to={item.path}>
                    <motion.button
                      className="btn btn-sm"
                      whileHover={{ scale: 1.03, boxShadow: `0 0 18px ${item.color}20` }}
                      whileTap={{ scale: 0.98 }}
                      style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}35` }}
                    >
                      {item.cta} →
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ marginBottom: 60 }}
          >
            <div style={{ color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontWeight: 300 }}>Loved by Thousands</h2>
          </motion.div>

          <div style={{ position: 'relative', minHeight: 280, padding: '10px 0' }}>
            <motion.div
              style={{
                position: 'absolute',
                inset: '16% 18% auto 18%',
                height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 72%)',
                filter: 'blur(36px)',
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.8, 0.45] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    fontSize: '2.2rem',
                    color: 'var(--gold)',
                    marginBottom: 18,
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1,
                  }}
                >
                  ❝
                </motion.div>

                <div style={{ color: 'var(--gold)', letterSpacing: '0.16em', fontSize: '0.82rem', marginBottom: 18 }}>
                  {TESTIMONIALS[activeTestimonial].rating}
                </div>

                <p style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', marginBottom: 32, lineHeight: 1.7, color: 'var(--text-primary)' }}>
                  {TESTIMONIALS[activeTestimonial].text}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <img src={TESTIMONIALS[activeTestimonial].avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--border-gold)' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{TESTIMONIALS[activeTestimonial].name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>{TESTIMONIALS[activeTestimonial].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.button
                key={testimonial.name}
                type="button"
                onClick={() => setActiveTestimonial(index)}
                whileHover={{ scale: 1.08 }}
                animate={{ width: index === activeTestimonial ? 28 : 8, background: index === activeTestimonial ? 'var(--gold)' : 'var(--border)' }}
                style={{ height: 8, borderRadius: 100, border: 'none', cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCE STRIP ───────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '110px 0',
          overflow: 'hidden',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <motion.div style={{ y: experienceParallax, position: 'absolute', inset: 0 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1800&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(2px) brightness(0.2)',
              transform: 'scale(1.08)',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,8,15,0.9) 0%, rgba(16,16,26,0.72) 55%, rgba(8,8,15,0.94) 100%)' }} />
        </motion.div>

        {EXPERIENCE_ICONS.map((item) => (
          <motion.div
            key={`${item.icon}-${item.top}`}
            style={{
              position: 'absolute',
              left: '-10%',
              top: item.top,
              fontSize: '1.9rem',
              opacity: 0.13,
              zIndex: 1,
            }}
            animate={{ x: ['0%', '125%'], y: [0, -12, 0] }}
            transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'linear' }}
          >
            {item.icon}
          </motion.div>
        ))}

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div style={{ color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 18 }}>
              EventSphere Experience
            </div>
            <h2 style={{ fontWeight: 300, maxWidth: 780, margin: '0 auto 18px' }}>
              Experience The Magic Of <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Live Events</em>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
              From stage lights and standing ovations to intimate showcases and sold-out openings, EventSphere frames every event like a premium production.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <motion.div
          style={{ position: 'absolute', top: 24, left: '16%', fontSize: '1.3rem', opacity: 0.12 }}
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        >
          🎤
        </motion.div>
        <motion.div
          style={{ position: 'absolute', bottom: 26, right: '18%', fontSize: '1.3rem', opacity: 0.12 }}
          animate={{ y: [0, -10, 0], rotate: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
        >
          🎟️
        </motion.div>

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontWeight: 300, marginBottom: 20 }}>
              Ready to experience something <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>extraordinary?</em>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: '1.1rem' }}>
              Join 50,000+ people creating and attending the world&apos;s finest events.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register">
                <motion.button
                  className="btn btn-gold btn-lg"
                  whileHover={{ scale: 1.04, boxShadow: '0 0 20px var(--gold-glow)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Create Your Account
                </motion.button>
              </Link>
              <Link to="/events">
                <motion.button
                  className="btn btn-outline btn-lg"
                  whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(201,168,76,0.12)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Browse Events
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer style={{ background: 'var(--bg-base)', padding: '48px 0 32px', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
            <img src="/logo_transparent (1).png" alt="EventSphere" style={{ height: 150, width: 'auto' }} />
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Explore Events', 'Sign In', 'Register', 'Privacy', 'Terms'].map((label) => (
                <motion.span
                  key={label}
                  whileHover={{ y: -2, color: 'var(--text-secondary)' }}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {label}
                </motion.span>
              ))}
            </div>
          </div>
          <div className="divider" />
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2026 EventSphere. Crafted with care for extraordinary moments.
          </div>
        </div>
      </footer>
    </div>
  );
}