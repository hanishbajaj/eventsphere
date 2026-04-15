-- backend/database/seed.sql
USE eventsphere_db;

-- Insert Default Users
-- Passwords are 'password123' hashed with bcrypt ($2a$12$...)
INSERT INTO users (id, name, email, password, role, company, avatar, banned, budget) VALUES
('b79e5d78-4e75-8505-e758-018e52460001', 'Buyer User', 'buyer@eventsphere.com', '$2y$12$R.S.Y6E/ZlR17nO53P.84uD63X5bKqHReiV2eH/QeA6L78yv5Xq3i', 'buyer', NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Buyer', 0, NULL),
('b79e5d78-4e75-8505-e758-018e52460002', 'Organizer User', 'organizer@eventsphere.com', '$2y$12$R.S.Y6E/ZlR17nO53P.84uD63X5bKqHReiV2eH/QeA6L78yv5Xq3i', 'organizer', NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Organizer', 0, NULL),
('b79e5d78-4e75-8505-e758-018e52460003', 'Sponsor User', 'sponsor@eventsphere.com', '$2y$12$R.S.Y6E/ZlR17nO53P.84uD63X5bKqHReiV2eH/QeA6L78yv5Xq3i', 'sponsor', 'Acme Corp', 'https://api.dicebear.com/7.x/initials/svg?seed=Sponsor', 0, 100000.00),
('b79e5d78-4e75-8505-e758-018e52460004', 'Admin User', 'admin@eventsphere.com', '$2y$12$R.S.Y6E/ZlR17nO53P.84uD63X5bKqHReiV2eH/QeA6L78yv5Xq3i', 'admin', NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Admin', 0, NULL);

-- Insert Sample Events
INSERT INTO events (id, title, category, date, endDate, venue, address, description, price, image, tags, status, featured, organizerId, organizerName, seats) VALUES
('e19e5d78-4e75-8505-e758-018e52460001', 'Tech Conference 2026', 'Conference', '2026-08-15 09:00:00', '2026-08-16 17:00:00', 'Tech Park', '123 Tech Avenue, Silicon City', 'A conference for the future.', 1500.00, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', '["tech","conference"]', 'approved', 1, 'b79e5d78-4e75-8505-e758-018e52460002', 'Organizer User', '[]'),
('e19e5d78-4e75-8505-e758-018e52460002', 'Annual Music Festival', 'Concert', '2026-09-20 18:00:00', '2026-09-22 23:59:00', 'Open Grounds', 'Music Valley, Harmony Road', 'Three days of music.', 2500.00, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea', '["music","festival"]', 'approved', 1, 'b79e5d78-4e75-8505-e758-018e52460002', 'Organizer User', '[]');
