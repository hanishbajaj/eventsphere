// components/DashLayout.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const icons = {
  home: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  ticket: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>,
  calendar: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  explore: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  users: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75"/></svg>,
  chart: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  star: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  settings: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  poster: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
};

const NAV_ITEMS = {
  buyer: [
    { label: 'Overview', path: '/dashboard/buyer', icon: 'home' },
    { label: 'Explore Events', path: '/events', icon: 'explore' },
    { label: 'My Tickets', path: '/dashboard/buyer/tickets', icon: 'ticket' },
  ],
  organizer: [
    { label: 'Overview', path: '/dashboard/organizer', icon: 'home' },
    { label: 'My Events', path: '/dashboard/organizer/events', icon: 'calendar' },
    { label: 'Create Event', path: '/dashboard/organizer/create', icon: 'star' },
    { label: 'Poster Generator', path: '/dashboard/organizer/poster', icon: 'poster' },
    { label: 'Sponsor Requests', path: '/dashboard/organizer/sponsors', icon: 'users' },
    { label: 'Analytics', path: '/dashboard/organizer/analytics', icon: 'chart' },
  ],
  sponsor: [
    { label: 'Overview', path: '/dashboard/sponsor', icon: 'home' },
    { label: 'Browse Events', path: '/events', icon: 'explore' },
    { label: 'Event Calendar', path: '/dashboard/sponsor/calendar', icon: 'calendar' },
    { label: 'My Requests', path: '/dashboard/sponsor/requests', icon: 'star' },
  ],
  admin: [
    { label: 'Overview', path: '/dashboard/admin', icon: 'home' },
    { label: 'All Events', path: '/dashboard/admin/events', icon: 'calendar' },
    { label: 'Users', path: '/dashboard/admin/users', icon: 'users' },
    { label: 'Analytics', path: '/dashboard/admin/analytics', icon: 'chart' },
    { label: 'Settings', path: '/dashboard/admin/settings', icon: 'settings' },
  ],
};

const ROLE_COLORS = { buyer: '#e05c5c', organizer: '#5c8ce0', sponsor: '#4caf7d', admin: '#c9a84c' };

export default function DashLayout({ children, activeTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS[user?.role] || [];
  const roleColor = ROLE_COLORS[user?.role] || 'var(--gold)';

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        {/* User profile */}
        <motion.div
          className="sidebar-user"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ padding: '0 16px 24px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px' }}>
            <img src={user?.avatar} alt={user?.name} style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${roleColor}` }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
              <div style={{
                fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                color: roleColor, marginTop: 2
              }}>{user?.role}</div>
            </div>
          </div>
        </motion.div>

        {/* Nav items */}
        <nav>
          {items.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`sidebar-item ${activeTab === item.label ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-icon" style={{ color: activeTab === item.label ? roleColor : 'inherit' }}>
                {icons[item.icon]}
              </span>
              {item.label}
            </motion.div>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-logout" style={{ position: 'absolute', bottom: 24, left: 0, right: 0, padding: '0 16px' }}>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', color: 'var(--red)' }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}