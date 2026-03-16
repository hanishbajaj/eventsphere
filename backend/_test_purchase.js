// Temporary test script — delete after use
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Users, Events } = require('./models/db');

(async () => {
  const buyer = Users.findOne({ role: 'buyer' });
  const event = Events.findAll().find(e => e.status === 'approved');

  if (!buyer || !event) {
    console.log('No buyer or approved event found');
    process.exit(1);
  }

  const token = jwt.sign(
    { id: buyer.id, email: buyer.email, role: buyer.role, name: buyer.name },
    process.env.JWT_SECRET
  );

  const seat = event.seats.find(s =>
    s.zone ? s.booked < s.capacity : s.status !== 'booked'
  );

  if (!seat) {
    console.log('No available seats/zones');
    process.exit(1);
  }

  const body = seat.zone
    ? { eventId: event.id, zone: seat.id, quantity: 1 }
    : { eventId: event.id, seatId: seat.id };

  console.log('Testing purchase on port 5000...');
  console.log('Body:', JSON.stringify(body));

  try {
    const resp = await fetch('http://localhost:5000/api/tickets/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log('HTTP Status:', resp.status);
    const text = await resp.text();
    console.log('Response length:', text.length);

    if (text.length === 0) {
      console.log('*** EMPTY RESPONSE — server likely crashed ***');
    } else {
      try {
        const json = JSON.parse(text);
        console.log('Has ticket:', !!json.ticket);
        console.log('Has pdfUrl:', !!json.ticket?.pdfUrl);
        console.log('pdfUrl:', json.ticket?.pdfUrl || 'none');
      } catch {
        console.log('Response is not valid JSON:', text.substring(0, 200));
      }
    }
  } catch (e) {
    console.log('*** REQUEST FAILED:', e.message, '***');
    console.log('The server on port 5000 may have crashed. Check its terminal.');
  }

  process.exit(0);
})();
