// pages/Login.jsx
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo accounts
  const demoAccounts = [
    { role: 'buyer', email: 'buyer@eventsphere.com', password: 'Buyer123!', color: '#e05c5c' },
    { role: 'organizer', email: 'organizer@eventsphere.com', password: 'Organizer1!', color: '#5c8ce0' },
    { role: 'sponsor', email: 'sponsor@eventsphere.com', password: 'Sponsor1!', color: '#4caf7d' },
    { role: 'admin', email: 'admin@eventsphere.com', password: 'Admin123!', color: '#c9a84c' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '40px 24px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div className="gradient-blob" style={{ width: 600, height: 600, top: -200, right: -200, background: 'rgba(201,168,76,0.04)' }} />
      <div className="gradient-blob" style={{ width: 400, height: 400, bottom: -150, left: -100, background: 'rgba(92,140,224,0.04)' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" className="nav-logo" style={{ fontSize: '1.8rem' }}>
            Event<span>Sphere</span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.9rem' }}>
            Welcome back
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: '40px', borderColor: 'var(--border-gold)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-input ${shake ? 'shake' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-input ${shake ? 'shake' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-gold"
              style={{ width: '100%', justifyContent: 'center', marginTop: 28 }}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </motion.button>
          </form>

          <div className="divider" style={{ margin: '28px 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 500 }}>Create one</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: 24 }}>
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Demo Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {demoAccounts.map(acc => (
              <motion.button
                key={acc.role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setForm({ email: acc.email, password: acc.password })}
                style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  background: `${acc.color}12`, border: `1px solid ${acc.color}30`,
                  color: acc.color, fontSize: '0.78rem', fontWeight: 500,
                  textTransform: 'capitalize', cursor: 'pointer'
                }}
              >
                {acc.role}
              </motion.button>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Click to auto-fill credentials
          </p>
        </div>
      </motion.div>
    </div>
  );
}
