// server.js — EventSphere API Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { seedDatabase } = require('./models/seed');

const authRoutes    = require('./routes/auth');
const eventRoutes   = require('./routes/events');
const ticketRoutes  = require('./routes/tickets');
const sponsorRoutes = require('./routes/sponsors');
const userRoutes    = require('./routes/users');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Catch unhandled promise rejections (e.g. background PDF generation)
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/tickets',  ticketRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Start
app.listen(PORT, async () => {
  await seedDatabase();
  console.log(`🚀 EventSphere API running on http://localhost:${PORT}`);
});