// pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLES = [
  { value: 'buyer', label: 'Ticket Buyer', desc: 'Browse and purchase event tickets', icon: '🎫', color: '#e05c5c' },
  { value: 'organizer', label: 'Event Organizer', desc: 'Create and manage your events', icon: '📋', color: '#5c8ce0' },
  { value: 'sponsor', label: 'Sponsor', desc: 'Sponsor events and grow your brand', icon: '🤝', color: '#4caf7d' },
];

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: params.get('role') || 'buyer', company: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast('Please fix the errors below', 'error'); return; }
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role, company: form.company });
      toast(`Welcome to EventSphere, ${user.name.split(' ')[0]}!`, 'success');
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '40px 24px', position: 'relative', overflow: 'hidden'
    }}>
      <div className="gradient-blob" style={{ width: 600, height: 600, top: -200, left: -200, background: 'rgba(201,168,76,0.04)' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" className="nav-logo" style={{ fontSize: '1.8rem' }}>Event<span>Sphere</span></Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.9rem' }}>Create your account</p>
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, textAlign: 'center' }}>
            I want to
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {ROLES.map(r => (
              <motion.button
                key={r.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setForm({ ...form, role: r.value })}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-md)',
                  background: form.role === r.value ? `${r.color}15` : 'var(--bg-elevated)',
                  border: `2px solid ${form.role === r.value ? r.color : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'center', transition: 'all var(--transition)'
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: form.role === r.value ? r.color : 'var(--text-primary)' }}>
                  {r.label}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '36px', borderColor: 'var(--border-gold)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Your full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
                {errors.name && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
                {errors.email && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.email}</span>}
              </div>

              {form.role === 'sponsor' && (
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input type="text" className="form-input" placeholder="Your company"
                    value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Min 8 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                {errors.password && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat password" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                {errors.confirmPassword && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.confirmPassword}</span>}
              </div>
            </div>

            <motion.button
              type="submit" className="btn btn-gold"
              style={{ width: '100%', justifyContent: 'center', marginTop: 28 }}
              disabled={loading} whileTap={{ scale: 0.98 }}
            >
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating...</> : 'Create Account →'}
            </motion.button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
