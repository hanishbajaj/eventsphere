// pages/EventDetail.jsx — Full event detail with maps + seat purchase + QR + Reviews
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SeatMap from "../components/SeatMap";
import Modal from "../components/Modal";

const CATEGORY_CLASSES = {
  "Concert / Music": "cat-concert",
  Sports: "cat-sports",
  Conference: "cat-conference",
  Workshop: "cat-workshop",
  Theater: "cat-theater",
  Festival: "cat-festival",
  Webinar: "cat-webinar",
  "Charity Gala": "cat-charity",
};

/* ─── Reviews Storage (localStorage-based) ─────── */
function getReviews(eventId) {
  const all = JSON.parse(localStorage.getItem('es_reviews') || '{}');
  return all[eventId] || [];
}

function saveReview(eventId, review) {
  const all = JSON.parse(localStorage.getItem('es_reviews') || '{}');
  if (!all[eventId]) all[eventId] = [];
  all[eventId].unshift(review);
  localStorage.setItem('es_reviews', JSON.stringify(all));
  return all[eventId];
}

/* ─── Sample reviews seeder ────────────────────── */
const SAMPLE_REVIEWS = [
  { name: 'Rahul Sharma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', rating: 5, text: 'Amazing experience! The stage setup and lighting were incredible. Would definitely attend again.', date: '2026-02-15' },
  { name: 'Priya Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', rating: 4, text: 'Well organized event with great speakers. The venue was a bit crowded but overall fantastic.', date: '2026-02-10' },
  { name: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', rating: 5, text: 'One of the best events I\'ve attended this year. The networking opportunities were excellent!', date: '2026-01-28' },
  { name: 'Maria Gonzalez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', rating: 3, text: 'Good event overall. Sound quality could have been better but the performances were great.', date: '2026-01-20' },
  { name: 'James Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', rating: 4, text: 'Loved the atmosphere and the energy of the crowd. Ticket price was very reasonable for the quality.', date: '2026-01-15' },
];

