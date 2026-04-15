// pages/Events.jsx — Public event listing with filters + AI Recommendations
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import FieldError from '../components/FieldError';
import { validateAmount, numericInputProps } from '../utils/validation';
import { formatCurrency } from '../utils/currency';

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ marginBottom: 64, position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 16 }}>
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ color: 'var(--gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 8px var(--gold))' }}>✨</span> {hasHistory ? 'Recommended For You' : 'Trending Now'}
          </motion.div>
          <motion.h3 initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ fontWeight: 500, fontSize: '1.8rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {hasHistory ? 'Personalized Picks' : 'Popular Highlights'}
          </motion.h3>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onClick={() => scroll(-1)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="btn-ghost" style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onClick={() => scroll(1)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <motion.div 
         ref={carouselRef}
         whileTap={{ cursor: "grabbing" }}
         style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 24, paddingLeft: 4, scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory', cursor: 'grab' }}
      >
        {recommendations.map((ev, i) => (
          <motion.div
            key={ev.id}
            className="ai-card card-glass"
            style={{
              minWidth: 320, maxWidth: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, scrollSnapAlign: 'start', cursor: 'pointer'
            }}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "0px -50px" }}
            transition={{ delay: 0.1 + (i * 0.08), duration: 0.6, type: "spring", bounce: 0.3 }}
            whileHover={{ scale: 1.03, y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px var(--gold-glow-strong)' }}
            onClick={() => {
              const prev = JSON.parse(localStorage.getItem('es_viewed_events') || '[]');
              if (!prev.find(p => p.id === ev.id)) {
                prev.push({ id: ev.id, category: ev.category, date: new Date().toISOString() });
                localStorage.setItem('es_viewed_events', JSON.stringify(prev.slice(-20)));
              }
              navigate(`/events/${ev.id}`);
            }}
          >
            <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
              <motion.img 
                src={ev.image} alt={ev.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-card) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', color: 'var(--text-inverse)', padding: '4px 12px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 4px 12px rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✨</span> AI Pick
              </div>
            </div>
            <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{ev.category_type === 'custom' ? ev.custom_category_name : ev.category}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)', fontSize: '1.05rem' }}>
                  {ev.price === 0 ? 'Free' : formatCurrency(ev.price)}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8, lineHeight: 1.3, color: 'var(--text-primary)' }}>
                {ev.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{new Date(ev.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{ev.venue}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
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
  const { user } = useAuth();

  // Sponsor request modal
  const [sponsorEvent, setSponsorEvent] = useState(null);
  const [sponsorForm, setSponsorForm] = useState({ amount: '', message: '' });
  const [sponsorErrors, setSponsorErrors] = useState({});
  const [sponsorLoading, setSponsorLoading] = useState(false);

  const openSponsorModal = (e, event) => {
    e.preventDefault();
    e.stopPropagation();
    setSponsorEvent(event);
    setSponsorForm({ amount: '', message: '' });
    setSponsorErrors({});
  };

  const handleSponsorSubmit = async (e) => {
    e.preventDefault();
    const amtResult = validateAmount(sponsorForm.amount, { min: 100, label: 'Amount' });
    if (!amtResult.valid) { setSponsorErrors({ amount: amtResult.error }); return; }
    setSponsorErrors({});
    setSponsorLoading(true);
    try {
      await api.sendSponsorRequest({ eventId: sponsorEvent.id, ...sponsorForm });
      toast('Sponsorship request sent!', 'success');
      setSponsorEvent(null);
    } catch (err) {
      toast(err.message || 'Failed to send request', 'error');
    } finally {
      setSponsorLoading(false);
    }
  };

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
      {/* Immersive Hero Header */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div className="gradient-blob" style={{ background: 'var(--gold-glow-strong)', width: '60vw', height: '60vw', top: '-30vw', left: '-10vw', opacity: 0.5 }} />
          <div className="gradient-blob" style={{ background: 'rgba(92,140,224,0.15)', width: '50vw', height: '50vw', right: '-15vw', bottom: '-20vw', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'var(--hero-overlay)', pointerEvents: 'none' }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px 60px' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
               style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border-gold)', borderRadius: 100, color: 'var(--gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
              <span style={{ fontSize: '1rem' }}>✨</span> Discover
            </motion.div>
            <h1 style={{ fontWeight: 400, marginBottom: 24, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
              Find Your Next <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Experience</span>
            </h1>

            {/* Premium Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="form-input"
                placeholder="Search events, venues, organizers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '16px 20px 16px 52px', fontSize: '1rem', borderRadius: 100, background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', transition: 'all 0.3s ease' }}
                onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 20px rgba(201,168,76,0.15), var(--shadow-lg)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'var(--shadow-lg)'; }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* AI Recommendations Carousel */}
        {!loading && events.length > 0 && <AIRecommendations events={events} />}

        {/* Filters + view toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: 'var(--bg-elevated)', padding: 6, borderRadius: 100, border: '1px solid var(--border-light)' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{ 
                  position: 'relative', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 500, 
                  color: activeCategory === cat ? 'var(--text-inverse)' : 'var(--text-secondary)', 
                  background: 'transparent', border: 'none', borderRadius: 100, zIndex: 1, 
                  transition: 'color 0.3s ease', cursor: 'pointer', outline: 'none' 
                }}
              >
                {activeCategory === cat && (
                  <motion.div
                    layoutId="activeFilterBg"
                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: 100, zIndex: -1, boxShadow: '0 4px 12px rgba(201,168,76,0.3)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {cat}
              </button>
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
                  className="card card-glass"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.1, margin: "0px 0px -20px 0px" }}
                  transition={{ duration: 0.5, delay: (i % 5) * 0.08, ease: "easeOut" }}
                  whileHover={{ x: 8, backgroundColor: 'var(--bg-hover)', borderLeft: '4px solid var(--gold)' }}
                  style={{ display: 'flex', gap: 20, padding: 0, overflow: 'hidden', cursor: 'pointer', borderLeft: '4px solid transparent' }}
                  onClick={() => window.location.href = `/events/${event.id}`}
                >
                  <motion.img 
                    src={event.image} alt={event.title} 
                    style={{ width: 160, height: 120, objectFit: 'cover', flexShrink: 0 }} 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div style={{ padding: '20px 20px 20px 0', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span className="badge badge-gold">{event.category_type === 'custom' ? event.custom_category_name : event.category}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold)', fontSize: '1.1rem' }}>
                          {event.price === 0 ? 'Free' : formatCurrency(event.price)}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>{event.title}</h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {event.venue} · {new Date(event.date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    {user?.role === 'sponsor' && (
                      <button
                        className="btn btn-gold btn-sm"
                        style={{ marginLeft: 20, flexShrink: 0 }}
                        onClick={(e) => openSponsorModal(e, event)}
                      >
                        🤝 Sponsor
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div key={event.id} style={{ position: 'relative' }}>
                  <EventCard event={event} index={i} />
                  {user?.role === 'sponsor' && (
                    <button
                      className="btn btn-gold btn-sm"
                      style={{ position: 'absolute', bottom: 64, right: 16, zIndex: 2 }}
                      onClick={(e) => openSponsorModal(e, event)}
                    >
                      🤝 Sponsor
                    </button>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* ─── SPONSOR REQUEST MODAL ───────────────── */}
      <Modal open={!!sponsorEvent} onClose={() => setSponsorEvent(null)} title="Send Sponsorship Request" maxWidth={480}>
        {sponsorEvent && (
          <form onSubmit={handleSponsorSubmit}>
            {/* Event preview */}
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
              padding: '14px 18px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              <img src={sponsorEvent.image} alt="" style={{ width: 56, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{sponsorEvent.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {sponsorEvent.venue} · {new Date(sponsorEvent.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label">Sponsorship Amount ($) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={`form-input ${sponsorErrors.amount ? 'error' : ''}`}
                  placeholder="e.g. 5000 (min ₹100)"
                  {...numericInputProps(sponsorForm.amount, v => { setSponsorForm(f => ({ ...f, amount: v })); setSponsorErrors({}); })}
                />
                <FieldError error={sponsorErrors.amount} />
              </div>
              <div className="form-group">
                <label className="form-label">Message (optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Briefly describe your sponsorship goals..."
                  value={sponsorForm.message}
                  onChange={e => setSponsorForm(f => ({ ...f, message: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSponsorEvent(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }} disabled={sponsorLoading}>
                {sponsorLoading ? 'Sending…' : '🤝 Send Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}