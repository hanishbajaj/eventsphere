// routes/users.js
const router = require('express').Router();
const { findById, findAll, updateById, deleteById, pool } = require('../models/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users — admin only
router.get('/', authenticate, authorize('admin'), async (_req, res) => {
  try {
    const users = await findAll('users');
    const safeUsers = users.map(({ password, ...u }) => ({
      ...u,
      banned: !!u.banned
    }));
    res.json(safeUsers);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/stats — admin dashboard stats
router.get('/stats', authenticate, authorize('admin'), async (_req, res) => {
  try {
    const allUsers = await findAll('users');
    const allEvents = await findAll('events');
    const allTickets = await findAll('tickets');
    const allRequests = await findAll('sponsorRequests');
    const allLogs = await findAll('systemLogs');

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
      tickets: { total: allTickets.length, revenue: allTickets.reduce((s, t) => s + (parseFloat(t.price) || 0), 0) },
      sponsorRequests: {
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === 'pending').length,
        accepted: allRequests.filter(r => r.status === 'accepted').length,
      },
      logs: allLogs.slice(-20).reverse(),
    });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id/ban
router.patch('/:id/ban', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await findById('users', req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Toggle ban state
    const newBannedState = user.banned ? 0 : 1;
    const updated = await updateById('users', req.params.id, { banned: newBannedState });
    
    const { password, ...safe } = updated;
    safe.banned = !!safe.banned;
    res.json(safe);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id/role
router.patch('/:id/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const valid = ['buyer', 'organizer', 'sponsor', 'admin'];
    if (!valid.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    
    const updated = await updateById('users', req.params.id, { role });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    
    const { password, ...safe } = updated;
    safe.banned = !!safe.banned;
    res.json(safe);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const deleted = await deleteById('users', req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/profile — any auth user updates their own profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, company, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (company) updates.company = company;
    if (avatar) updates.avatar = avatar;
    
    const updated = await updateById('users', req.user.id, updates);
    if (!updated) return res.status(404).json({ message: 'User not found' });
    
    const { password, ...safe } = updated;
    safe.banned = !!safe.banned;
    res.json(safe);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
