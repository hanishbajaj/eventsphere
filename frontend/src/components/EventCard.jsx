// components/EventCard.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { TiltCard } from './Interactive';

const CATEGORY_CLASSES = {
  'Concert / Music': 'cat-concert',
  'Sports': 'cat-sports',
  'Conference': 'cat-conference',
  'Workshop': 'cat-workshop',
  'Theater': 'cat-theater',
  'Festival': 'cat-festival',
  'Webinar': 'cat-webinar',
  'Charity Gala': 'cat-charity',
};

export default function EventCard({ event, index = 0, onClick }) {
  const navigate = useNavigate();
  const handleClick = () => onClick ? onClick(event) : navigate(`/events/${event.id}`);
  const displayCategory = event.category_type === 'custom' ? event.custom_category_name : event.category;
  const catClass = CATEGORY_CLASSES[event.category] || 'badge-gold';
  const date = new Date(event.date);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleClick}
      style={{ cursor: 'pointer', height: '100%' }}
      whileHover={{ scale: 1.02 }}
    >
      <TiltCard className="event-card card-glass" style={{ overflow: 'hidden' }}>
      {/* Image */}
      <div style={{ overflow: 'hidden', position: 'relative', height: 200 }}>
        <img
          src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
          alt={event.title}
          className="event-card-img"
        />
        {event.featured && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--gold)', color: 'var(--text-inverse)',
            padding: '2px 10px', borderRadius: 100, fontSize: '0.7rem',
            fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>Featured</div>
        )}
        {/* Date overlay */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(10px)',
          borderRadius: 'var(--radius-sm)', padding: '6px 12px',
          textAlign: 'center', minWidth: 48
        }}>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)' }}>
            {date.toLocaleDateString('en', { month: 'short' })}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem', lineHeight: 1 }}>
            {date.getDate()}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="event-card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className={`badge ${catClass}`}>{displayCategory}</span>
          <span className="event-card-price">
            {event.price === 0 ? 'Free' : formatCurrency(event.price)}
          </span>
        </div>

        <h3 className="event-card-title">{event.title}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {event.venue}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {date.toLocaleDateString('en', { weekday: 'short', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Sold out indicator */}
        {event.ticketsSold >= 50 && (
          <div style={{ marginTop: 12, textAlign: 'center', padding: '6px', background: 'rgba(224,92,92,0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--red)' }}>
            Sold Out
          </div>
        )}
      </div>
      </TiltCard>
    </motion.div>
  );
}