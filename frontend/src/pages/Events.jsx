// pages/Events.jsx — Public event listing with filters + AI Recommendations
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/EventCard';

const CATEGORIES = ['All', 'Concert / Music', 'Sports', 'Conference', 'Workshop', 'Theater', 'Festival', 'Webinar', 'Charity Gala'];

/* ─── AI Recommendation Logic ─────────────────── */
function getRecommendations(allEvents, user) {
  if (!allEvents.length) return [];

  // Get viewed categories from localStorage
  const viewedRaw = localStorage.getItem('es_viewed_events');
  const viewed = viewedRaw ? JSON.parse(viewedRaw) : [];
  const viewedCategories = [...new Set(viewed.map(v => v.category).filter(Boolean))];

  let scored = allEvents.map(ev => {
    let score = 0;
    // Category match
    if (viewedCategories.includes(ev.category)) score += 3;
    // Featured bonus
    if (ev.featured) score += 2;
    // Upcoming events bonus
    const daysUntil = (new Date(ev.date) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysUntil > 0 && daysUntil < 30) score += 2;
    if (daysUntil > 0 && daysUntil < 7) score += 1;
    // Popularity
    score += Math.min(ev.ticketsSold / 10, 3);
    return { ...ev, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);

  // If no user data, label them trending
  if (viewedCategories.length === 0) return scored.slice(0, 8);
  return scored.slice(0, 8);
}

function AIRecommendations({ events }) {
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const viewedRaw = localStorage.getItem('es_viewed_events');
  const hasHistory = viewedRaw && JSON.parse(viewedRaw).length > 0;
  const recommendations = getRecommendations(events, user);

  const scroll = (dir) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir * 310, behavior: 'smooth' });
  };

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{ marginBottom: 48 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div style={{ color: 'var(--gold)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>&#10024;</span> {hasHistory ? 'Recommended For You' : 'Trending Now'}
          </div>
          <h3 style={{ fontWeight: 400, fontSize: '1.4rem' }}>
            {hasHistory ? 'Recommended For You' : 'Trending Events'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>
            {hasHistory ? 'Events curated based on your interests and activity' : 'Popular events you might enjoy'}
          </p>
        </div>
        <div className="carousel-nav">
          <button className="carousel-btn" onClick={() => scroll(-1)}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="carousel-btn" onClick={() => scroll(1)}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div className="ai-carousel" ref={carouselRef}>
        {recommendations.map((ev, i) => (
          <motion.div
            key={ev.id}
            className="ai-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ scale: 1.04, y: -6 }}
            onClick={() => {
              // Track view for recommendations
              const prev = JSON.parse(localStorage.getItem('es_viewed_events') || '[]');
              if (!prev.find(p => p.id === ev.id)) {
                prev.push({ id: ev.id, category: ev.category, date: new Date().toISOString() });
                localStorage.setItem('es_viewed_events', JSON.stringify(prev.slice(-20)));
              }
              navigate(`/events/${ev.id}`);
            }}
          >
            <div className="ai-card-img-wrap">
              <img src={ev.image} alt={ev.title} className="ai-card-img" />
              <div className="ai-badge">&#10024; AI Pick</div>
            </div>
            <div className="ai-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{ev.category}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold)', fontSize: '0.95rem' }}>
                  {ev.price === 0 ? 'Free' : `$${ev.price}`}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 6, lineHeight: 1.3 }}>
                {ev.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span>{new Date(ev.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>{ev.venue}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="divider divider-gold" style={{ marginTop: 16 }} />
    </motion.div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const toast = useToast();

  const activeCategory = params.get('category') || 'All';

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const q = {};
        if (activeCategory !== 'All') q.category = activeCategory;
        if (search) q.search = search;
        const data = await api.getEvents(q);
        setEvents(data);
      } catch (err) {
        toast('Failed to load events', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeCategory, search]);

  const setCategory = (cat) => {
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    setParams(params);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '48px 0 32px' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
              Discover
            </div>
            <h1 style={{ fontWeight: 300, marginBottom: 24 }}>All Events</h1>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 480 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="form-input"
                placeholder="Search events, venues..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 44 }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* AI Recommendations Carousel */}
        {!loading && events.length > 0 && <AIRecommendations events={events} />}

        {/* Filters + view toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setCategory(cat)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-gold' : 'btn-ghost'}`}
                style={{ borderRadius: 100 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['grid', '⊞'], ['list', '≡']].map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} className={`btn btn-sm ${view === v ? 'btn-outline' : 'btn-ghost'}`}>
                {icon}
              </button>
            ))}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 8 }}>
              {events.length} events
            </span>
          </div>
        </div>

        {/* Events grid/list */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: '20px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 16, width: '60%' }} />
                  <div className="skeleton" style={{ height: 20, width: '80%' }} />
                  <div className="skeleton" style={{ height: 14, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 8 }}>No events found</div>
            <div style={{ fontSize: '0.9rem' }}>Try a different search or category</div>
          </motion.div>
        ) : (
          <div style={{
            display: view === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: view === 'grid' ? 'repeat(3, 1fr)' : undefined,
            flexDirection: view === 'list' ? 'column' : undefined,
            gap: 24
          }}>
            {events.map((event, i) => (
              view === 'list' ? (
                <motion.div
                  key={event.id}
                  className="card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', gap: 20, padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => window.location.href = `/events/${event.id}`}
                >
                  <img src={event.image} alt={event.title} style={{ width: 160, height: 120, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ padding: '20px 20px 20px 0', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span className="badge badge-gold">{event.category}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold)', fontSize: '1.1rem' }}>
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>{event.title}</h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {event.venue} · {new Date(event.date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <EventCard key={event.id} event={event} index={i} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
