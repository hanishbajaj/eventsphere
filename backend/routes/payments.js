// routes/payments.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

// POST /api/payments/create-intent
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const { amount, eventId, eventTitle } = req.body;

    if (!amount || amount < 1)
      return res.status(400).json({ message: 'Invalid amount' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: 'inr',
      payment_method_types: ['card', 'upi'], // card + UPI support
      metadata: {
        eventId,
        eventTitle,
        userId: req.user.id,
        userEmail: req.user.email,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;