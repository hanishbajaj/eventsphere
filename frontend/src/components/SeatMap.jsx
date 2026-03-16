// components/SeatMap.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Regular seat grid (Theater, Sports, etc.)
function SeatGrid({ seats, selected, onSelect }) {
  const rows = {};
  seats.forEach(s => {
    if (!rows[s.row]) rows[s.row] = [];
    rows[s.row].push(s);
  });

  return (
    <div>
      {/* Stage */}
      <div style={{
        textAlign: 'center', marginBottom: 24,
        padding: '10px 40px', background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-gold)',
        fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)',
        display: 'inline-block', marginLeft: '50%', transform: 'translateX(-50%)'
      }}>
        — Stage / Field —
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        {Object.entries(rows).map(([row, rowSeats]) => (
          <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 20, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {rowSeats.map(seat => {
                const isSelected = selected?.id === seat.id;
                const isBooked = seat.status === 'booked';
                return (
                  <motion.button
                    key={seat.id}
                    whileHover={!isBooked ? { scale: 1.15 } : {}}
                    whileTap={!isBooked ? { scale: 0.9 } : {}}
                    animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                    onClick={() => !isBooked && onSelect(isSelected ? null : seat)}
                    className={`seat ${isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available'}`}
                    style={{ width: 28, height: 28, fontSize: '0.55rem' }}
                    title={isBooked ? 'Booked' : `Row ${row}, Seat ${seat.number}`}
                  >
                    {seat.number}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pit zone selector (Concerts/Festivals)
function PitSelector({ zones, selected, onSelect, quantity, onQuantityChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {zones.map((zone, i) => {
        const isSelected = selected?.id === zone.id;
        const available = zone.capacity - zone.booked;
        const pct = (zone.booked / zone.capacity) * 100;

        return (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => available > 0 && onSelect(isSelected ? null : zone)}
            style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
              background: isSelected ? 'var(--gold-glow)' : 'var(--bg-elevated)',
              cursor: available > 0 ? 'pointer' : 'not-allowed',
              opacity: available > 0 ? 1 : 0.5,
              transition: 'all var(--transition)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}>{zone.zone}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {available} spots remaining of {zone.capacity}
                </div>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', color: 'var(--text-inverse)', fontWeight: 700
                  }}
                >✓</motion.div>
              )}
            </div>
            {/* Capacity bar */}
            <div style={{ background: 'var(--border)', borderRadius: 100, height: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                style={{
                  height: '100%', borderRadius: 100,
                  background: pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--orange)' : 'var(--green)'
                }}
              />
            </div>
          </motion.div>
        );
      })}

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Quantity:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))} className="btn btn-ghost btn-sm">−</button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', minWidth: 24, textAlign: 'center' }}>{quantity}</span>
            <button onClick={() => onQuantityChange(Math.min(selected.capacity - selected.booked, quantity + 1))} className="btn btn-ghost btn-sm">+</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function SeatMap({ event, onConfirm }) {
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const isPit = event.seats?.[0]?.type === 'pit';

  const handleConfirm = () => {
    if (!selected) return;
    if (isPit) {
      onConfirm({ zone: selected.id, quantity, zoneName: selected.zone });
    } else {
      onConfirm({ seatId: selected.id, row: selected.row, number: selected.number });
    }
  };

  return (
    <div>
      {/* Legend */}
      {!isPit && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Available', cls: 'seat-available', style: { background: 'var(--bg-hover)', border: '1px solid var(--border)' } },
            { label: 'Selected', cls: 'seat-selected', style: { background: 'var(--gold)' } },
            { label: 'Booked', cls: 'seat-booked', style: { background: 'rgba(224,92,92,0.15)', opacity: 0.5 } },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, ...l.style }} />
              {l.label}
            </div>
          ))}
        </div>
      )}

      {isPit ? (
        <PitSelector zones={event.seats} selected={selected} onSelect={setSelected} quantity={quantity} onQuantityChange={setQuantity} />
      ) : (
        <SeatGrid seats={event.seats} selected={selected} onSelect={setSelected} />
      )}

      {/* Confirm */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              marginTop: 24, padding: '20px 24px',
              background: 'var(--gold-glow)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Selection
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, marginTop: 4 }}>
                {isPit ? `${selected.zone} × ${quantity}` : `Row ${selected.row}, Seat ${selected.number}`}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Total: <strong style={{ color: 'var(--gold)' }}>${(event.price * (isPit ? quantity : 1)).toFixed(2)}</strong>
              </div>
            </div>
            <button className="btn btn-gold" onClick={handleConfirm}>
              Confirm & Purchase →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
