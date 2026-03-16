// routes/users.js
const router = require('express').Router();
const { Users, Events, Tickets, SponsorRequests, SystemLogs } = require('../models/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users — admin only
router.get('/', authenticate, authorize('admin'), (_req, res) => {
  const users = Users.findAll().map(({ password, ...u }) => u);
  res.json(users);
});

// GET /api/users/stats — admin dashboard stats
router.get('/stats', authenticate, authorize('admin'), (_req, res) => {
  const allUsers = Users.findAll();
  const allEvents = Events.findAll();
  const allTickets = Tickets.findAll();
  const allRequests = SponsorRequests.findAll();

  res.json({
    users: {
      total: allUsers.length,
      buyers: allUsers.filter(u => u.role === 'buyer').length,
      organizers: allUsers.filter(u => u.role === 'organizer').length,
      sponsors: allUsers.filter(u => u.role === 'sponsor').length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      banned: allUsers.filter(u => u.banned).length,
    },
    events: {
      total: allEvents.length,
      approved: allEvents.filter(e => e.status === 'approved').length,
      pending: allEvents.filter(e => e.status === 'pending').length,
      rejected: allEvents.filter(e => e.status === 'rejected').length,
    },
    tickets: { total: allTickets.length, revenue: allTickets.reduce((s, t) => s + (t.price || 0), 0) },
    sponsorRequests: {
      total: allRequests.length,
      pending: allRequests.filter(r => r.status === 'pending').length,
      accepted: allRequests.filter(r => r.status === 'accepted').length,
    },
    logs: SystemLogs.findAll().slice(-20).reverse(),
  });
});

// PATCH /api/users/:id/ban
router.patch('/:id/ban', authenticate, authorize('admin'), (req, res) => {
  const user = Users.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const updated = Users.updateById(req.params.id, { banned: !user.banned });
  const { password, ...safe } = updated;
  res.json(safe);
});

// PATCH /api/users/:id/role
router.patch('/:id/role', authenticate, authorize('admin'), (req, res) => {
  const { role } = req.body;
  const valid = ['buyer', 'organizer', 'sponsor', 'admin'];
  if (!valid.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const updated = Users.updateById(req.params.id, { role });
  if (!updated) return res.status(404).json({ message: 'User not found' });
  const { password, ...safe } = updated;
  res.json(safe);
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  if (!Users.deleteById(req.params.id)) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
});

// PATCH /api/users/profile — any auth user updates their own profile
router.patch('/profile', authenticate, (req, res) => {
  const { name, company, avatar } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (company) updates.company = company;
  if (avatar) updates.avatar = avatar;
  const updated = Users.updateById(req.user.id, updates);
  if (!updated) return res.status(404).json({ message: 'User not found' });
  const { password, ...safe } = updated;
  res.json(safe);
});

module.exports = router;
