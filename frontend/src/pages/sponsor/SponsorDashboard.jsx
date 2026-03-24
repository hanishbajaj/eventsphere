// pages/sponsor/SponsorDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DashLayout from '../../components/DashLayout';
import Modal from '../../components/Modal';
import EventCard from '../../components/EventCard';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FieldError from '../../components/FieldError';
import { validateAmount, numericInputProps } from '../../utils/validation';
import { formatCurrency } from '../../utils/currency';

const localizer = momentLocalizer(moment);

const CATEGORIES = ['All', 'Concert / Music', 'Sports', 'Conference', 'Workshop', 'Theater', 'Festival', 'Webinar', 'Charity Gala'];

export default function SponsorDashboard({ tab = 'Overview' }) {
  const { user } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ eventId: '', amount: '', message: '' });
  const [requestErrors, setRequestErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ev, req] = await Promise.all([api.getEvents(), api.getMySponsorRequests()]);
      setEvents(ev);
      setRequests(req);
    } catch {
      toast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!requestForm.eventId) errs.eventId = 'Please select an event';
    const amtResult = validateAmount(requestForm.amount, { min: 100, label: 'Amount' });
    if (!amtResult.valid) errs.amount = amtResult.error;
    setRequestErrors(errs);
    if (Object.keys(errs).length > 0) { toast('Please fix the errors below', 'error'); return; }
    setSubmitting(true);
    try {
      await api.sendSponsorRequest(requestForm);
      toast('Sponsorship request sent successfully!', 'success');
      setShowRequestModal(false);
      setRequestForm({ eventId: '', amount: '', message: '' });
      setRequestErrors({});
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openSponsorRequest = (event) => {
    setSelectedEvent(event);
    setRequestForm({ eventId: event.id, amount: '', message: '' });
    setShowRequestModal(true);
  };

  const calendarEvents = events.map(ev => ({
    id: ev.id,
    title: ev.title,
    start: new Date(ev.date),
    end: new Date(ev.endDate || ev.date),
    resource: ev,
  }));

  const filteredEvents = events.filter(ev => {
    const matchCat = filterCat === 'All' || ev.category === filterCat;
    const matchSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase()) || ev.venue.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalCommitted = requests.filter(r => r.status === 'accepted').reduce((s, r) => s + (r.amount || 0), 0);
  const totalPending = requests.filter(r => r.status === 'pending').reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <DashLayout activeTab={tab}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 300 }}>
          {tab === 'Overview'
            ? <>Welcome, <em style={{ fontStyle: 'italic', color: 'var(--green)' }}>{user?.name.split(' ')[0]}</em></>
            : tab}
        </h2>
        {user?.company && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
            {user.company}
          </div>
        )}
      </motion.div>

      {/* ─── OVERVIEW ──────────────────────────────── */}
      {tab === 'Overview' && (
        <div>
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: 40 }}>
            {[
              { v: requests.length, l: 'Total Requests', i: '📨', c: 'var(--green)' },
              { v: requests.filter(r => r.status === 'accepted').length, l: 'Accepted', i: '✅', c: 'var(--gold)' },
              { v: formatCurrency(totalCommitted), l: 'Committed Funding', i: '💰', c: 'var(--blue)' },
              { v: formatCurrency(totalPending), l: 'Pending Amount', i: '⏳', c: 'var(--orange)' },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="stat-card"
                style={{ borderLeft: `3px solid ${s.c}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="stat-number" style={{ color: s.c }}>{s.v}</div>
                    <div className="stat-label">{s.l}</div>
                  </div>
                  <div style={{ fontSize: '1.6rem' }}>{s.i}</div>
                </div>
              </motion.div>
            ))}
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
                { label: 'Browse Events', icon: '🔍', action: () => window.location.href = '/events' },
                { label: 'View Calendar', icon: '📅', action: () => window.location.href = '/dashboard/sponsor/calendar' },
                { label: 'My Requests', icon: '📨', action: () => window.location.href = '/dashboard/sponsor/requests' },
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

          {/* Recent requests */}
          <div>
            <h3 style={{ marginBottom: 20, fontSize: '1.15rem' }}>Recent Requests</h3>
            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤝</div>
                <div>No sponsorship requests sent yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {requests.slice(0, 4).map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="card"
                    style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{req.eventTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {new Date(req.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--green)', fontSize: '1.1rem' }}>
                      {formatCurrency(req.amount)}
                    </div>
                    <span className={`badge ${req.status === 'accepted' ? 'badge-green' : req.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>
                      {req.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested events to sponsor */}
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.15rem' }}>Events to Sponsor</h3>
            </div>
            {loading ? (
              <div style={{ display: 'flex', gap: 20 }}>
                {[1, 2, 3].map(i => <div key={i} style={{ flex: 1 }}><div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} /></div>)}
              </div>
            ) : (
              <div className="grid-3">
                {events.slice(0, 3).map((ev, i) => (
                  <div key={ev.id} style={{ position: 'relative' }}>
                    <EventCard event={ev} index={i} onClick={() => {
                      setSelectedEvent(ev);
                      setShowEventModal(true);
                    }} />
                    <button
                      className="btn btn-gold btn-sm"
                      style={{ position: 'absolute', bottom: 64, right: 20, zIndex: 2 }}
                      onClick={(e) => { e.stopPropagation(); openSponsorRequest(ev); }}
                    >
                      Sponsor →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── EVENT CALENDAR ───────────────────────── */}
      {tab === 'Event Calendar' && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Click any event on the calendar to view details and send a sponsorship request.
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 580 }}
              onSelectEvent={(calEv) => {
                setSelectedEvent(calEv.resource);
                setShowEventModal(true);
              }}
              views={['month', 'week', 'day']}
              popup
            />
          </div>
        </div>
      )}

      {/* ─── MY REQUESTS ──────────────────────────── */}
      {tab === 'My Requests' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3>Sponsorship Requests ({requests.length})</h3>
            <button className="btn btn-gold btn-sm" onClick={() => { setSelectedEvent(null); setRequestForm({ eventId: '', amount: '', message: '' }); setShowRequestModal(true); }}>
              + New Request
            </button>
          </div>

          {requests.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤝</div>
              <h3 style={{ fontWeight: 400, marginBottom: 8 }}>No requests yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Browse events and send your first sponsorship request</p>
              <button className="btn btn-gold" onClick={() => { setShowRequestModal(true); }}>Send Request</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {requests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="card"
                  style={{ padding: '20px 24px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', marginBottom: 6 }}>
                        {req.eventTitle}
                      </div>
                      {req.message && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>
                          "{req.message}"
                        </div>
                      )}
                      {req.responseNote && (
                        <div style={{
                          background: req.status === 'accepted' ? 'rgba(76,175,125,0.1)' : 'rgba(224,92,92,0.1)',
                          border: `1px solid ${req.status === 'accepted' ? 'rgba(76,175,125,0.25)' : 'rgba(224,92,92,0.25)'}`,
                          borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.82rem',
                          color: req.status === 'accepted' ? 'var(--green)' : 'var(--red)'
                        }}>
                          Organizer note: "{req.responseNote}"
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                        Submitted {new Date(req.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--green)', lineHeight: 1 }}>
                        {formatCurrency(req.amount)}
                      </div>
                      <span
                        className={`badge ${req.status === 'accepted' ? 'badge-green' : req.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}
                        style={{ marginTop: 8, display: 'inline-block' }}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── EVENT DETAIL MODAL ───────────────────── */}
      <Modal open={showEventModal} onClose={() => setShowEventModal(false)} title="Event Details" maxWidth={520}>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <img
              src={selectedEvent.image}
              alt={selectedEvent.title}
              style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 20 }}
            />
            <h3 style={{ marginBottom: 8 }}>{selectedEvent.title}</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className="badge badge-gold">{selectedEvent.category}</span>
              <span className="badge badge-green">{selectedEvent.price === 0 ? 'Free' : `$${selectedEvent.price}`}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>
              {selectedEvent.description}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                { icon: '📅', label: new Date(selectedEvent.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' }) },
                { icon: '📍', label: `${selectedEvent.venue} — ${selectedEvent.address}` },
                { icon: '🎫', label: `${selectedEvent.ticketsSold} tickets sold` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                  <span>{item.icon}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowEventModal(false)}>
                Close
              </button>
              <button
                className="btn btn-gold"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setShowEventModal(false); openSponsorRequest(selectedEvent); }}
              >
                🤝 Sponsor This Event
              </button>
            </div>
          </motion.div>
        )}
      </Modal>

      {/* ─── SEND REQUEST MODAL ───────────────────── */}
      <Modal open={showRequestModal} onClose={() => setShowRequestModal(false)} title="Send Sponsorship Request" maxWidth={480}>
        <form onSubmit={handleSendRequest}>
          {selectedEvent && (
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
              padding: '14px 18px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <img src={selectedEvent.image} alt="" style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{selectedEvent.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedEvent.venue}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!selectedEvent && (
              <div className="form-group">
                <label className="form-label">Select Event *</label>
                <select className={`form-input ${requestErrors.eventId ? 'error' : ''}`} value={requestForm.eventId}
                  onChange={e => { setRequestForm(f => ({ ...f, eventId: e.target.value })); setRequestErrors(er => ({ ...er, eventId: '' })); }}>
                  <option value="">Choose an event...</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
                <FieldError error={requestErrors.eventId} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Sponsorship Amount (₹) *</label>
              <input
                type="text"
                inputMode="decimal"
                className={`form-input ${requestErrors.amount ? 'error' : ''}`}
                placeholder="e.g. 5000 (min ₹100)"
                {...numericInputProps(requestForm.amount, v => { setRequestForm(f => ({ ...f, amount: v })); setRequestErrors(er => ({ ...er, amount: '' })); })}
              />
              <FieldError error={requestErrors.amount} />
            </div>
            <div className="form-group">
              <label className="form-label">Message to Organizer</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Tell the organizer about your sponsorship goals..."
                value={requestForm.message}
                onChange={e => setRequestForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowRequestModal(false)}>
              Cancel
            </button>
            <motion.button
              type="submit"
              className="btn btn-gold"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={submitting}
              whileTap={{ scale: 0.97 }}
            >
              {submitting
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending...</>
                : '🤝 Send Request'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </DashLayout>
  );
}