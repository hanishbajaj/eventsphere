// routes/tickets.js
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { Tickets, Events } = require('../models/db');
const { authenticate, authorize } = require('../middleware/auth');
const generateTicketPDF = require('../utils/generateTicketPDF');
const { uploadTicketPDF, getExpectedPdfUrl } = require('../utils/supabase');

// POST /api/tickets/purchase
router.post('/purchase', authenticate, authorize('buyer'), (req, res) => {
  try {
    const { eventId, seatId, zone, quantity = 1 } = req.body;
    const event = Events.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'approved') return res.status(400).json({ message: 'Event is not available' });

    let seatInfo = null;

    // Handle pit/zone booking (concerts/festivals)
    if (zone) {
      const pitIndex = event.seats.findIndex(s => s.id === zone);
      if (pitIndex === -1) return res.status(400).json({ message: 'Zone not found' });
      const pit = event.seats[pitIndex];
      if (pit.booked + quantity > pit.capacity)
        return res.status(400).json({ message: 'Not enough spots in this zone' });

      const updatedSeats = [...event.seats];
      updatedSeats[pitIndex] = { ...pit, booked: pit.booked + quantity };
      Events.updateById(eventId, {
        seats: updatedSeats,
        ticketsSold: event.ticketsSold + quantity,
        revenue: event.revenue + event.price * quantity,
      });
      seatInfo = { zone: pit.zone, quantity };
    } else if (seatId) {
      // Handle individual seat booking
      const seatIndex = event.seats.findIndex(s => s.id === seatId);
      if (seatIndex === -1) return res.status(400).json({ message: 'Seat not found' });
      if (event.seats[seatIndex].status === 'booked')
        return res.status(409).json({ message: 'Seat already booked' });

      const updatedSeats = [...event.seats];
      updatedSeats[seatIndex] = { ...updatedSeats[seatIndex], status: 'booked' };
      Events.updateById(eventId, {
        seats: updatedSeats,
        ticketsSold: event.ticketsSold + 1,
        revenue: event.revenue + event.price,
      });
      seatInfo = { seatId, row: event.seats[seatIndex].row, number: event.seats[seatIndex].number };
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

    // Compute the deterministic Supabase PDF URL before creating the ticket
    const shortId = ticketId.substring(0, 8).toUpperCase();
    const fileName = `ES_${shortId}.pdf`;
    const pdfUrl = getExpectedPdfUrl(fileName);

    const ticket = Tickets.create({
      id: ticketId,
      eventId,
      eventTitle: event.title,
      eventDate: event.date,
      eventVenue: event.venue,
      buyerId: req.user.id,
      buyerName: req.user.name,
      ...seatInfo,
      price: event.price * (quantity || 1),
      qrData,
      pdfUrl,
      status: 'active',
    });

    // Respond immediately with pdfUrl already set (URL is deterministic)
    res.status(201).json({ ticket, qrData });

    // Generate + upload the PDF in the background (fire-and-forget)
    const qrTarget = pdfUrl || `ticket-${ticketId}`;
    console.log(`[PDF] Starting background generation for ${shortId}...`);
    generateTicketPDF(ticket, qrTarget)
      .then((pdfBuffer) => {
        console.log(`[PDF] ${shortId} generated OK, ${pdfBuffer.length} bytes. Uploading...`);
        return uploadTicketPDF(fileName, pdfBuffer);
      })
      .then((uploadedUrl) => {
        if (uploadedUrl) {
          console.log(`[PDF] Ticket ${shortId} uploaded: ${uploadedUrl}`);
        } else {
          console.error(`[PDF] ${shortId} upload returned null`);
        }
      })
      .catch((err) => {
        console.error(`[PDF] ${shortId} generation/upload failed:`, err.message);
        console.error(err.stack);
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tickets/my — buyer's tickets
router.get('/my', authenticate, authorize('buyer'), (req, res) => {
  const tickets = Tickets.findAll({ buyerId: req.user.id });
  res.json(tickets);
});

// GET /api/tickets/:id — ticket detail (for QR scan page)
router.get('/:id', (req, res) => {
  const ticket = Tickets.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  const event = Events.findById(ticket.eventId);
  res.json({ ...ticket, eventImage: event?.image || null, eventCategory: event?.category || null });
});

// GET /api/tickets/event/:eventId — organizer sees tickets for their event
router.get('/event/:eventId', authenticate, authorize('organizer', 'admin'), (req, res) => {
  const tickets = Tickets.findAll({ eventId: req.params.eventId });
  res.json(tickets);
});

module.exports = router;
