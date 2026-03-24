// pages/TicketPage.jsx — Premium Digital Ticket Card
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/currency';

export default function TicketPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTicket(id)
      .then(setTicket)
      .catch(() => setError('Ticket not found or invalid'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="ticket-page-wrapper">
      <div className="spinner" />
    </div>
  );

  if (error || !ticket) return (
    <div className="ticket-page-wrapper">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: 24 }}
      >
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>❌</div>
        <h2 style={{ marginBottom: 8, fontFamily: 'var(--font-display)' }}>Invalid Ticket</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error}</p>
        <Link to="/" className="btn btn-gold">Go Home</Link>
      </motion.div>
    </div>
  );

  const isValid = ticket.status === 'active';
  const eventDate = new Date(ticket.eventDate);
  const isPast = eventDate < new Date();
  const statusLabel = isValid && !isPast ? 'Valid Ticket' : isPast ? 'Expired Ticket' : 'Used Ticket';
  const statusType = isValid && !isPast ? 'valid' : 'invalid';

  const seatDisplay = ticket.row
    ? `${ticket.row}${ticket.number}`
    : ticket.zone || '—';

  const formatDate = (d) => d.toLocaleDateString('en', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const formatTime = (d) => d.toLocaleTimeString('en', {
    hour: '2-digit', minute: '2-digit'
  });

  const handleDownload = () => {
    if (ticket.pdfUrl) {
      const a = document.createElement('a');
      a.href = ticket.pdfUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } else {
      window.print();
    }
  };

  const handleAddToCalendar = () => {
    const start = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);
    const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ticket.eventTitle)}&dates=${start}/${end}&location=${encodeURIComponent(ticket.eventVenue)}&details=${encodeURIComponent(`Ticket ID: ${ticket.id}\nSeat: ${seatDisplay}`)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="ticket-page-wrapper">
      {/* Background glow decoration */}
      <div className="ticket-bg-glow" />

      <motion.div
        className="ticket-card-container"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, duration: 0.6 }}
      >
        {/* Status Badge */}
        <motion.div
          className={`ticket-status-badge ticket-status-${statusType}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {statusType === 'valid' ? '✅' : '❌'} {statusLabel}
        </motion.div>

        {/* Main Ticket Card */}
        <motion.div
          className="ticket-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Event Banner / Poster */}
          {ticket.eventImage && (
            <div className="ticket-banner">
              <img src={ticket.eventImage} alt={ticket.eventTitle} className="ticket-banner-img" />
              <div className="ticket-banner-overlay">
                <div className="ticket-brand">
                  <span className="ticket-brand-gold">Event</span><span>Sphere</span>
                </div>
                <div className="ticket-banner-label">DIGITAL TICKET</div>
              </div>
              {ticket.eventCategory && (
                <div className="ticket-category-badge">{ticket.eventCategory}</div>
              )}
            </div>
          )}

          {/* If no image, show a styled header instead */}
          {!ticket.eventImage && (
            <div className="ticket-header-no-img">
              <div className="ticket-brand">
                <span className="ticket-brand-gold">Event</span><span>Sphere</span>
              </div>
              <div className="ticket-banner-label">DIGITAL TICKET</div>
            </div>
          )}

          {/* Event Title Section */}
          <div className="ticket-title-section">
            <h1 className="ticket-event-name">{ticket.eventTitle}</h1>
            <div className="ticket-event-datetime">
              <span>{formatDate(eventDate)}</span>
              <span className="ticket-time-dot" />
              <span>{formatTime(eventDate)}</span>
            </div>
          </div>

          {/* Dashed Divider with cutouts */}
          <div className="ticket-divider">
            <div className="ticket-divider-cutout ticket-divider-cutout-left" />
            <div className="ticket-divider-line" />
            <div className="ticket-divider-cutout ticket-divider-cutout-right" />
          </div>

          {/* Ticket Details Grid */}
          <div className="ticket-details-section">
            <div className="ticket-detail-grid">
              <motion.div
                className="ticket-detail-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="ticket-detail-label">Ticket Holder</span>
                <span className="ticket-detail-value">{ticket.buyerName}</span>
              </motion.div>

              <motion.div
                className="ticket-detail-item"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <span className="ticket-detail-label">Location</span>
                <span className="ticket-detail-value">{ticket.eventVenue}</span>
              </motion.div>

              <motion.div
                className="ticket-detail-item ticket-detail-highlight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="ticket-detail-label">Seat</span>
                <span className="ticket-detail-value ticket-detail-gold">{seatDisplay}</span>
              </motion.div>

              <motion.div
                className="ticket-detail-item ticket-detail-highlight"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <span className="ticket-detail-label">Ticket ID</span>
                <span className="ticket-detail-value ticket-detail-gold ticket-id-mono">
                  {ticket.id.substring(0, 8).toUpperCase()}
                </span>
              </motion.div>

              {ticket.quantity > 1 && (
                <motion.div
                  className="ticket-detail-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span className="ticket-detail-label">Quantity</span>
                  <span className="ticket-detail-value">{ticket.quantity}</span>
                </motion.div>
              )}

              <motion.div
                className="ticket-detail-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <span className="ticket-detail-label">Total Paid</span>
                <span className="ticket-detail-value">{formatCurrency(ticket.price)}</span>
              </motion.div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="ticket-qr-section">
            <motion.div
              className="ticket-qr-wrapper"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.7, duration: 0.6, type: 'spring' }}
            >
              <div className="ticket-qr-glow" />
              <div className="ticket-qr-inner">
                <QRCodeSVG
                  value={ticket.pdfUrl || `${window.location.origin}/ticket/${ticket.id}`}
                  size={180}
                  level="H"
                  fgColor="#08080f"
                  bgColor="#ffffff"
                />
              </div>
            </motion.div>
            <div className="ticket-qr-id">{ticket.id.toUpperCase()}</div>
            <div className="ticket-qr-help">
              {ticket.pdfUrl ? 'Scan to download ticket PDF' : 'Present this QR code at the venue entrance'}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="ticket-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <motion.button
            className="btn btn-gold"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
          >
            Download Ticket (PDF)
          </motion.button>
          <motion.button
            className="btn btn-outline"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCalendar}
          >
            Add to Calendar
          </motion.button>
          <Link to={`/events/${ticket.eventId}`}>
            <motion.button
              className="btn btn-outline"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              View Event
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer link */}
        <motion.div
          className="ticket-footer-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <Link to="/">← Return to EventSphere</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}