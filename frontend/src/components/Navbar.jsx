// components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MoonIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const XIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const ROLE_DASHBOARD = {
  buyer: '/dashboard/buyer',
  organizer: '/dashboard/organizer',
  sponsor: '/dashboard/sponsor',
  admin: '/dashboard/admin',
};

/* ─── Notification System ──────────────────────── */
function getNotifications(tickets) {
  if (!tickets || !tickets.length) return [];
  const now = new Date();
  const notifications = [];

  tickets.forEach(t => {
    const eventDate = new Date(t.eventDate);
    const diffMs = eventDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    // Tomorrow reminder (within 12-36 hours)
    if (diffHours > 0 && diffHours <= 36) {
      notifications.push({
        id: `reminder-${t.id}`,
        type: 'reminder',
        title: 'Event Tomorrow',
        body: `Your event "${t.eventTitle}" starts tomorrow at ${eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}.`,
        time: 'Upcoming',
        ticketId: t.id,
        icon: '🔔',
      });
    }
    // Today reminder
    if (diffHours > 0 && diffHours <= 12) {
      notifications.push({
        id: `today-${t.id}`,
        type: 'today',
        title: 'Event Today!',
        body: `"${t.eventTitle}" starts at ${eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}. Get ready!`,
        time: 'Today',
        ticketId: t.id,
        icon: '🎉',
      });
    }
  });

  // Add a confirmation for recent purchases
  const recentTickets = tickets.filter(t => {
    const created = new Date(t.createdAt);
    return (now - created) < 24 * 60 * 60 * 1000;
  });
  recentTickets.forEach(t => {
    notifications.push({
      id: `booked-${t.id}`,
      type: 'booked',
      title: 'Booking Confirmed',
      body: `Your ticket for "${t.eventTitle}" has been confirmed.`,
      time: 'Recently',
      ticketId: t.id,
      icon: '✅',
    });
  });

  // If no dynamic notifications, show a welcome one
  if (notifications.length === 0) {
    notifications.push({
      id: 'welcome',
      type: 'info',
      title: 'Welcome Back!',
      body: 'Browse events and book tickets to receive reminders here.',
      time: 'Now',
      icon: '👋',
    });
  }

  return notifications;
}

function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellAnimate, setBellAnimate] = useState(false);
  const [tickets, setTickets] = useState([]);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'buyer') return;
    // Fetch tickets for notification logic
    const token = localStorage.getItem('es_token');
    if (!token) return;
    fetch('/api/tickets/my', { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setTickets(data);
        const notifs = getNotifications(data);
        setNotifications(notifs);
        if (notifs.some(n => n.type === 'reminder' || n.type === 'today')) {
          setBellAnimate(true);
          setTimeout(() => setBellAnimate(false), 800);
        }
      })
      .catch(() => {});
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const hasUrgent = notifications.some(n => n.type === 'reminder' || n.type === 'today');

  return (
    <div className="notif-bell-wrap" ref={panelRef}>
      <button
        className={`notif-bell ${bellAnimate ? 'bell-animate' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <BellIcon />
        {hasUrgent && <span className="notif-dot" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-panel"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="notif-panel-header">
              <span>🔔</span> Notifications
              <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {notifications.length}
              </span>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  className="notif-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    if (notif.ticketId) {
                      navigate(`/ticket/${notif.ticketId}`);
                      setOpen(false);
                    }
                  }}
                >
                  <div className="notif-title">
                    <span>{notif.icon}</span>
                    <span>{notif.title}</span>
                  </div>
                  <div className="notif-body">{notif.body}</div>
                  <div className="notif-time">{notif.time}</div>
                  {notif.ticketId && (
                    <div className="notif-action">
                      <button className="btn btn-outline btn-sm" style={{ padding: '4px 12px', fontSize: '0.7rem' }}>
                        View Ticket
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="nav">
      <div className="container nav-inner">
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/cropped_circle_image.png" alt="EventSphere" style={{ height: 80, width: 'auto' }} />
        </Link>

        {/* Desktop links */}
        <div className="nav-links" style={{ display: 'flex' }}>
          {!user && (
            <>
              <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>Explore</Link>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Sign In</Link>
              <Link to="/register">
                <button className="btn btn-gold btn-sm">Get Started</button>
              </Link>
            </>
          )}
          {user && (
            <>
              <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>Explore</Link>
              <Link to={ROLE_DASHBOARD[user.role]} className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>

              {/* Notification Bell */}
              <NotificationBell user={user} />

              {/* Avatar dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 100, padding: '4px 12px 4px 4px', cursor: 'pointer',
                    transition: 'all var(--transition)'
                  }}
                >
                  <img src={user.avatar} alt={user.name} style={{ width: 30, height: 30, borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', right: 0, top: '110%',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)',
                        borderRadius: 'var(--radius-md)', overflow: 'hidden',
                        minWidth: 180, boxShadow: 'var(--shadow-md)', zIndex: 200
                      }}
                      onMouseLeave={() => setDropOpen(false)}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user.role}</div>
                        <div style={{ fontWeight: 500, marginTop: 2 }}>{user.name}</div>
                      </div>
                      <Link to={ROLE_DASHBOARD[user.role]} onClick={() => setDropOpen(false)}>
                        <div style={{ padding: '10px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all var(--transition)' }}
                          onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                          onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                        >Dashboard</div>
                      </Link>
                      <div
                        onClick={handleLogout}
                        style={{ padding: '10px 16px', fontSize: '0.875rem', color: 'var(--red)', cursor: 'pointer' }}
                      >Sign Out</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
          {/* Theme toggle */}
          <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.9, rotate: 15 }}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all var(--transition)'
            }}
            whileHover={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </motion.div>
          </motion.button>

          {/* Mobile menu btn */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', '@media(max-width:640px)': { display: 'flex' } }}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}
