# ✨ EventSphere — Full-Stack Event Management System

A production-grade event management platform with 4 distinct user roles, animated UI, seat selection, QR ticketing, sponsor management, and a luxury dark aesthetic.

---

## 🎨 Design Philosophy

**Aesthetic:** Dark luxury editorial — deep charcoal backgrounds, gold accents, `Cormorant Garamond` display type paired with `DM Sans` body text.

**Motion:** Framer Motion throughout — staggered card reveals, spring-physics modals, parallax hero, page transitions, QR spin reveal.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Calendar | react-big-calendar + moment |
| QR Codes | qrcode.react |
| Maps | Google Maps Embed (iframe) |
| Backend | Node.js + Express |
| Database | JSON file-based (zero setup) |
| Auth | JWT + bcryptjs |

---

## 📁 Project Structure

```
eventsphere/
├── backend/
│   ├── server.js              # Express entry point
│   ├── .env.example           # Environment template
│   ├── routes/
│   │   ├── auth.js            # Register, login, /me
│   │   ├── events.js          # CRUD + organizer routes
│   │   ├── tickets.js         # Purchase + QR generation
│   │   ├── sponsors.js        # Request + respond
│   │   └── users.js           # Admin user management
│   ├── models/
│   │   ├── db.js              # JSON file-based collection
│   │   └── seed.js            # Default users + sample events
│   ├── middleware/
│   │   └── auth.js            # JWT authenticate + authorize
│   └── data/                  # Auto-created JSON store files
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx            # All routes
        ├── main.jsx
        ├── components/
        │   ├── Navbar.jsx     # Sticky nav with theme toggle + avatar dropdown
        │   ├── DashLayout.jsx # Sidebar layout for all dashboards
        │   ├── EventCard.jsx  # Animated event card
        │   ├── SeatMap.jsx    # Seat grid + pit zone selector
        │   ├── Modal.jsx      # Spring-physics modal
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Landing.jsx    # Parallax hero, categories, testimonials, CTA
        │   ├── Login.jsx      # With demo account quick-fill
        │   ├── Register.jsx   # Role-selector + form
        │   ├── Events.jsx     # Filterable grid/list view
        │   ├── EventDetail.jsx # Maps, seat picker, QR purchase
        │   ├── TicketPage.jsx  # Public QR scan destination
        │   ├── buyer/BuyerDashboard.jsx
        │   ├── organizer/OrganizerDashboard.jsx
        │   ├── sponsor/SponsorDashboard.jsx
        │   └── admin/AdminDashboard.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── ThemeContext.jsx
        │   └── ToastContext.jsx
        ├── utils/
        │   └── api.js         # Centralized fetch client
        └── styles/
            └── global.css     # Design system tokens + all styles
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd eventsphere/backend

# Install dependencies
npm install

# Copy env template
cp .env.example .env
# Edit .env: set JWT_SECRET to any long random string

# Start (auto-seeds data on first run)
npm run dev
# → API running on http://localhost:5000
```

### 2. Frontend

```bash
cd eventsphere/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → App running on http://localhost:5173
```

---

## 🔐 Environment Variables

**backend/.env**
```
PORT=5000
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
FRONTEND_URL=http://localhost:5173
```

---

## 👤 Demo Accounts (auto-seeded)

| Role | Email | Password |
|------|-------|----------|
| 🛡 Admin | admin@eventsphere.com | Admin123! |
| 📋 Organizer | organizer@eventsphere.com | Organizer1! |
| 🤝 Sponsor | sponsor@eventsphere.com | Sponsor1! |
| 🎫 Buyer | buyer@eventsphere.com | Buyer123! |

> **Tip:** The login page has one-click demo account fill buttons.

---

## 🗺 Google Maps

Event detail pages embed Google Maps via iframe. By default they use an unauthenticated embed which works for basic display. To enable full Maps API features (distance matrix, directions API), replace the iframe src in `src/pages/EventDetail.jsx` with your key:

```jsx
src={`https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&...`}
```

---

## 🎭 Event Categories & Seating Logic

| Category | Seating Type |
|----------|-------------|
| Concert / Music | 3 pit zones (Front / Main / General) |
| Festival | 3 pit zones |
| Theater | 50-seat grid (rows A–E) |
| Sports | 50-seat grid |
| Conference | 40-seat grid |
| Workshop | 30-seat grid |
| Webinar | 50-seat grid |
| Charity Gala | 50-seat grid |

---

## ✨ Key Features by Role

### 🎫 Ticket Buyer
- Browse events with search + category filters (grid & list views)
- Event detail page with Google Maps embed + directions
- Visual seat map (clickable grid) or pit zone selector for concerts
- Post-purchase QR code animation (3D flip reveal)
- Digital ticket with scannable QR at `/ticket/:id`
- Ticket history dashboard

### 📋 Event Organizer
- Create events with full form (category auto-configures seating)
- My Events CRUD management
- Analytics per event (tickets sold, revenue, capacity bar)
- Sponsor request inbox with accept/reject modals + notes

### 🤝 Sponsor
- Interactive **react-big-calendar** showing all events by date
- Click any calendar event → animated detail popup → sponsor button
- Submit sponsorship requests with amount + message
- Track request history with organizer response notes

### 🛡 Admin
- Platform stats dashboard with mini bar charts
- User table: filter by role, ban/unban, change role, delete
- Event table: approve / reject / revoke / delete
- System activity log (last 20 actions)
- Analytics overview panel

---

## 🎬 Animation Highlights

- **Landing hero:** Parallax background on scroll (Framer Motion `useScroll`)
- **Stats:** Counter entrance with stagger delay
- **Modals:** Spring physics scale-in (stiffness 350, damping 28)
- **Toast:** Slide-in from right with spring exit
- **Seat selection:** Scale pulse on hover, gold highlight on select
- **QR reveal:** 3D Y-rotation flip with scale spring
- **Sidebar items:** Staggered x-slide in on mount
- **Event cards:** y-lift on hover with gold glow border
- **Testimonials:** AnimatePresence fade-swap with dot progress

---

## 🔧 Production Build

```bash
# Frontend
cd frontend && npm run build

# Serve with any static host (Vercel, Netlify, etc.)
# Set VITE_API_URL env var if backend is on a different domain

# Backend
cd backend && npm start
# Deploy to Railway, Render, Fly.io, etc.
```

---

## 📦 Dependencies Summary

**Backend:** express, bcryptjs, jsonwebtoken, cors, dotenv, uuid, nodemon

**Frontend:** react, react-dom, react-router-dom, framer-motion, qrcode.react, react-big-calendar, moment, date-fns

---

*Built with care for extraordinary moments.* ✨
