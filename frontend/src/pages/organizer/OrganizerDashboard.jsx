// pages/organizer/OrganizerDashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashLayout from '../../components/DashLayout';
import Modal from '../../components/Modal';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FieldError from '../../components/FieldError';
import { validateText, validateAmount, validateDate, validateUrl, validateDescription, numericInputProps } from '../../utils/validation';
import { formatCurrency } from '../../utils/currency';

const CATEGORIES = ['Concert / Music', 'Sports', 'Conference', 'Workshop', 'Theater', 'Festival', 'Webinar', 'Charity Gala'];

function EventForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || {
    title: '', category: 'Conference', date: '', endDate: '',
    venue: '', address: '', description: '', price: '', image: '', tags: '', seatCount: 40
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (touched[k]) setErrors(e => ({ ...e, [k]: validateField(k, v) }));
  };

  const validateField = (k, v) => {
    switch (k) {
      case 'title':       return validateText(v, { label: 'Title', min: 3 }).error;
      case 'venue':       return validateText(v, { label: 'Venue', min: 3 }).error;
      case 'date':        return validateDate(v, { label: 'Start date' }).error;
      case 'description': return validateDescription(v, { min: 10 }).error;
      case 'price':       return v !== '' ? validateAmount(v, { min: 0, allowZero: true, label: 'Price' }).error : '';
      case 'image':       return (v && v.startsWith('data:image/')) ? '' : validateUrl(v).error;
      default:            return '';
    }
  };

  const handleBlur = (k) => {
    setTouched(t => ({ ...t, [k]: true }));
    setErrors(e => ({ ...e, [k]: validateField(k, form[k]) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ['title', 'venue', 'date'];
    const optionalFields = ['price', 'image', 'description'];
    const allFields = [...requiredFields, ...optionalFields];
    setTouched(Object.fromEntries(allFields.map(f => [f, true])));
    const errs = Object.fromEntries(allFields.map(f => [f, validateField(f, form[f])]));
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    onSave(form);
  };

  const priceProps = numericInputProps(form.price, v => set('price', v));

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Event Title *</label>
          <input className={`form-input ${touched.title && errors.title ? 'error' : ''}`}
            value={form.title} onChange={e => set('title', e.target.value)} onBlur={() => handleBlur('title')}
            placeholder="Give your event a name" />
          <FieldError error={touched.title && errors.title} />
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select required className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Ticket Price (₹)</label>
          <input type="text" inputMode="decimal"
            className={`form-input ${touched.price && errors.price ? 'error' : ''}`}
            placeholder="0 for free"
            {...priceProps}
            onBlur={(e) => { priceProps.onBlur(e); handleBlur('price'); }}
          />
          <FieldError error={touched.price && errors.price} />
        </div>
        <div className="form-group">
          <label className="form-label">Start Date & Time *</label>
          <input type="datetime-local" className={`form-input ${touched.date && errors.date ? 'error' : ''}`}
            value={form.date} onChange={e => set('date', e.target.value)} onBlur={() => handleBlur('date')} />
          <FieldError error={touched.date && errors.date} />
        </div>
        <div className="form-group">
          <label className="form-label">End Date & Time</label>
          <input type="datetime-local" className="form-input"
            value={form.endDate} onChange={e => set('endDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Venue Name *</label>
          <input className={`form-input ${touched.venue && errors.venue ? 'error' : ''}`}
            value={form.venue} onChange={e => set('venue', e.target.value)} onBlur={() => handleBlur('venue')}
            placeholder="Venue / hall name" />
          <FieldError error={touched.venue && errors.venue} />
        </div>
        <div className="form-group">
          <label className="form-label">Full Address</label>
          <input className="form-input" value={form.address}
            onChange={e => set('address', e.target.value)} placeholder="Street, City, State" />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Description</label>
          <textarea className={`form-input ${touched.description && errors.description ? 'error' : ''}`}
            rows={3} value={form.description}
            onChange={e => set('description', e.target.value)} onBlur={() => handleBlur('description')}
            placeholder="Describe your event (min 10 characters)..." />
          <FieldError error={touched.description && errors.description} />
        </div>
        <div className="form-group">
          <label className="form-label">Event Banner Image</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {form.image && (
              <img src={form.image} alt="Preview" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
            )}
            <label className={`btn btn-outline ${touched.image && errors.image ? 'error' : ''}`} style={{ cursor: 'pointer', flex: 1, justifyContent: 'center', margin: 0 }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const img = new Image();
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    let width = img.width;
                    let height = img.height;
                    if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    set('image', canvas.toDataURL('image/jpeg', 0.8));
                  };
                  img.src = event.target.result;
                };
                reader.readAsDataURL(file);
              }} />
              {form.image ? "Change Image" : "Upload Banner"}
            </label>
          </div>
          <FieldError error={touched.image && errors.image} />
        </div>
        <div className="form-group">
          <label className="form-label">Tags (comma-separated)</label>
          <input className="form-input" value={form.tags}
            onChange={e => set('tags', e.target.value)} placeholder="music, outdoor, family" />
        </div>
        <div className="form-group">
          <label className="form-label">Seat Count (max 50)</label>
          <input type="number" min="1" max="50" className="form-input"
            value={form.seatCount} onChange={e => set('seatCount', Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <motion.button type="submit" className="btn btn-gold" disabled={loading} whileTap={{ scale: 0.97 }}>
          {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : initial ? 'Save Changes' : 'Create Event →'}
        </motion.button>
      </div>
    </form>
  );
}

const POSTER_STYLES = [
  { id: 'concert', label: 'Concert Style', className: 'poster-concert' },
  { id: 'conference', label: 'Conference Style', className: 'poster-conference' },
  { id: 'festival', label: 'Festival Style', className: 'poster-festival' },
  { id: 'minimal', label: 'Minimal Style', className: 'poster-minimal' },
];

function PosterDecorations({ style }) {
  if (style === 'concert') {
    return (
      <div className="poster-decoration">
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(224,92,224,0.08)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
      </div>
    );
  }
  if (style === 'conference') {
    return (
      <div className="poster-decoration">
        <div style={{ position: 'absolute', inset: 16, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)' }} />
        <div style={{ position: 'absolute', top: '8%', right: '8%', width: 80, height: 80, border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '12%', left: '8%', width: 50, height: 50, border: '1px solid rgba(92,140,224,0.15)', borderRadius: '50%' }} />
      </div>
    );
  }
  if (style === 'festival') {
    return (
      <div className="poster-decoration">
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 30% 20%, rgba(224,92,92,0.1) 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 70% 80%, rgba(201,168,76,0.1) 0%, transparent 50%)' }} />
      </div>
    );
  }
  // Minimal
  return (
    <div className="poster-decoration">
      <div style={{ position: 'absolute', bottom: '30%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.1) 50%, transparent 80%)' }} />
    </div>
  );
}

function PosterGenerator({ events }) {
  const [posterData, setPosterData] = useState({ title: '', date: '', location: '', category: 'Conference', style: 'concert' });
  const [generated, setGenerated] = useState(false);
  const canvasRef = useRef(null);

  const set = (k, v) => setPosterData(p => ({ ...p, [k]: v }));

  // Auto-fill from existing event
  const handleEventSelect = (e) => {
    const ev = events.find(ev => ev.id === e.target.value);
    if (ev) {
      setPosterData({
        title: ev.title,
        date: ev.date ? new Date(ev.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '',
        location: ev.venue || '',
        category: ev.category || 'Conference',
        style: posterData.style,
      });
    }
  };

  const handleGenerate = () => setGenerated(true);

  const handleDownload = () => {
    const el = canvasRef.current;
    if (!el) return;
    // Use html2canvas-like approach: render to a data URL via SVG foreignObject
    const { width, height } = el.getBoundingClientRect();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml"
            style="width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:32px;
            background:${posterData.style === 'concert' ? 'linear-gradient(135deg,#1a0a2e,#2d1b69,#1a0a2e)' : posterData.style === 'conference' ? 'linear-gradient(135deg,#0a1628,#1b2d50,#0a1628)' : posterData.style === 'festival' ? 'linear-gradient(135deg,#2e0a1a,#692d1b,#2e0a1a)' : 'linear-gradient(135deg,#0f0f0f,#1a1a1a,#0f0f0f)'};">
            <div style="font-family:Montserrat,sans-serif;font-size:28px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">${posterData.title || 'EVENT NAME'}</div>
            <div style="font-family:Montserrat,sans-serif;font-size:16px;color:#e8d5a3;margin-bottom:6px;">${posterData.date || 'DATE'}</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-bottom:10px;">${posterData.location || 'LOCATION'}</div>
            <div style="padding:4px 14px;border:1px solid #c9a84c;border-radius:100px;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">${posterData.category}</div>
            <div style="position:absolute;bottom:20px;left:0;right:0;text-align:center;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.15em;">EVENTSPHERE</div>
          </div>
        </foreignObject>
      </svg>
    `;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(posterData.title || 'poster').replace(/\s+/g, '-').toLowerCase()}-poster.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentStyle = POSTER_STYLES.find(s => s.id === posterData.style) || POSTER_STYLES[0];

  return (
    <div>
      <h3 style={{ marginBottom: 24 }}>Poster Generator</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
        {/* Inputs */}
        <div className="card" style={{ padding: '28px' }}>
          {events.length > 0 && (
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Auto-fill from Event</label>
              <select className="form-input" onChange={handleEventSelect} defaultValue="">
                <option value="" disabled>Select an event...</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input className="form-input" value={posterData.title} onChange={e => set('title', e.target.value)} placeholder="Event name" />
            </div>
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input className="form-input" value={posterData.date} onChange={e => set('date', e.target.value)} placeholder="e.g. Saturday, March 15, 2026" />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={posterData.location} onChange={e => set('location', e.target.value)} placeholder="Venue name" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={posterData.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Poster Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {POSTER_STYLES.map(s => (
                  <motion.button
                    key={s.id}
                    type="button"
                    className={`btn btn-sm ${posterData.style === s.id ? 'btn-gold' : 'btn-ghost'}`}
                    onClick={() => set('style', s.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ justifyContent: 'center' }}
                  >
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <motion.button
              className="btn btn-gold"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleGenerate}
              whileHover={{ boxShadow: '0 0 30px rgba(201,168,76,0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              Generate Poster
            </motion.button>
            {generated && (
              <motion.button
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleDownload}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}
                whileTap={{ scale: 0.97 }}
              >
                Download Poster
              </motion.button>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Live Preview
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={posterData.style + (generated ? '-gen' : '')}
              ref={canvasRef}
              className={`poster-preview ${currentStyle.className}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <PosterDecorations style={posterData.style} />
              <div className="poster-content">
                <div className="poster-title">{posterData.title || 'EVENT NAME'}</div>
                <div className="poster-date">{posterData.date || 'DATE'}</div>
                <div className="poster-location">{posterData.location || 'LOCATION'}</div>
                <div className="poster-category">{posterData.category}</div>
              </div>
              <div className="poster-brand">EVENTSPHERE</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDashboard({ tab = 'Overview' }) {
  const { user } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [respondModal, setRespondModal] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [respondNote, setRespondNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ev, req] = await Promise.all([
        api.getMyEvents(),
        api.getIncomingRequests(),
      ]);
      setEvents(ev);
      setRequests(req);
    } catch {
      toast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    setSavingEvent(true);
    try {
      await api.createEvent({ ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] });
      toast('Event created! Awaiting approval.', 'success');
      setShowCreateModal(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleEdit = async (form) => {
    setSavingEvent(true);
    try {
      await api.updateEvent(editingEvent.id, form);
      toast('Event updated successfully', 'success');
      setShowEditModal(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await api.deleteEvent(id);
      toast('Event deleted', 'success');
      setEvents(e => e.filter(ev => ev.id !== id));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleRespond = async (status) => {
    try {
      await api.respondToRequest(selectedRequest.id, { status, responseNote: respondNote });
      toast(`Sponsor request ${status}`, status === 'accepted' ? 'success' : 'info');
      setRespondModal(false);
      setRespondNote('');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const isEventsTab = tab === 'My Events';
  const isCreateTab = tab === 'Create Event';
  const isSponsorsTab = tab === 'Sponsor Requests';
  const isAnalyticsTab = tab === 'Analytics';
  const isPosterTab = tab === 'Poster Generator';

  const totalRevenue = events.reduce((s, e) => s + (e.revenue || 0), 0);
  const totalSold = events.reduce((s, e) => s + (e.ticketsSold || 0), 0);

  return (
    <DashLayout activeTab={tab}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 300 }}>
          {tab === 'Overview' ? <>Good to see you, <em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>{user?.name.split(' ')[0]}</em></> : tab}
        </h2>
      </motion.div>

      {/* ─── OVERVIEW ──────────────────────────────── */}
      {tab === 'Overview' && (
        <div>
          <div className="grid-4" style={{ marginBottom: 40 }}>
            {[
              { v: events.length, l: 'Total Events', i: '📋', c: 'var(--blue)' },
              { v: totalSold, l: 'Tickets Sold', i: '🎫', c: 'var(--gold)' },
              { v: formatCurrency(totalRevenue), l: 'Revenue', i: '💰', c: 'var(--green)' },
              { v: requests.filter(r => r.status === 'pending').length, l: 'Pending Sponsors', i: '🤝', c: 'var(--orange)' },
            ].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="stat-card" style={{ borderLeft: `3px solid ${s.c}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-number" style={{ color: s.c }}>{s.v}</div><div className="stat-label">{s.l}</div></div>
                  <div style={{ fontSize: '1.6rem' }}>{s.i}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent events */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.15rem' }}>Your Events</h3>
            <button className="btn btn-gold btn-sm" onClick={() => setShowCreateModal(true)}>+ Create Event</button>
          </div>

          {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : events.slice(0, 4).map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', marginBottom: 10 }}>
              <img src={ev.image} alt={ev.title} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{ev.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {ev.venue} · {new Date(ev.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <span className={`badge ${ev.status === 'approved' ? 'badge-green' : ev.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>{ev.status}</span>
              <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{ev.ticketsSold} sold</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── MY EVENTS ────────────────────────────── */}
      {isEventsTab && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3>All Events ({events.length})</h3>
            <button className="btn btn-gold btn-sm" onClick={() => setShowCreateModal(true)}>+ New Event</button>
          </div>
          {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 8 }}>No events yet</div>
              <button className="btn btn-gold" style={{ marginTop: 12 }} onClick={() => setShowCreateModal(true)}>Create your first event</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {events.map((ev, i) => (
                <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img src={ev.image} alt={ev.title} style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{ev.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {ev.venue} · {new Date(ev.date).toLocaleDateString()} · <strong style={{ color: 'var(--gold)' }}>${ev.price}</strong>
                    </div>
                  </div>
                  <span className={`badge ${ev.status === 'approved' ? 'badge-green' : ev.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>{ev.status}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingEvent(ev); setShowEditModal(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)}>Delete</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── CREATE EVENT ─────────────────────────── */}
      {isCreateTab && (
        <div style={{ maxWidth: 700 }}>
          <h3 style={{ marginBottom: 24 }}>Create New Event</h3>
          <div className="card" style={{ padding: '36px' }}>
            <EventForm onSave={handleCreate} onCancel={() => {}} loading={savingEvent} />
          </div>
        </div>
      )}

      {/* ─── SPONSOR REQUESTS ─────────────────────── */}
      {isSponsorsTab && (
        <div>
          <h3 style={{ marginBottom: 24 }}>Sponsor Requests ({requests.length})</h3>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤝</div>
              <div>No sponsor requests yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map((req, i) => (
                <motion.div key={req.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{req.sponsorCompany}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                        For: <strong>{req.eventTitle}</strong>
                      </div>
                      {req.message && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 400 }}>"{req.message}"</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--green)' }}>
                          {formatCurrency(req.amount)}
                        </div>
                        <span className={`badge ${req.status === 'accepted' ? 'badge-green' : req.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>
                          {req.status}
                        </span>
                      </div>
                      {req.status === 'pending' && (
                        <button className="btn btn-outline btn-sm" onClick={() => { setSelectedRequest(req); setRespondModal(true); }}>
                          Respond
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── ANALYTICS ───────────────────────────── */}
      {isAnalyticsTab && (
        <div>
          <h3 style={{ marginBottom: 24 }}>Event Analytics</h3>
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {events.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 12 }}>{ev.title}</div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <div className="stat-number" style={{ fontSize: '1.8rem', color: 'var(--gold)' }}>{ev.ticketsSold}</div>
                    <div className="stat-label">Tickets Sold</div>
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: '1.8rem', color: 'var(--green)' }}>₹{ev.revenue || 0}</div>
                    <div className="stat-label">Revenue</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Capacity: {ev.ticketsSold}/{50} ({Math.round((ev.ticketsSold / 50) * 100)}%)
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 100, height: 6, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((ev.ticketsSold / 50) * 100, 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      style={{ height: '100%', background: 'var(--gold)', borderRadius: 100 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── POSTER GENERATOR ──────────────────────── */}
      {isPosterTab && <PosterGenerator events={events} />}

      {/* Modals */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Event" maxWidth={680}>
        <EventForm onSave={handleCreate} onCancel={() => setShowCreateModal(false)} loading={savingEvent} />
      </Modal>

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Event" maxWidth={680}>
        {editingEvent && (
          <EventForm
            initial={{ ...editingEvent, tags: Array.isArray(editingEvent.tags) ? editingEvent.tags.join(', ') : (editingEvent.tags || ''), date: editingEvent.date?.substring(0, 16), endDate: editingEvent.endDate?.substring(0, 16) }}
            onSave={handleEdit}
            onCancel={() => setShowEditModal(false)}
            loading={savingEvent}
          />
        )}
      </Modal>

      <Modal open={respondModal} onClose={() => setRespondModal(false)} title="Respond to Sponsor Request" maxWidth={480}>
        {selectedRequest && (
          <div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>From</div>
              <div style={{ fontWeight: 600 }}>{selectedRequest.sponsorCompany}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Offering {formatCurrency(selectedRequest.amount)}</div>
              {selectedRequest.message && (
                <div style={{ marginTop: 8, fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  "{selectedRequest.message}"
                </div>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Response Note (optional)</label>
              <textarea className="form-input" rows={3} value={respondNote} onChange={e => setRespondNote(e.target.value)} placeholder="Add a note for the sponsor..." />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleRespond('rejected')}>
                ✕ Decline
              </button>
              <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleRespond('accepted')}>
                ✓ Accept
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashLayout>
  );
}