function StarDisplay({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? 'var(--gold)' : 'none'}
          stroke={i <= rating ? 'var(--gold)' : 'var(--text-muted)'}
          strokeWidth={2}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function ReviewsSection({ eventId, user }) {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newText, setNewText] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let existing = getReviews(eventId);
    // Seed sample reviews if none exist
    if (existing.length === 0) {
      const all = JSON.parse(localStorage.getItem('es_reviews') || '{}');
      const count = 3 + Math.floor(Math.random() * 3);
      all[eventId] = SAMPLE_REVIEWS.slice(0, count).map(r => ({ ...r, id: Math.random().toString(36).substr(2, 9) }));
      localStorage.setItem('es_reviews', JSON.stringify(all));
      existing = all[eventId];
    }
    setReviews(existing);
  }, [eventId]);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const handleSubmit = () => {
    if (!newRating) { toast('Please select a rating', 'error'); return; }
    if (!newText.trim()) { toast('Please write a review', 'error'); return; }
    const review = {
      id: Math.random().toString(36).substr(2, 9),
      name: user?.name || 'Anonymous',
      avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      rating: newRating,
      text: newText.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    const updated = saveReview(eventId, review);
    setReviews(updated);
    setNewRating(0);
    setNewText('');
    setShowForm(false);
    toast('Review submitted!', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ marginTop: 32 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: '1.2rem' }}>Reviews & Ratings</h3>
        {user && (
          <motion.button
            className="btn btn-outline btn-sm"
            onClick={() => setShowForm(f => !f)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </motion.button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="rating-big">
          <div className="rating-big-number">{avgRating}</div>
          <StarDisplay rating={Math.round(Number(avgRating))} size={18} />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="rating-bars">
          {distribution.map(d => (
            <div key={d.star} className="rating-bar-row">
              <span style={{ width: 50 }}>{d.star} star{d.star !== 1 ? 's' : ''}</span>
              <div className="rating-bar-track">
                <motion.div
                  className="rating-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 0.8, delay: (5 - d.star) * 0.1 }}
                />
              </div>
              <span style={{ width: 24, textAlign: 'right' }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}
          >
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your Rating</div>
                <div className="star-input">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      className="star-btn"
                      onClick={() => setNewRating(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24"
                        fill={i <= (hoverRating || newRating) ? 'var(--gold)' : 'none'}
                        stroke={i <= (hoverRating || newRating) ? 'var(--gold)' : 'var(--text-muted)'}
                        strokeWidth={2}
                        style={{ transition: 'all 0.15s ease' }}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Your Review</label>
                <textarea className="form-input" rows={3} value={newText} onChange={e => setNewText(e.target.value)} placeholder="Share your experience..." />
              </div>
              <motion.button className="btn btn-gold" onClick={handleSubmit} whileTap={{ scale: 0.97 }}>
                Submit Review
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Cards */}
      {reviews.map((review, i) => (
        <motion.div
          key={review.id}
          className="review-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <div className="review-header">
            <img src={review.avatar} alt={review.name} className="review-avatar" />
            <div className="review-meta">
              <div className="review-name">{review.name}</div>
              <div className="review-date">{new Date(review.date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <StarDisplay rating={review.rating} size={14} />
          </div>
          <div className="review-text">{review.text}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    api
      .getEvent(id)
      .then(setEvent)
      .catch(() => toast("Event not found", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePurchase = async (seatSelection) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "buyer") {
      toast("Only ticket buyers can purchase tickets", "error");
      return;
    }

    setPurchasing(true);
    try {
      const result = await api.purchaseTicket({
        eventId: id,
        ...seatSelection,
      });
      setTicket(result.ticket);
      setShowSeatModal(false);
      setShowQR(true);
      toast("🎉 Ticket purchased successfully!", "success");
      // Refresh event to update seat availability
      const updated = await api.getEvent(id);
      setEvent(updated);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "100px 0",
        }}
      >
        <div className="spinner" />
      </div>
    );

  if (!event) return null;

  const date = new Date(event.date);
  const catClass = CATEGORY_CLASSES[event.category] || "badge-gold";
  const hasSeats = event.seats?.length > 0;
  const googleMapsQuery = encodeURIComponent(event.address || event.venue);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ height: "45vh", position: "relative", overflow: "hidden" }}
      >
        <img
          src={event.image}
          alt={event.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, var(--bg-base) 100%)",
          }}
        />
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            position: "absolute",
            top: 20,
            left: 24,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "var(--radius-sm)",
            color: "#fff",
            padding: "8px 16px",
            fontSize: "0.82rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back
        </motion.button>
      </motion.div>

      <div
        className="container"
        style={{
          paddingBottom: 64,
          marginTop: -80,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <span className={`badge ${catClass}`}>{event.category}</span>
              {event.featured && (
                <span className="badge badge-gold">⭐ Featured</span>
              )}
              <span
                className={`badge ${
                  event.status === "approved" ? "badge-green" : "badge-orange"
                }`}
              >
                {event.status}
              </span>
            </div>

            <h1
              style={{
                marginBottom: 20,
                fontWeight: 400,
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
              }}
            >
              {event.title}
            </h1>

            <div
              style={{
                display: "flex",
                gap: 24,
                marginBottom: 32,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {date.toLocaleDateString("en", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {" at "}
                {date.toLocaleTimeString("en", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {event.venue}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                {event.ticketsSold} tickets sold
              </div>
            </div>

            {/* Description */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                marginBottom: 24,
              }}
            >
              <h3 style={{ marginBottom: 16, fontSize: "1.1rem" }}>
                About This Event
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                {event.description}
              </p>

              {event.tags?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 20,
                    flexWrap: "wrap",
                  }}
                >
                  {(Array.isArray(event.tags)
                    ? event.tags
                    : String(event.tags).split(",")
                  )
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "3px 12px",
                          borderRadius: 100,
                          fontSize: "0.75rem",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--text-muted)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Google Maps embed */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <div style={{ padding: "20px 20px 16px" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>
                  Venue & Directions
                </h3>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {event.address}
                </div>
              </div>
              <iframe
                title="Event Location"
                width="100%"
                height="280"
                frameBorder="0"
                style={{ borderTop: "1px solid var(--border)" }}
                src={`https://maps.google.com/maps?q=${googleMapsQuery}&output=embed&z=14`}
                allowFullScreen
              />
              <div style={{ padding: "12px 20px", display: "flex", gap: 12 }}>
                <a
                  href={`https://maps.google.com/maps?q=${googleMapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Open in Maps ↗
                </a>
                <a
                  href={`https://maps.google.com/maps?daddr=${googleMapsQuery}&dirflg=d`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Get Directions →
                </a>
              </div>
            </div>

            {/* Organizer */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--gold-dim), var(--gold))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {event.organizerName?.charAt(0)}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Organized by
                </div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>
                  {event.organizerName}
                </div>
              </div>
            </div>

            {/* Reviews & Ratings */}
            <ReviewsSection eventId={id} user={user} />
          </motion.div>

          {/* Ticket sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{ position: "sticky", top: 100 }}
          >
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-gold)",
                borderRadius: "var(--radius-xl)",
                padding: "32px",
                boxShadow: "var(--shadow-gold)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 8,
                  }}
                >
                  Ticket Price
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "3rem",
                    fontWeight: 600,
                    color: "var(--gold)",
                    lineHeight: 1,
                  }}
                >
                  {event.price === 0 ? "Free" : `$${event.price}`}
                </div>
                {event.price > 0 && (
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      marginTop: 4,
                    }}
                  >
                    per ticket
                  </div>
                )}
              </div>

              <div className="divider" />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginBottom: 24,
                }}
              >
                {[
                  {
                    label: "Date",
                    value: date.toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                  },
                  {
                    label: "Time",
                    value: date.toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                  { label: "Venue", value: event.venue },
                  {
                    label: "Capacity",
                    value: `${event.ticketsSold} / ${
                      event.seats?.reduce((a, s) => a + (s.capacity || 1), 0) ||
                      50
                    } sold`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontSize: "0.875rem", textAlign: "right" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {user?.role === "buyer" && event.status === "approved" && (
                <motion.button
                  className="btn btn-gold"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                  onClick={() => setShowSeatModal(true)}
                  whileTap={{ scale: 0.97 }}
                  disabled={purchasing}
                >
                  {hasSeats ? "🎭 Select Your Seat" : "🎟 Purchase Ticket"}
                </motion.button>
              )}

              {!user && (
                <button
                  className="btn btn-outline"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => navigate("/login")}
                >
                  Sign in to Purchase
                </button>
              )}

              {user && user.role !== "buyer" && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.82rem",
                  }}
                >
                  Ticket purchase is for buyers only
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Seat selection modal */}
      <Modal
        open={showSeatModal}
        onClose={() => setShowSeatModal(false)}
        title={`Select Your Seat — ${event.title}`}
        maxWidth={680}
      >
        {purchasing ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }} />
            <div style={{ color: "var(--text-secondary)" }}>
              Processing your purchase...
            </div>
          </div>
        ) : (
          <SeatMap event={event} onConfirm={handlePurchase} />
        )}
      </Modal>

      {/* QR Ticket Modal */}
      <Modal
        open={showQR}
        onClose={() => setShowQR(false)}
        title="Your Digital Ticket"
        maxWidth={420}
      >
        {ticket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center" }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                display: "inline-block",
                marginBottom: 20,
              }}
            >
              <div className="qr-reveal">
                <QRCodeSVG
                  value={ticket.pdfUrl || `${window.location.origin}/ticket/${ticket.id}`}
                  size={200}
                  level="H"
                  fgColor="#08080f"
                  bgColor="#ffffff"
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 4 }}>{event.title}</h3>
              <div
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                {new Date(event.date).toLocaleDateString("en", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Seat
                </div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>
                  {ticket.zone ||
                    (ticket.row && ticket.number
                      ? `Row ${ticket.row}, #${ticket.number}`
                      : "General")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Ticket ID
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    marginTop: 2,
                    color: "var(--gold)",
                  }}
                >
                  {ticket.id?.substring(0, 8).toUpperCase()}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginBottom: 20,
              }}
            >
              Scan this QR code at the venue entrance for entry
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setShowQR(false)}
              >
                Close
              </button>
              <button
                className="btn btn-gold"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => navigate("/dashboard/buyer/tickets")}
              >
                My Tickets →
              </button>
            </div>
          </motion.div>
        )}
      </Modal>
    </div>
  );
}
