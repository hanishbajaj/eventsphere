import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/currency';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_STYLE = {
  style: {
    base: {
      color: '#e8e2d0',
      fontFamily: 'inherit',
      fontSize: '16px',
      '::placeholder': { color: '#6b7280' },
      backgroundColor: 'transparent',
    },
    invalid: { color: '#e05c5c' },
  },
};

function CheckoutForm({ event, seatInfo, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create payment intent on backend
      const { clientSecret } = await api.createPaymentIntent({
        amount: event.price,
        eventId: event.id,
        eventTitle: event.title,
      });

      // 2. Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // 3. Purchase ticket in your backend
        await api.purchaseTicket({
          eventId: event.id,
          paymentIntentId: paymentIntent.id,
          ...seatInfo,
        });
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Event summary */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 600 }}>{event.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {event.venue}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)' }}>
          {formatCurrency(event.price)}
        </div>
      </div>

      {/* Card input */}
      <div style={{ marginBottom: 20 }}>
        <label className="form-label">Card Details</label>
        <div style={{
          padding: '14px 16px',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)',
          transition: 'border-color 0.2s',
        }}>
          <CardElement options={CARD_STYLE} />
        </div>
        {error && (
          <div style={{ color: 'var(--red)', fontSize: '0.76rem', marginTop: 6 }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Test card hint */}
      <div style={{
        background: 'rgba(92,140,224,0.08)',
        border: '1px solid rgba(92,140,224,0.2)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginBottom: 20,
      }}>
        🧪 Test card: <strong style={{ color: 'var(--text-primary)' }}>4242 4242 4242 4242</strong> — any future date, any CVC
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn btn-ghost"
          style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-gold"
          style={{ flex: 1, justifyContent: 'center' }}
          disabled={!stripe || loading}>
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing...</>
            : `Pay ${formatCurrency(event.price)}`
          }
        </button>
      </div>
    </form>
  );
}

export default function StripePayment({ event, seatInfo, onSuccess, onCancel }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        event={event}
        seatInfo={seatInfo}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}