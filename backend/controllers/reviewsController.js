const pool = require('../config/db');

exports.addReview = async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating) return res.status(400).json({ success: false, message: "Rating is required" });

    // STEP 1 — Check Event Exists
    const [events] = await pool.query('SELECT endDate FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    const event = events[0];

    // STEP 2 — Check Event Has Ended
    if (new Date() <= new Date(event.endDate)) {
      return res.status(403).json({ success: false, message: "Reviews allowed only after event ends" });
    }

    // STEP 3 — Verify Ticket Buyer
    const [tickets] = await pool.query(
      "SELECT id FROM tickets WHERE buyerId = ? AND eventId = ? AND status IN ('confirmed', 'active')",
      [userId, eventId]
    );

    if (tickets.length === 0) {
      return res.status(403).json({ success: false, message: "Only verified ticket buyers can review" });
    }

    // STEP 4 — Prevent Duplicate Reviews
    const [existing] = await pool.query(
      "SELECT id FROM reviews WHERE userId = ? AND eventId = ?",
      [userId, eventId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Review already submitted" });
    }

    // STEP 5 — Insert Review
    await pool.query(
      `INSERT INTO reviews (id, eventId, userId, rating, comment) VALUES (UUID(), ?, ?, ?, ?)`,
      [eventId, userId, rating, comment || null]
    );

    return res.status(201).json({ success: true, message: "Review submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment as text, r.createdAt as date, u.name, u.avatar 
       FROM reviews r 
       JOIN users u ON r.userId = u.id 
       WHERE r.eventId = ?
       ORDER BY r.createdAt DESC`,
      [eventId]
    );
    return res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
