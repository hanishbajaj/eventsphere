// pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FieldError from '../components/FieldError';
import { validateEmail, validatePassword, validateConfirmPassword, validateText } from '../utils/validation';

const ROLES = [
  { value: 'buyer',     label: 'Ticket Buyer',    desc: 'Browse and purchase event tickets',   icon: '🎫', color: '#e05c5c' },
  { value: 'organizer', label: 'Event Organizer',  desc: 'Create and manage your events',        icon: '📋', color: '#5c8ce0' },
  { value: 'sponsor',   label: 'Sponsor',          desc: 'Sponsor events and grow your brand',   icon: '', color: '#4caf7d' },
];

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: params.get('role') || 'buyer', company: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (field, value) => {
    switch (field) {
      case 'name':            return validateText(value, { label: 'Name', min: 2 }).error;
      case 'email':           return validateEmail(value).error;
      case 'password':        return validatePassword(value).error;
      case 'confirmPassword': return validateConfirmPassword(value, form.password).error;
      case 'company':         return form.role === 'sponsor' && !value?.trim() ? 'Company name is required for sponsors' : '';
      default:                return '';
    }
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (touched[field]) setErrors(e => ({ ...e, [field]: validateField(field, value) }));
    // Re-validate confirmPassword when password changes
    if (field === 'password' && touched.confirmPassword)
      setErrors(e => ({ ...e, confirmPassword: validateConfirmPassword(form.confirmPassword, value).error }));
  };

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: validateField(field, form[field]) }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const fields = ['name', 'email', 'password', 'confirmPassword'];
    if (form.role === 'sponsor') fields.push('company');
    setTouched(Object.fromEntries(fields.map(f => [f, true])));
    const errs = Object.fromEntries(fields.map(f => [f, validateField(f, form[f])]));
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) { toast('Please fix the errors below', 'error'); return; }
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div className="gradient-blob" style={{ width: 600, height: 600, top: -200, left: -200, background: 'rgba(201,168,76,0.04)' }} />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" className="nav-logo" style={{ fontSize: '1.8rem' }}>Event<span>Sphere</span></Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.9rem' }}>Create your account</p>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, textAlign: 'center' }}>I want to</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {ROLES.map(r => (
              <motion.button key={r.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                style={{ flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-md)', background: form.role === r.value ? `${r.color}15` : 'var(--bg-elevated)', border: `2px solid ${form.role === r.value ? r.color : 'var(--border)'}`, cursor: 'pointer', textAlign: 'center', transition: 'all var(--transition)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: form.role === r.value ? r.color : 'var(--text-primary)' }}>{r.label}</div>
              </motion.button>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: '36px', borderColor: 'var(--border-gold)' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className={`form-input ${touched.name && errors.name ? 'error' : ''}`}
                  placeholder="Your full name" value={form.name}
                  onChange={e => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} />
                <FieldError error={touched.name && errors.name} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
                  placeholder="you@example.com" value={form.email}
                  onChange={e => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} />
                <FieldError error={touched.email && errors.email} />
              </div>
              {form.role === 'sponsor' && (
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input type="text" className={`form-input ${touched.company && errors.company ? 'error' : ''}`}
                    placeholder="Your company" value={form.company}
                    onChange={e => handleChange('company', e.target.value)} onBlur={() => handleBlur('company')} />
                  <FieldError error={touched.company && errors.company} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className={`form-input ${touched.password && errors.password ? 'error' : ''}`}
                  placeholder="Min 8 characters, include a number" value={form.password}
                  onChange={e => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} />
                <FieldError error={touched.password && errors.password} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className={`form-input ${touched.confirmPassword && errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat password" value={form.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)} onBlur={() => handleBlur('confirmPassword')} />
                <FieldError error={touched.confirmPassword && errors.confirmPassword} />
              </div>
            </div>
            <motion.button type="submit" className="btn btn-gold"
              style={{ width: '100%', justifyContent: 'center', marginTop: 28 }}
              disabled={loading} whileTap={{ scale: 0.98 }}>
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