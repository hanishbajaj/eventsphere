// routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Users, SystemLogs } = require('../models/db');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    if (name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' });
    if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ message: 'Enter a valid email address' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/\d/.test(password)) return res.status(400).json({ message: 'Password must include at least one number' });
    if (!role) return res.status(400).json({ message: 'Role is required' });

    const validRoles = ['buyer', 'organizer', 'sponsor'];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: 'Invalid role. Choose: buyer, organizer, or sponsor' });

    if (role === 'sponsor' && (!company || !company.trim()))
      return res.status(400).json({ message: 'Company name is required for sponsors' });

    if (Users.findOne({ email: email.trim() }))
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = Users.create({
      id: uuidv4(),
      name,
      email,
      password: hashed,
      role,
      company: company || null,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=c9a84c`,
      banned: false,
      budget: role === 'sponsor' ? 0 : undefined,
    });

    SystemLogs.create({ id: uuidv4(), action: 'USER_REGISTERED', userId: user.id, role, email });

    const { password: _, ...safeUser } = user;
    res.status(201).json({ token: signToken(user), user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = Users.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.banned) return res.status(403).json({ message: 'Account has been suspended' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    SystemLogs.create({ id: uuidv4(), action: 'USER_LOGIN', userId: user.id, role: user.role });

    const { password: _, ...safeUser } = user;
    res.json({ token: signToken(user), user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /api/auth/me
const { authenticate } = require('../middleware/auth');
router.get('/me', authenticate, (req, res) => {
  const user = Users.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;