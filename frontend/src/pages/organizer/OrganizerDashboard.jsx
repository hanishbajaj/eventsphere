// pages/organizer/OrganizerDashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import DashLayout from '../../components/DashLayout';
import Modal from '../../components/Modal';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FieldError from '../../components/FieldError';
import { validateText, validateAmount, validateDate, validateUrl, validateDescription, numericInputProps } from '../../utils/validation';
import { formatCurrency } from '../../utils/currency';

const CATEGORIES = ['Concert / Music', 'Sports', 'Conference', 'Workshop', 'Theater', 'Festival', 'Webinar', 'Charity Gala', 'Other'];

function EventForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || {
    title: '', category: 'Conference', customCategoryName: '', seatType: '', date: '', endDate: '',
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
    if (form.category === 'Other') {
      if (!form.customCategoryName || form.customCategoryName.trim().length === 0) {
        errs.customCategoryName = 'Custom category name is required';
      } else if (form.customCategoryName.length > 50) {
        errs.customCategoryName = 'Maximum 50 characters allowed';
      }

      if (!form.seatType) {
        errs.seatType = 'Seat selection type is required';
      }
    }
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
          <select required className="form-input" value={form.category} onChange={e => {
            set('category', e.target.value);
            if (e.target.value !== 'Other') {
              set('customCategoryName', '');
              set('seatType', '');
            }
          }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <AnimatePresence>
          {form.category === 'Other' && (
            <motion.div
              initial={{ opacity: 0, height: 0, scaleY: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
              exit={{ opacity: 0, height: 0, scaleY: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, overflow: 'hidden' }}
            >
              <div className="form-group">
                <label className="form-label">Custom Category Name *</label>
                <input
                  className={`form-input ${errors.customCategoryName ? 'error' : ''}`}
                  value={form.customCategoryName}
                  onChange={e => set('customCategoryName', e.target.value)}
                  placeholder="e.g. Hackathon"
                  maxLength={50}
                />
                <FieldError error={errors.customCategoryName} />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Use this option if your category is not listed
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Seat Selection Type *</label>
                <select className={`form-input ${errors.seatType ? 'error' : ''}`} value={form.seatType} onChange={e => set('seatType', e.target.value)}>
                  <option value="" disabled>Select seat type...</option>
                  <option value="pit_system">Pit System (Standing zones)</option>
                  <option value="seat_selection_system">Seat Selection System (Specific seats)</option>
                  <option value="normal_booking">Normal Booking (No seats allocation)</option>
                </select>
                <FieldError error={errors.seatType} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

  // New States for Enhancements
  const [bgImage, setBgImage] = useState(null);
  const [bgOverlay, setBgOverlay] = useState(50);
  const [logos, setLogos] = useState([]);
  const [logoPosition, setLogoPosition] = useState('bottom');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [downloadQuality, setDownloadQuality] = useState('high');
  const [isDownloading, setIsDownloading] = useState(false);

  const toast = useToast();

  const set = (k, v) => setPosterData(p => ({ ...p, [k]: v }));

  // Background upload via FileReader
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('Background image must be less than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setBgImage(event.target.result);
    reader.onerror = () => toast('File upload failed. Please try again.', 'error');
    reader.readAsDataURL(file);
  };

  // Multiple logo uploads
  const handleLogoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (logos.length + files.length > 5) {
      toast('Maximum 5 sponsor logos allowed', 'error');
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogos(prev => [...prev, { id: Date.now() + Math.random(), dataUrl: event.target.result }]);
      };
      reader.onerror = () => toast('File upload failed. Please try again.', 'error');
      reader.readAsDataURL(file);
    });
  };

  const removeLogo = (id) => setLogos(logos.filter(l => l.id !== id));

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
      if (ev.image) setBgImage(ev.image);
    }
  };

  const handleGenerate = () => setGenerated(true);

  // New Download flow with html2canvas and jspdf
  const handleDownload = async () => {
    const el = canvasRef.current;
    if (!el) return;
    
    setIsDownloading(true);
    try {
      let scale = 2; // high definition
      if (downloadQuality === 'standard') scale = 1;
      if (downloadQuality === 'print') scale = 4;
      
      const canvas = await html2canvas(el, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0a0a',
        logging: false
      });
      
      const fileNameBase = `${(posterData.title || 'EventName').replace(/\s+/g, '_')}_Poster_${downloadFormat.toUpperCase()}`;
      
      if (downloadFormat === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        // Calculate orientation
        const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileNameBase}.pdf`);
      } else {
        const mimeType = downloadFormat === 'png' ? 'image/png' : 'image/jpeg';
        const imgData = canvas.toDataURL(mimeType, downloadFormat === 'png' ? undefined : 0.95);
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `${fileNameBase}.${downloadFormat}`;
        a.click();
      }
      toast('Poster downloaded successfully', 'success');
    } catch (err) {
      console.error(err);
      toast('Rendering failed. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const currentStyle = POSTER_STYLES.find(s => s.id === posterData.style) || POSTER_STYLES[0];

  let logoPosStyle = { display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', zIndex: 10, position: 'absolute' };
  switch (logoPosition) {
    case 'top': logoPosStyle = { ...logoPosStyle, top: '40px', left: 0, right: 0, justifyContent: 'center' }; break;
    case 'bottom-left': logoPosStyle = { ...logoPosStyle, bottom: '60px', left: '32px', justifyContent: 'flex-start' }; break;
    case 'bottom-right': logoPosStyle = { ...logoPosStyle, bottom: '60px', right: '32px', justifyContent: 'flex-end' }; break;
    case 'bottom': 
    default: logoPosStyle = { ...logoPosStyle, bottom: '60px', left: 0, right: 0, justifyContent: 'center' }; break;
  }

  // Handle preview background logic
  let wrapperStyle = { position: 'relative', width: '100%', height: '100%', overflow: 'hidden' };
  if (bgImage) {
    wrapperStyle.backgroundImage = `url(${bgImage})`;
    wrapperStyle.backgroundSize = 'cover';
    wrapperStyle.backgroundPosition = 'center';
  } else {
    if (posterData.style === 'concert') wrapperStyle.background = 'linear-gradient(135deg, #1a0a2e, #2d1b69, #1a0a2e)';
    else if (posterData.style === 'conference') wrapperStyle.background = 'linear-gradient(135deg, #0a1628, #1b2d50, #0a1628)';
    else if (posterData.style === 'festival') wrapperStyle.background = 'linear-gradient(135deg, #2e0a1a, #692d1b, #2e0a1a)';
    else wrapperStyle.background = 'linear-gradient(135deg, #0f0f0f, #1a1a1a, #0f0f0f)';
  }

  return (
    <div>
      <h3 style={{ marginBottom: 24 }}>Poster Generator</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(380px, 1fr)', gap: 32, alignItems: 'start' }}>
        {/* Left Column: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Section 1: Event Details */}
          <div className="card" style={{ padding: '28px' }}>
            <h4 style={{ marginBottom: 16, fontSize: '1.05rem', color: 'var(--gold)' }}>1. Event Details</h4>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Event Date</label>
                  <input className="form-input" value={posterData.date} onChange={e => set('date', e.target.value)} placeholder="e.g. Saturday, March 15" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location</label>
                  <input className="form-input" value={posterData.location} onChange={e => set('location', e.target.value)} placeholder="Venue name" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={posterData.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Background Image */}
          <div className="card" style={{ padding: '28px' }}>
            <h4 style={{ marginBottom: 16, fontSize: '1.05rem', color: 'var(--gold)' }}>2. Background Image</h4>
            <div className="form-group">
              {!bgImage ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', cursor: 'pointer', position: 'relative', textAlign: 'center' }}>
                  <input type="file" accept="image/jpeg, image/png, image/webp" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={handleBgUpload} />
                  <div style={{ fontSize: '2.5rem', marginBottom: 8, color: 'var(--text-muted)' }}>🖼️</div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>Upload Custom Background</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Drag & drop image here or click to upload<br/>(max 5MB, min 1280x720 recommended)</div>
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-elevated)', padding: 12 }}>
                  <img src={bgImage} alt="Background Preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <label className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center', margin: 0, cursor: 'pointer' }}>
                      <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleBgUpload} />
                      Replace
                    </label>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setBgImage(null)}>Remove</button>
                  </div>
                </div>
              )}
            </div>
            {bgImage && (
              <div className="form-group" style={{ marginTop: 20 }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dark Overlay Opacity</span>
                  <span>{bgOverlay}%</span>
                </label>
                <input type="range" min="0" max="100" value={bgOverlay} onChange={e => setBgOverlay(e.target.value)} style={{ width: '100%', accentColor: 'var(--gold)' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Auto-darkens image so text stays readable.</div>
              </div>
            )}
          </div>

          {/* Section 3: Sponsor Logos */}
          <div className="card" style={{ padding: '28px' }}>
            <h4 style={{ marginBottom: 16, fontSize: '1.05rem', color: 'var(--gold)' }}>3. Sponsor Logos</h4>
            
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className={`btn btn-outline ${logos.length >= 5 ? 'disabled' : ''}`} style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: 0, cursor: logos.length >= 5 ? 'not-allowed' : 'pointer', opacity: logos.length >= 5 ? 0.5 : 1 }}>
                <input type="file" accept="image/jpeg, image/png, image/svg+xml" multiple style={{ display: 'none' }} onChange={handleLogoUpload} disabled={logos.length >= 5} />
                + Upload Sponsor Logos ({logos.length}/5)
              </label>
            </div>
            
            {logos.length > 0 && (
              <>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                  {logos.map(logo => (
                    <div key={logo.id} style={{ position: 'relative', width: 68, height: 68, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                      <img src={logo.dataUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      <button 
                        onClick={() => removeLogo(logo.id)}
                        style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Sponsor Logo Position</label>
                  <select className="form-input" value={logoPosition} onChange={e => setLogoPosition(e.target.value)}>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom Center</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Section 4: Export Options */}
          <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
             <h4 style={{ marginBottom: 0, fontSize: '1.05rem', color: 'var(--gold)' }}>4. Download Options</h4>
             
             {!generated ? (
               <motion.button
                 className="btn btn-gold"
                 style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.05rem' }}
                 onClick={handleGenerate}
                 whileHover={{ boxShadow: '0 0 30px rgba(201,168,76,0.4)' }}
                 whileTap={{ scale: 0.97 }}
               >
                 Review & Generate
               </motion.button>
             ) : (
               <>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                   <div className="form-group" style={{ marginBottom: 0 }}>
                     <label className="form-label">Select Format</label>
                     <select className="form-input" value={downloadFormat} onChange={e => setDownloadFormat(e.target.value)}>
                       <option value="png">PNG Image</option>
                       <option value="jpg">JPG Image</option>
                       <option value="pdf">PDF Document</option>
                     </select>
                   </div>
                   <div className="form-group" style={{ marginBottom: 0 }}>
                     <label className="form-label">Select Quality</label>
                     <select className="form-input" value={downloadQuality} onChange={e => setDownloadQuality(e.target.value)}>
                       <option value="standard">Standard (1x)</option>
                       <option value="high">High Definition (2x)</option>
                       <option value="print">Print Quality (4x)</option>
                     </select>
                   </div>
                 </div>
                 <div style={{ display: 'flex', gap: 12 }}>
                   <motion.button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setGenerated(false)}>
                     Back to Edit
                   </motion.button>
                   <motion.button
                     className="btn btn-gold"
                     style={{ flex: 2, justifyContent: 'center' }}
                     onClick={handleDownload}
                     disabled={isDownloading}
                     whileHover={{ boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}
                     whileTap={{ scale: 0.97 }}
                   >
                     {isDownloading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Rendering & Exporting...</> : 'Download Poster'}
                   </motion.button>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Live Preview
            </div>
            {generated && <div className="badge badge-green" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>Ready to Download</div>}
          </div>
          
          <div style={{ background: 'var(--nav-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={posterData.style + (generated ? '-gen' : '') + (bgImage ? '-bg' : '')}
                ref={canvasRef}
                className={`poster-preview ${currentStyle.className}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                style={wrapperStyle}
              >
                {/* Background Overlay */}
                {bgImage && (
                  <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: bgOverlay / 100, zIndex: 1, pointerEvents: 'none' }} />
                )}
                
                {/* Render decorations only if we don't have a custom background image (to not clutter it) */}
                {!bgImage && <PosterDecorations style={posterData.style} />}
                
                {/* Main Text Content */}
                <div style={{ position: 'relative', zIndex: 5, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="poster-title" style={{ textShadow: bgImage ? '0 4px 16px rgba(0,0,0,0.9)' : 'none' }}>
                    {posterData.title || 'EVENT NAME'}
                  </div>
                  <div className="poster-date" style={{ textShadow: bgImage ? '0 2px 8px rgba(0,0,0,0.9)' : 'none' }}>
                    {posterData.date || 'DATE'}
                  </div>
                  <div className="poster-location" style={{ textShadow: bgImage ? '0 2px 8px rgba(0,0,0,0.9)' : 'none' }}>
                    {posterData.location || 'LOCATION'}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 16px',
                    borderRadius: '30px',
                    border: bgImage ? '1px solid rgba(201,168,76,0.6)' : '1px solid #c9a84c',
                    background: bgImage ? 'rgba(0,0,0,0.65)' : 'transparent',
                    marginTop: '8px'
                  }}>
                    <span style={{ 
                      color: '#c9a84c', 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      letterSpacing: '1.5px', 
                      textTransform: 'uppercase',
                      lineHeight: '1'
                    }}>
                      {posterData.category}
                    </span>
                  </div>
                </div>
                
                {/* Render Sponsor Logos */}
                {logos.length > 0 && (
                  <div style={logoPosStyle}>
                    {logos.map(logo => (
                      <img key={logo.id} src={logo.dataUrl} alt="Sponsor Logo" style={{ maxWidth: '90px', maxHeight: '60px', objectFit: 'contain', filter: bgImage ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' : 'none' }} />
                    ))}
                  </div>
                )}
                
                {/* Brand watermark */}
                <div className="poster-brand" style={{ zIndex: 5, textShadow: bgImage ? '0 2px 4px rgba(0,0,0,0.9)' : 'none', bottom: '24px' }}>
                  EVENTSPHERE
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
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