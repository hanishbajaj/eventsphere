// components/FieldError.jsx — Animated inline field error message
import { motion, AnimatePresence } from 'framer-motion';

export default function FieldError({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 5,
            fontSize: '0.76rem',
            color: 'var(--red)',
            lineHeight: 1.4,
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="6" cy="8.5" r="0.7" fill="currentColor"/>
            </svg>
            {error}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}