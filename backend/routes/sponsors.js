// routes/sponsors.js
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { findById, findOne, findAll, create, updateById } = require('../models/db');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/sponsors/request — sponsor submits request
router.post('/request', authenticate, authorize('sponsor'), async (req, res) => {
  try {
    const { eventId, amount, message } = req.body;
    if (!eventId) return res.status(400).json({ message: 'Event is required' });
    if (amount === undefined || amount === null || amount === '')
      return res.status(400).json({ message: 'Amount is required' });

    const amountStr = String(amount).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(amountStr))
      return res.status(400).json({ message: 'Amount must be a valid number' });
    const amountNum = parseFloat(amountStr);
    if (amountNum < 100)
      return res.status(400).json({ message: 'Minimum sponsorship amount is ₹100' });

    const event = await findById('events', eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existing = await findOne('sponsorRequests', { eventId, sponsorId: req.user.id, status: 'pending' });
    if (existing) return res.status(409).json({ message: 'You already have a pending request for this event' });

    const request = await create('sponsorRequests', {
      id: uuidv4(),
      eventId,
      eventTitle: event.title,
      organizerId: event.organizerId,
      sponsorId: req.user.id,
      sponsorName: req.user.name,
      sponsorCompany: req.user.company || req.user.name,
      amount: amountNum,
      message: message || '',
      status: 'pending',
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sponsors/my — sponsor sees their requests
router.get('/my', authenticate, authorize('sponsor'), async (req, res) => {
  try {
    const requests = await findAll('sponsorRequests', { sponsorId: req.user.id });
    res.json(requests);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sponsors/incoming — organizer sees incoming requests
router.get('/incoming', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const requests = await findAll('sponsorRequests', { organizerId: req.user.id });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/sponsors/:id/respond — organizer accept/reject
router.patch('/:id/respond', authenticate, authorize('organizer'), async (req, res) => {
  try {
    const { status, responseNote } = req.body;
    if (!['accepted', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be accepted or rejected' });

    const request = await findById('sponsorRequests', req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.organizerId !== req.user.id) return res.status(403).json({ message: 'Not your event' });

    const updated = await updateById('sponsorRequests', req.params.id, { 
      status, 
      responseNote: responseNote || ''
    });
    res.json(updated);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sponsors/all — admin
router.get('/all', authenticate, authorize('admin'), async (_req, res) => {
  try {
    const requests = await findAll('sponsorRequests');
    res.json(requests);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;