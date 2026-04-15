// components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MoonIcon = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>);
const SunIcon  = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>);
const BellIcon = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>);

const ROLE_DASHBOARD = {
  buyer: '/dashboard/buyer',
  organizer: '/dashboard/organizer',
  sponsor: '/dashboard/sponsor',
  admin: '/dashboard/admin',
};

/* ─── Notification System ──────────────────────── */
function getNotifications(tickets) {
  if (!tickets?.length) return [];
  const now = new Date();
  const notifications = [];
  tickets.forEach(t => {
    const eventDate = new Date(t.eventDate);
    const diffHours = (eventDate - now) / (1000 * 60 * 60);
    if (diffHours > 0 && diffHours <= 36) notifications.push({ id: `reminder-${t.id}`, type: 'reminder', title: 'Event Tomorrow', body: `"${t.eventTitle}" starts tomorrow at ${eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}.`, time: 'Upcoming', ticketId: t.id, icon: '🔔' });
    if (diffHours > 0 && diffHours <= 12)  notifications.push({ id: `today-${t.id}`, type: 'today', title: 'Event Today!', body: `"${t.eventTitle}" starts at ${eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}. Get ready!`, time: 'Today', ticketId: t.id, icon: '🎉' });
  });
  const recentTickets = tickets.filter(t => (now - new Date(t.createdAt)) < 24 * 60 * 60 * 1000);
  recentTickets.forEach(t => notifications.push({ id: `booked-${t.id}`, type: 'booked', title: 'Booking Confirmed', body: `Your ticket for "${t.eventTitle}" has been confirmed.`, time: 'Recently', ticketId: t.id, icon: '✅' }));
  if (notifications.length === 0) notifications.push({ id: 'welcome', type: 'info', title: 'Welcome Back!', body: 'Browse events and book tickets to receive reminders here.', time: 'Now', icon: '👋' });
  return notifications;
}

function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellAnimate, setBellAnimate] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'buyer') return;
    const token = localStorage.getItem('es_token');
    if (!token) return;
    fetch('/api/tickets/my', { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const notifs = getNotifications(data);
        setNotifications(notifs);
        if (notifs.some(n => n.type === 'reminder' || n.type === 'today')) {
          setBellAnimate(true);
          setTimeout(() => setBellAnimate(false), 800);
        }
      }).catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const hasUrgent = notifications.some(n => n.type === 'reminder' || n.type === 'today');

  return (
    <div className="notif-bell-wrap" ref={panelRef}>
      <button className={`notif-bell ${bellAnimate ? 'bell-animate' : ''}`} onClick={() => setOpen(o => !o)}>
        <BellIcon />
        {hasUrgent && <span className="notif-dot" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="notif-panel" initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }}>
            <div className="notif-panel-header"><span>🔔</span> Notifications<span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{notifications.length}</span></div>
            {notifications.map((notif, i) => (
              <motion.div key={notif.id} className="notif-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => { if (notif.ticketId) { navigate(`/ticket/${notif.ticketId}`); setOpen(false); } }}>
                <div className="notif-title"><span>{notif.icon}</span><span>{notif.title}</span></div>
                <div className="notif-body">{notif.body}</div>
                <div className="notif-time">{notif.time}</div>
                {notif.ticketId && (<div className="notif-action"><button className="btn btn-outline btn-sm" style={{ padding: '4px 12px', fontSize: '0.7rem' }}>View Ticket</button></div>)}
              </motion.div>
            ))}
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
  const [scrolled, setScrolled] = useState(false);
  
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 20));

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); setMobileOpen(false); };
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <motion.nav 
        className="nav"
        animate={{
          background: scrolled ? 'var(--bg-nav)' : 'transparent',
          backdropFilter: scrolled ? 'var(--backdrop-blur-lg)' : 'blur(0px)',
          borderColor: scrolled ? 'var(--border-light)' : 'transparent',
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'sticky', top: 0, zIndex: 100, borderBottomWidth: 1, borderBottomStyle: 'solid'
        }}
      >
        <motion.div 
          className="container nav-inner"
          animate={{ height: scrolled ? 68 : 84 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo_transparent (1).png" alt="EventSphere" style={{ height: 60, width: 'auto' }} />
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            {!user && (
              <>
                <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>Explore</Link>
                <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Sign In</Link>
                <Link to="/register"><button className="btn btn-gold btn-sm">Get Started</button></Link>
              </>
            )}
            {user && (
              <>
                <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>Explore</Link>
                <Link to={ROLE_DASHBOARD[user.role]} className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                <NotificationBell user={user} />
                {/* Avatar dropdown */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setDropOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 100, padding: '4px 12px 4px 4px', cursor: 'pointer', transition: 'all var(--transition)' }}>
                    <img src={user.avatar} alt={user.name} style={{ width: 30, height: 30, borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 180, boxShadow: 'var(--shadow-md)', zIndex: 200 }}
                        onMouseLeave={() => setDropOpen(false)}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user.role}</div>
                          <div style={{ fontWeight: 500, marginTop: 2 }}>{user.name}</div>
                        </div>
                        <Link to={ROLE_DASHBOARD[user.role]} onClick={() => setDropOpen(false)}>
                          <div style={{ padding: '10px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Dashboard</div>
                        </Link>
                        <div onClick={handleLogout} style={{ padding: '10px 16px', fontSize: '0.875rem', color: 'var(--red)', cursor: 'pointer' }}>Sign Out</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
            {/* Theme toggle */}
            <motion.button onClick={toggle} whileTap={{ scale: 0.9, rotate: 15 }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
              whileHover={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
              <motion.div key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </motion.div>
            </motion.button>
          </div>

          {/* Mobile right side: theme + bell + hamburger */}
          <div className="mobile-nav-right">
            {user && <NotificationBell user={user} />}
            <motion.button onClick={toggle} whileTap={{ scale: 0.9 }}
              style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </motion.button>
            <button className="hamburger-btn" onClick={() => setMobileOpen(o => !o)}
              style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}>
              {mobileOpen
                ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* ── Mobile Menu Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 48, backdropFilter: 'blur(4px)' }} />

            {/* Drawer */}
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '78vw', maxWidth: 320, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', zIndex: 49, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

              {/* Drawer header */}
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <img src="/logo_transparent (1).png" alt="EventSphere" style={{ height: 44, width: 'auto' }} />
                </Link>
                <button onClick={() => setMobileOpen(false)}
                  style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* User info if logged in */}
              {user && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={user.avatar} alt={user.name} style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid var(--gold)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user.role}</div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <div style={{ flex: 1, padding: '12px 0' }}>
                {[
                  { to: '/', label: '🏠 Home' },
                  { to: '/events', label: '🎟 Explore Events' },
                  ...(user ? [{ to: ROLE_DASHBOARD[user.role], label: '📊 Dashboard' }] : [
                    { to: '/login', label: '🔑 Sign In' },
                    { to: '/register', label: '✨ Get Started' },
                  ]),
                ].map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                    <div style={{
                      padding: '13px 20px', fontSize: '0.95rem', fontWeight: 500,
                      color: isActive(to) ? 'var(--gold)' : 'var(--text-primary)',
                      background: isActive(to) ? 'var(--gold-glow)' : 'transparent',
                      borderLeft: `3px solid ${isActive(to) ? 'var(--gold)' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}>
                      {label}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              {user && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={handleLogout} className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'center', color: 'var(--red)' }}>
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}