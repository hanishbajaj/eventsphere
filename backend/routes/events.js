// routes/events.js
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { Events, Tickets, Users } = require('../models/db');
const { authenticate, authorize } = require('../middleware/auth');

const SEAT_CATEGORIES = ['Theater', 'Sports', 'Conference', 'Workshop', 'Webinar', 'Charity Gala'];
const PIT_CATEGORIES = ['Concert / Music', 'Festival'];

function generateSeats(category, count = 40) {
  if (PIT_CATEGORIES.includes(category)) {
    return [
      { id: 'fp', zone: 'Front Pit', capacity: 10, booked: 0, type: 'pit' },
      { id: 'mp', zone: 'Main Pit', capacity: 20, booked: 0, type: 'pit' },
      { id: 'gp', zone: 'General Pit', capacity: 20, booked: 0, type: 'pit' },
    ];
  }
  const total = Math.min(count, 50);
  return Array.from({ length: total }, (_, i) => ({
    id: `S${i + 1}`,
    number: i + 1,
    row: String.fromCharCode(65 + Math.floor(i / 10)),
    status: 'available',
    type: 'seat',
  }));
}

// GET /api/events — public
router.get('/', (req, res) => {
  try {
    let events = Events.findAll({ status: 'approved' });
    const { category, search, featured } = req.query;
    if (category) events = events.filter(e => e.category === category);
    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }
    if (featured === 'true') events = events.filter(e => e.featured);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/all — admin only
router.get('/all', authenticate, authorize('admin'), (_req, res) => {
  res.json(Events.findAll());
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
  const event = Events.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

// POST /api/events — organizer or admin
router.post('/', authenticate, authorize('organizer', 'admin'), (req, res) => {
  try {
    const { title, category, date, endDate, venue, address, description, price, image, tags, seatCount } = req.body;
    if (!title || !category || !date || !venue)
      return res.status(400).json({ message: 'Title, category, date, and venue are required' });

    const event = Events.create({
      id: uuidv4(),
      title, category,
      date, endDate: endDate || date,
      venue, address: address || venue,
      description: description || '',
      price: parseFloat(price) || 0,
      image: image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      tags: tags || [],
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      featured: false,
      organizerId: req.user.id,
      organizerName: req.user.name,
      seats: generateSeats(category, parseInt(seatCount) || 40),
      ticketsSold: 0,
      revenue: 0,
      sponsorRequests: [],
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/events/:id
router.put('/:id', authenticate, authorize('organizer', 'admin'), (req, res) => {
  const event = Events.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (req.user.role !== 'admin' && event.organizerId !== req.user.id)
    return res.status(403).json({ message: 'Not your event' });

  const updated = Events.updateById(req.params.id, req.body);
  res.json(updated);
});

// DELETE /api/events/:id
router.delete('/:id', authenticate, authorize('organizer', 'admin'), (req, res) => {
  const event = Events.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (req.user.role !== 'admin' && event.organizerId !== req.user.id)
    return res.status(403).json({ message: 'Not your event' });

  Events.deleteById(req.params.id);
  res.json({ message: 'Event deleted' });
});

// GET /api/events/organizer/mine — get organizer's events
router.get('/organizer/mine', authenticate, authorize('organizer'), (req, res) => {
  const events = Events.findAll({ organizerId: req.user.id });
  res.json(events);
});

// PATCH /api/events/:id/status — admin approve/reject
router.patch('/:id/status', authenticate, authorize('admin'), (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });
  const updated = Events.updateById(req.params.id, { status });
  if (!updated) return res.status(404).json({ message: 'Event not found' });
  res.json(updated);
});

module.exports = router;
