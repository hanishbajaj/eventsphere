// pages/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashLayout from '../../components/DashLayout';
import Modal from '../../components/Modal';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ROLE_BADGE = {
  buyer: 'badge-red',
  organizer: 'badge-blue',
  sponsor: 'badge-green',
  admin: 'badge-gold',
};
const STATUS_BADGE = {
  approved: 'badge-green',
  pending: 'badge-orange',
  rejected: 'badge-red',
};

function MiniBar({ value, max, color }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 100, height: 5, overflow: 'hidden', marginTop: 6 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8 }}
        style={{ height: '100%', background: color, borderRadius: 100 }}
      />
    </div>
  );
}

export default function AdminDashboard({ tab = 'Overview' }) {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [userModal, setUserModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u, ev] = await Promise.all([
        api.getStats(),
        api.getUsers(),
        api.getAllEvents(),
      ]);
      setStats(s);
      setUsers(u);
      setEvents(ev);
    } catch {
      toast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBan = async (userId, isBanned) => {
    try {
      await api.banUser(userId);
      toast(`User ${isBanned ? 'unbanned' : 'banned'}`, 'success');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await api.deleteUser(userId);
      toast('User deleted', 'success');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleChangeRole = async () => {
    if (!newRole) return;
    try {
      await api.changeRole(editUser.id, newRole);
      toast('Role updated', 'success');
      setUserModal(false);
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleEventStatus = async (eventId, status) => {
    try {
      await api.updateEventStatus(eventId, status);
      toast(`Event ${status}`, 'success');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.deleteEvent(eventId);
      toast('Event deleted', 'success');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const filteredUsers = userFilter === 'all' ? users : users.filter(u => u.role === userFilter || (userFilter === 'banned' && u.banned));
  const filteredEvents = eventFilter === 'all' ? events : events.filter(e => e.status === eventFilter);

  if (loading) return (
    <DashLayout activeTab={tab}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" />
      </div>
    </DashLayout>
  );

  return (
    <DashLayout activeTab={tab}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 300 }}>
          {tab === 'Overview'
            ? <>Admin <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Control Center</em></>
            : tab}
        </h2>
      </motion.div>

      {/* ─── OVERVIEW ──────────────────────────────── */}
      {tab === 'Overview' && stats && (
        <div>
          {/* Stats grid */}
          <div className="grid-4" style={{ marginBottom: 32 }}>
            {[
              { v: stats.users.total, l: 'Total Users', i: '👥', c: 'var(--blue)' },
              { v: stats.events.approved, l: 'Live Events', i: '🎪', c: 'var(--green)' },
              { v: stats.tickets.total, l: 'Tickets Sold', i: '🎫', c: 'var(--gold)' },
              { v: `$${(stats.tickets.revenue || 0).toLocaleString()}`, l: 'Platform Revenue', i: '💰', c: 'var(--orange)' },
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

          <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
            {/* User breakdown */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: 20, fontSize: '1.05rem' }}>User Breakdown</h3>
              {[
                { label: 'Buyers', value: stats.users.buyers, color: 'var(--red)', total: stats.users.total },
                { label: 'Organizers', value: stats.users.organizers, color: 'var(--blue)', total: stats.users.total },
                { label: 'Sponsors', value: stats.users.sponsors, color: 'var(--green)', total: stats.users.total },
                { label: 'Admins', value: stats.users.admins, color: 'var(--gold)', total: stats.users.total },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
                  </div>
                  <MiniBar value={row.value} max={row.total} color={row.color} />
                </div>
              ))}
              {stats.users.banned > 0 && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(224,92,92,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--red)' }}>
                  ⚠ {stats.users.banned} banned account{stats.users.banned > 1 ? 's' : ''}
                </div>
              )}
            </motion.div>

            {/* Event breakdown */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
              className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: 20, fontSize: '1.05rem' }}>Event Status</h3>
              {[
                { label: 'Approved', value: stats.events.approved, color: 'var(--green)', total: stats.events.total },
                { label: 'Pending Review', value: stats.events.pending, color: 'var(--orange)', total: stats.events.total },
                { label: 'Rejected', value: stats.events.rejected, color: 'var(--red)', total: stats.events.total },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
                  </div>
                  <MiniBar value={row.value} max={row.total} color={row.color} />
                </div>
              ))}
              {stats.events.pending > 0 && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(224,154,76,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--orange)' }}>
                  📋 {stats.events.pending} event{stats.events.pending > 1 ? 's' : ''} awaiting approval
                </div>
              )}
            </motion.div>
          </div>

          {/* System logs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(stats.logs || []).slice(0, 8).map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.04 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: log.action.includes('LOGIN') ? 'var(--green)' : log.action.includes('REGISTER') ? 'var(--blue)' : 'var(--gold)'
                  }} />
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {log.action}
                  </span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── ALL EVENTS ───────────────────────────── */}
      {tab === 'All Events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h3>All Events ({events.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button key={f} className={`btn btn-sm ${eventFilter === f ? 'btn-gold' : 'btn-ghost'}`}
                  style={{ borderRadius: 100, textTransform: 'capitalize' }} onClick={() => setEventFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredEvents.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={ev.image} alt={ev.title} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {ev.category} · {ev.venue} · By {ev.organizerName}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[ev.status] || 'badge-orange'}`}>{ev.status}</span>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {ev.status === 'pending' && <>
                    <button className="btn btn-sm" style={{ background: 'rgba(76,175,125,0.12)', color: 'var(--green)', border: '1px solid rgba(76,175,125,0.3)' }}
                      onClick={() => handleEventStatus(ev.id, 'approved')}>✓ Approve</button>
                    <button className="btn btn-sm" style={{ background: 'rgba(224,92,92,0.12)', color: 'var(--red)', border: '1px solid rgba(224,92,92,0.3)' }}
                      onClick={() => handleEventStatus(ev.id, 'rejected')}>✕ Reject</button>
                  </>}
                  {ev.status === 'approved' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEventStatus(ev.id, 'rejected')}>Revoke</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(ev.id)}>Delete</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── USERS ────────────────────────────────── */}
      {tab === 'Users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h3>All Users ({users.length})</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['all', 'buyer', 'organizer', 'sponsor', 'admin', 'banned'].map(f => (
                <button key={f} className={`btn btn-sm ${userFilter === f ? 'btn-gold' : 'btn-ghost'}`}
                  style={{ borderRadius: 100, textTransform: 'capitalize' }} onClick={() => setUserFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredUsers.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: u.banned ? 0.65 : 1 }}>
                <img src={u.avatar} alt={u.name} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                </div>
                <span className={`badge ${ROLE_BADGE[u.role] || 'badge-gold'}`}>{u.role}</span>
                {u.banned && <span className="badge badge-red">Banned</span>}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setEditUser(u); setNewRole(u.role); setUserModal(true); }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: u.banned ? 'rgba(76,175,125,0.12)' : 'rgba(224,154,76,0.12)', color: u.banned ? 'var(--green)' : 'var(--orange)', border: `1px solid ${u.banned ? 'rgba(76,175,125,0.3)' : 'rgba(224,154,76,0.3)'}` }}
                    onClick={() => handleBan(u.id, u.banned)}
                  >
                    {u.banned ? 'Unban' : 'Ban'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ANALYTICS ────────────────────────────── */}
      {tab === 'Analytics' && stats && (
        <div>
          <h3 style={{ marginBottom: 24 }}>Platform Analytics</h3>
          <div className="grid-2" style={{ gap: 24 }}>
            {[
              { title: 'User Growth', items: [
                { label: 'Buyers', value: stats.users.buyers, color: 'var(--red)' },
                { label: 'Organizers', value: stats.users.organizers, color: 'var(--blue)' },
                { label: 'Sponsors', value: stats.users.sponsors, color: 'var(--green)' },
                { label: 'Admins', value: stats.users.admins, color: 'var(--gold)' },
              ]},
              { title: 'Event Pipeline', items: [
                { label: 'Approved', value: stats.events.approved, color: 'var(--green)' },
                { label: 'Pending', value: stats.events.pending, color: 'var(--orange)' },
                { label: 'Rejected', value: stats.events.rejected, color: 'var(--red)' },
              ]},
              { title: 'Sponsorships', items: [
                { label: 'Pending', value: stats.sponsorRequests.pending, color: 'var(--orange)' },
                { label: 'Accepted', value: stats.sponsorRequests.accepted, color: 'var(--green)' },
              ]},
              { title: 'Ticket Sales', items: [
                { label: 'Total Tickets', value: stats.tickets.total, color: 'var(--gold)' },
                { label: 'Revenue', value: `$${(stats.tickets.revenue || 0).toFixed(0)}`, color: 'var(--green)' },
              ]},
            ].map((section, idx) => (
              <motion.div key={section.title}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="card" style={{ padding: '24px' }}>
                <h4 style={{ marginBottom: 20, fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>
                  {section.title}
                </h4>
                {section.items.map(item => (
                  <div key={item.label} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', color: item.color }}>{item.value}</span>
                    </div>
                    {typeof item.value === 'number' && (
                      <MiniBar value={item.value} max={Math.max(...section.items.map(i => typeof i.value === 'number' ? i.value : 0))} color={item.color} />
                    )}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* User edit modal */}
      <Modal open={userModal} onClose={() => setUserModal(false)} title="Edit User" maxWidth={420}>
        {editUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <img src={editUser.avatar} alt={editUser.name} style={{ width: 52, height: 52, borderRadius: '50%' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{editUser.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{editUser.email}</div>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Role</label>
              <select className="form-input" value={newRole} onChange={e => setNewRole(e.target.value)}>
                {['buyer', 'organizer', 'sponsor', 'admin'].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setUserModal(false)}>Cancel</button>
              <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={handleChangeRole}>Save Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </DashLayout>
  );
}
