// routes/tickets.js
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { findById, findAll, create, updateById } = require('../models/db');
const { authenticate, authorize } = require('../middleware/auth');
const generateTicketPDF = require('../utils/generateTicketPDF');
const { uploadTicketPDF, getExpectedPdfUrl } = require('../utils/supabase');

// POST /api/tickets/purchase
router.post('/purchase', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { eventId, seatId, zone, quantity = 1 } = req.body;
    const event = await findById('events', eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'approved') return res.status(400).json({ message: 'Event is not available' });

    // Validate if event has expired
    const eventDateTime = new Date(event.date);
    if (eventDateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot book ticket. Event date has already passed.' });
    }

    let seatInfo = null;
    let eventSeats = typeof event.seats === 'string' ? JSON.parse(event.seats) : event.seats;

    // Handle pit/zone booking (concerts/festivals)
    if (zone) {
      const pitIndex = eventSeats.findIndex(s => s.id === zone);
      if (pitIndex === -1) return res.status(400).json({ message: 'Zone not found' });
      const pit = eventSeats[pitIndex];
      if (pit.booked + quantity > pit.capacity)
        return res.status(400).json({ message: 'Not enough spots in this zone' });

      eventSeats[pitIndex] = { ...pit, booked: pit.booked + quantity };
      await updateById('events', eventId, {
        seats: eventSeats,
        ticketsSold: event.ticketsSold + quantity,
        revenue: parseFloat(event.revenue) + (parseFloat(event.price) * quantity),
      });
      seatInfo = { zone: pit.zone, quantity };
    } else if (seatId) {
      // Handle individual seat booking
      const seatIndex = eventSeats.findIndex(s => s.id === seatId);
      if (seatIndex === -1) return res.status(400).json({ message: 'Seat not found' });
      if (eventSeats[seatIndex].status === 'booked')
        return res.status(409).json({ message: 'Seat already booked' });

      eventSeats[seatIndex] = { ...eventSeats[seatIndex], status: 'booked' };
      await updateById('events', eventId, {
        seats: eventSeats,
        ticketsSold: event.ticketsSold + 1,
        revenue: parseFloat(event.revenue) + parseFloat(event.price),
      });
      seatInfo = { seatId, row: eventSeats[seatIndex].row, number: eventSeats[seatIndex].number };
    } else {
      return res.status(400).json({ message: 'Seat ID or zone required' });
    }

    const ticketId = uuidv4();
    const qrData = JSON.stringify({
      ticketId,
      eventId,
      eventTitle: event.title,
      buyer: req.user.name,
      date: event.date,
      ...seatInfo,
    });

    const shortId = ticketId.substring(0, 8).toUpperCase();
    const fileName = `ES_${shortId}.pdf`;
    const pdfUrl = getExpectedPdfUrl(fileName);

    const ticket = await create('tickets', {
      id: ticketId,
      eventId,
      eventTitle: event.title,
      eventDate: event.date,
      eventVenue: event.venue,
      eventCategory: event.category || null,
      eventImage: event.image || null,
      buyerId: req.user.id,
      buyerName: req.user.name,
      row: seatInfo.row || null,
      number: seatInfo.number || null,
      zone: seatInfo.zone || null,
      quantity,
      price: parseFloat(event.price) * (quantity || 1),
      status: 'active',
      pdfUrl,
      paymentIntentId: null, // Depending on if payments are routed differently
    });

    res.status(201).json({ ticket, qrData });

    // Background PDF generation
    const qrTarget = pdfUrl || `ticket-${ticketId}`;
    generateTicketPDF(ticket, qrTarget)
      .then((pdfBuffer) => uploadTicketPDF(fileName, pdfBuffer))
      .catch((err) => console.error(`[PDF] generation failed:`, err.message));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tickets/my — buyer's tickets
router.get('/my', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const tickets = await findAll('tickets', { buyerId: req.user.id });
    res.json(tickets);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const ticket = await findById('tickets', req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tickets/event/:eventId — organizer sees tickets for their event
router.get('/event/:eventId', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const tickets = await findAll('tickets', { eventId: req.params.eventId });
    res.json(tickets);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
