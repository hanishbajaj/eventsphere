// pages/buyer/BuyerDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import DashLayout from '../../components/DashLayout';
import EventCard from '../../components/EventCard';
import Modal from '../../components/Modal';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

function StatCard({ value, label, icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-number" style={{ color }}>{value}</div>
          <div className="stat-label">{label}</div>
        </div>
        <div style={{ fontSize: '1.6rem' }}>{icon}</div>
      </div>
    </motion.div>
  );
}

export default function BuyerDashboard({ tab = 'Overview' }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getMyTickets().catch(() => []),
      api.getEvents({ featured: true }).catch(() => []),
    ]).then(([t, e]) => {
      setTickets(t);
      setEvents(e.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const openTicket = (ticket) => { setSelectedTicket(ticket); setShowTicketModal(true); };

  const isTicketsTab = tab === 'My Tickets';

  return (
    <DashLayout activeTab={tab}>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h2 style={{ fontWeight: 300 }}>Welcome back, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{user?.name.split(' ')[0]}</em></h2>
      </motion.div>

      {isTicketsTab ? (
        /* ─── MY TICKETS VIEW ─────────────────────── */
        <div>
          <h3 style={{ marginBottom: 24 }}>My Tickets ({tickets.length})</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
          ) : tickets.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 40px',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎟</div>
              <h3 style={{ marginBottom: 8, fontWeight: 400 }}>No tickets yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Browse events and purchase your first ticket</p>
              <button className="btn btn-gold" onClick={() => navigate('/events')}>Explore Events →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tickets.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="card"
                  style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }}
                  onClick={() => openTicket(ticket)}
                  whileHover={{ x: 4 }}
                >
                  <div style={{
                    width: 48, height: 48, background: 'var(--gold-glow)', border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', flexShrink: 0
                  }}>🎫</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>
                      {ticket.eventTitle}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {ticket.eventVenue} · {new Date(ticket.eventDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {ticket.zone && <div style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: 2 }}>Zone: {ticket.zone}</div>}
                    {ticket.row && ticket.number && <div style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: 2 }}>Row {ticket.row}, Seat {ticket.number}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold)', fontSize: '1.1rem' }}>
                      ${ticket.price}
                    </div>
                    <span className="badge badge-green" style={{ marginTop: 4 }}>{ticket.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>→</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ─── OVERVIEW ─────────────────────────────── */
        <div>
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: 40 }}>
            <StatCard value={tickets.length} label="Tickets Purchased" icon="🎫" color="var(--gold)" delay={0} />
            <StatCard value={tickets.filter(t => new Date(t.eventDate) > new Date()).length} label="Upcoming Events" icon="📅" color="var(--blue)" delay={0.07} />
            <StatCard value={`$${tickets.reduce((s, t) => s + (t.price || 0), 0)}`} label="Total Spent" icon="💳" color="var(--green)" delay={0.14} />
            <StatCard value={events.length} label="Featured Events" icon="⭐" color="var(--orange)" delay={0.21} />
          </div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: 40
            }}
          >
            <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Browse All Events', icon: '🔍', action: () => navigate('/events') },
                { label: 'My Tickets', icon: '🎫', action: () => navigate('/dashboard/buyer/tickets') },
                { label: 'Concert Events', icon: '🎵', action: () => navigate('/events?category=Concert+%2F+Music') },
                { label: 'Free Events', icon: '🎁', action: () => navigate('/events') },
              ].map(item => (
                <motion.button
                  key={item.label}
                  className="btn btn-ghost"
                  onClick={item.action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {item.icon} {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Featured events */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem' }}>Recommended Events</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View All →</button>
            </div>
            {loading ? (
              <div style={{ display: 'flex', gap: 20 }}>
                {[1, 2, 3].map(i => <div key={i} style={{ flex: 1 }}><div className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} /></div>)}
              </div>
            ) : (
              <div className="grid-3">
                {events.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
              </div>
            )}
          </div>

          {/* Recent tickets */}
          {tickets.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.2rem' }}>Recent Tickets</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/buyer/tickets')}>View All →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tickets.slice(0, 3).map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="card"
                    style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                    onClick={() => openTicket(ticket)}
                  >
                    <div style={{ fontSize: '1.2rem' }}>🎫</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{ticket.eventTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{ticket.eventVenue}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gold)' }}>
                      {ticket.id?.substring(0, 8).toUpperCase()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ticket QR Modal */}
      <Modal open={showTicketModal} onClose={() => setShowTicketModal(false)} title="Digital Ticket" maxWidth={420}>
        {selectedTicket && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, display: 'inline-block', marginBottom: 20 }}>
              <div className="qr-reveal">
                <QRCodeSVG value={selectedTicket.pdfUrl || `${window.location.origin}/ticket/${selectedTicket.id}`} size={180} level="H" fgColor="#08080f" bgColor="#ffffff" />
              </div>
            </div>
            <h3 style={{ marginBottom: 4 }}>{selectedTicket.eventTitle}</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
              {selectedTicket.eventVenue} · {new Date(selectedTicket.eventDate).toLocaleDateString('en', { month: 'long', day: 'numeric' })}
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
              {selectedTicket.zone && <div><strong>Zone:</strong> {selectedTicket.zone}</div>}
              {selectedTicket.row && <div><strong>Row {selectedTicket.row}</strong>, Seat {selectedTicket.number}</div>}
              <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gold)' }}>
                ID: {selectedTicket.id?.toUpperCase()}
              </div>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowTicketModal(false)}>Close</button>
          </div>
        )}
      </Modal>
    </DashLayout>
  );
}
