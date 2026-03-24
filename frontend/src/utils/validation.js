// utils/validation.js — Centralized validation for EventSphere
// All validators return { valid: boolean, error: string }

// ── Amount / Price ─────────────────────────────────────────────────────────────
export function validateAmount(value, { min = 1, label = 'Amount', allowZero = false } = {}) {
  if (value === '' || value === null || value === undefined)
    return { valid: false, error: `${label} is required` };

  const str = String(value).trim();

  // Reject trailing decimal like "120." or leading decimal like ".50"
  if (!/^\d+(\.\d{1,2})?$/.test(str))
    return { valid: false, error: `Enter a valid number (e.g. 120 or 120.50)` };

  const num = parseFloat(str);
  if (isNaN(num)) return { valid: false, error: `${label} must be a number` };
  if (!allowZero && num < min) return { valid: false, error: `${label} must be at least ₹${min}` };
  if (allowZero && num < 0)    return { valid: false, error: `${label} cannot be negative` };

  return { valid: true, error: '' };
}

// ── Email ──────────────────────────────────────────────────────────────────────
export function validateEmail(value) {
  if (!value || !value.trim())
    return { valid: false, error: 'Email is required' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
    return { valid: false, error: 'Enter a valid email address' };
  return { valid: true, error: '' };
}

// ── Password ───────────────────────────────────────────────────────────────────
export function validatePassword(value, { minLength = 8 } = {}) {
  if (!value) return { valid: false, error: 'Password is required' };
  if (value.length < minLength)
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  if (!/\d/.test(value))
    return { valid: false, error: 'Password must include at least one number' };
  return { valid: true, error: '' };
}

// ── Confirm Password ───────────────────────────────────────────────────────────
export function validateConfirmPassword(value, original) {
  if (!value) return { valid: false, error: 'Please confirm your password' };
  if (value !== original) return { valid: false, error: 'Passwords do not match' };
  return { valid: true, error: '' };
}

// ── Text (name, title, venue, etc.) ───────────────────────────────────────────
export function validateText(value, { label = 'This field', min = 3, max = 200, required = true } = {}) {
  if (required && (!value || !value.trim()))
    return { valid: false, error: `${label} is required` };
  if (value && value.trim().length < min)
    return { valid: false, error: `${label} must be at least ${min} characters` };
  if (value && value.trim().length > max)
    return { valid: false, error: `${label} must be under ${max} characters` };
  return { valid: true, error: '' };
}

// ── Description ───────────────────────────────────────────────────────────────
export function validateDescription(value, { min = 10, required = false } = {}) {
  if (required && (!value || !value.trim()))
    return { valid: false, error: 'Description is required' };
  if (value && value.trim().length > 0 && value.trim().length < min)
    return { valid: false, error: `Description must be at least ${min} characters` };
  return { valid: true, error: '' };
}

// ── Date ───────────────────────────────────────────────────────────────────────
export function validateDate(value, { label = 'Date', allowPast = false, required = true } = {}) {
  if (required && !value)
    return { valid: false, error: `${label} is required` };
  if (value) {
    const d = new Date(value);
    if (isNaN(d.getTime()))
      return { valid: false, error: `${label} is not a valid date` };
    if (!allowPast && d < new Date())
      return { valid: false, error: `${label} cannot be in the past` };
  }
  return { valid: true, error: '' };
}

// ── URL (image) ────────────────────────────────────────────────────────────────
export function validateUrl(value, { required = false } = {}) {
  if (required && !value) return { valid: false, error: 'URL is required' };
  if (value && !/^https?:\/\/.+/.test(value.trim()))
    return { valid: false, error: 'Enter a valid URL starting with http:// or https://' };
  return { valid: true, error: '' };
}

// ── Numeric Input handler — prevents invalid characters while typing ───────────
// Use as onChange handler for price/amount inputs
export function numericInputProps(value, onChange) {
  return {
    value,
    onChange: (e) => {
      const raw = e.target.value;
      // Allow only digits and up to one decimal point with max 2 decimal places
      if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
        onChange(raw);
      }
    },
    onBlur: (e) => {
      const raw = e.target.value;
      // On blur: clean trailing decimal "120." → "120"
      if (/\.$/.test(raw)) {
        onChange(raw.slice(0, -1));
      }
    },
    inputMode: 'decimal',
  };
}