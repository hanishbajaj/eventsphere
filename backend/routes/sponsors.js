// routes/sponsors.js
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { SponsorRequests, Events, Users } = require('../models/db');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/sponsors/request — sponsor submits request
router.post('/request', authenticate, authorize('sponsor'), (req, res) => {
  try {
    const { eventId, amount, message } = req.body;
    if (!eventId || !amount) return res.status(400).json({ message: 'Event and amount required' });

    const event = Events.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check duplicate
    const existing = SponsorRequests.findOne({ eventId, sponsorId: req.user.id, status: 'pending' });
    if (existing) return res.status(409).json({ message: 'You already have a pending request for this event' });

    const request = SponsorRequests.create({
      id: uuidv4(),
      eventId,
      eventTitle: event.title,
      organizerId: event.organizerId,
      sponsorId: req.user.id,
      sponsorName: req.user.name,
      sponsorCompany: req.user.company || req.user.name,
      amount: parseFloat(amount),
      message: message || '',
      status: 'pending',
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sponsors/my — sponsor sees their requests
router.get('/my', authenticate, authorize('sponsor'), (req, res) => {
  const requests = SponsorRequests.findAll({ sponsorId: req.user.id });
  res.json(requests);
});

// GET /api/sponsors/incoming — organizer sees incoming requests
router.get('/incoming', authenticate, authorize('organizer'), (req, res) => {
  const requests = SponsorRequests.findAll({ organizerId: req.user.id });
  res.json(requests);
});

// PATCH /api/sponsors/:id/respond — organizer accept/reject
router.patch('/:id/respond', authenticate, authorize('organizer'), (req, res) => {
  const { status, responseNote } = req.body;
  if (!['accepted', 'rejected'].includes(status))
    return res.status(400).json({ message: 'Status must be accepted or rejected' });

  const request = SponsorRequests.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.organizerId !== req.user.id) return res.status(403).json({ message: 'Not your event' });

  const updated = SponsorRequests.updateById(req.params.id, { status, responseNote: responseNote || '', respondedAt: new Date().toISOString() });
  res.json(updated);
});

// GET /api/sponsors/all — admin
router.get('/all', authenticate, authorize('admin'), (_req, res) => {
  res.json(SponsorRequests.findAll());
});

module.exports = router;
