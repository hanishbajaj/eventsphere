// models/seed.js — Seeds default users and sample events
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Users, Events, Tickets, SponsorRequests } = require('./db');

const CATEGORIES = ['Concert / Music', 'Sports', 'Conference', 'Workshop', 'Theater', 'Festival', 'Webinar', 'Charity Gala'];

// Generate seat array based on category — only for appropriate event types
function generateSeats(category) {
  const pitCategories = ['Concert / Music', 'Festival'];
  const gridCategories = ['Theater', 'Sports', 'Charity Gala'];

  if (pitCategories.includes(category)) {
    return [
      { id: 'fp', zone: 'Front Pit', capacity: 10, booked: 4, type: 'pit' },
      { id: 'mp', zone: 'Main Pit', capacity: 20, booked: 8, type: 'pit' },
      { id: 'gp', zone: 'General Pit', capacity: 20, booked: 5, type: 'pit' },
    ];
  }

  if (gridCategories.includes(category)) {
    return Array.from({ length: 40 }, (_, i) => ({
      id: `S${i + 1}`,
      number: i + 1,
      row: String.fromCharCode(65 + Math.floor(i / 10)),
      status: Math.random() > 0.3 ? 'available' : 'booked',
      type: 'seat',
    }));
  }

  // Conference, Workshop, Webinar — general admission, no seats
  return [];
}

const sampleEvents = [
  {
    title: 'Nocturne: A Symphony Under the Stars',
    category: 'Concert / Music',
    date: '2025-08-15T20:00:00Z',
    endDate: '2025-08-15T23:00:00Z',
    venue: 'Amphitheatre du Parc',
    address: '1600 Pennsylvania Ave NW, Washington DC',
    description: 'An enchanting evening of classical fusion where orchestral strings meet electronic beats. Experience music as you\'ve never heard it before under an open sky.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    price: 7000,    // ₹7,000 (Concert)
    tags: ['classical', 'electronic', 'outdoor'],
    status: 'approved',
    featured: true,
  },
  {
    title: 'TechSummit 2025: AI & The Human Frontier',
    category: 'Conference',
    date: '2025-09-10T09:00:00Z',
    endDate: '2025-09-12T18:00:00Z',
    venue: 'Grand Convention Center',
    address: '747 Howard St, San Francisco, CA 94103',
    description: 'Three days of visionary talks, panel discussions, and hands-on workshops from the world\'s leading AI researchers and tech entrepreneurs.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    price: 37000,   // ₹37,000 (Conference)
    tags: ['AI', 'technology', 'networking'],
    status: 'approved',
    featured: true,
  },
  {
    title: 'Crimson Stage: Hamlet Reimagined',
    category: 'Theater',
    date: '2025-08-22T19:30:00Z',
    endDate: '2025-08-22T22:00:00Z',
    venue: 'The Meridian Playhouse',
    address: '115 W 65th St, New York, NY 10023',
    description: 'A bold modern retelling of Shakespeare\'s masterpiece set in a corporate dystopia. Winner of four Westie Awards for Outstanding Production.',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    price: 9900,    // ₹9,900 (Theater)
    tags: ['shakespeare', 'drama', 'theater'],
    status: 'approved',
    featured: false,
  },
  {
    title: 'City Marathon Championship 2025',
    category: 'Sports',
    date: '2025-10-05T07:00:00Z',
    endDate: '2025-10-05T14:00:00Z',
    venue: 'City Center Starting Line',
    address: '233 S Wacker Dr, Chicago, IL 60606',
    description: 'The premier city marathon with 10K, 21K, and 42K routes. Spectator stands available along the course with VIP viewing areas.',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80',
    price: 2900,    // ₹2,900 (Sports)
    tags: ['marathon', 'running', 'outdoor'],
    status: 'approved',
    featured: false,
  },
  {
    title: 'Aurora Festival of Lights',
    category: 'Festival',
    date: '2025-12-01T17:00:00Z',
    endDate: '2025-12-03T22:00:00Z',
    venue: 'Riverside Cultural Park',
    address: '600 Festival Dr, Austin, TX 78701',
    description: 'A three-day celebration of art, music, and light installations. Over 200 artists, 40 live performances, and immersive light sculptures spread across 15 acres.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    price: 5400,    // ₹5,400 (Festival)
    tags: ['art', 'lights', 'family'],
    status: 'approved',
    featured: true,
  },
  {
    title: 'UX Mastery Workshop: Designing for Emotion',
    category: 'Workshop',
    date: '2025-09-20T10:00:00Z',
    endDate: '2025-09-20T17:00:00Z',
    venue: 'The Design Loft',
    address: '88 Colin P Kelly Jr St, San Francisco, CA',
    description: 'An intensive hands-on workshop with industry leaders on crafting emotionally resonant digital experiences. Limited to 30 participants.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    price: 24900,   // ₹24,900 (Workshop)
    tags: ['design', 'UX', 'skills'],
    status: 'approved',
    featured: false,
  },
  {
    title: 'Future of Web3 — Global Webinar',
    category: 'Webinar',
    date: '2025-08-28T14:00:00Z',
    endDate: '2025-08-28T16:00:00Z',
    venue: 'Online (Zoom)',
    address: 'Virtual Event',
    description: 'Join 5,000+ developers and investors for a live deep dive into emerging Web3 technologies, DeFi trends, and blockchain infrastructure.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    price: 0,
    tags: ['web3', 'blockchain', 'online'],
    status: 'approved',
    featured: false,
  },
  {
    title: 'Gala for Education: A Night of Giving',
    category: 'Charity Gala',
    date: '2025-11-14T18:00:00Z',
    endDate: '2025-11-14T23:00:00Z',
    venue: 'The Ritz-Carlton Grand Ballroom',
    address: '1150 22nd St NW, Washington, DC 20037',
    description: 'An elegant black-tie gala raising funds for underprivileged schools across 12 states. Silent auction, live entertainment, and a 3-course dinner.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    price: 41000,   // ₹41,000 (Charity Gala)
    tags: ['charity', 'education', 'formal'],
    status: 'approved',
    featured: true,
  },
];

async function seedDatabase() {
  // Seed users only if empty
  if (Users.count() === 0) {
    const hash = (pw) => bcrypt.hashSync(pw, 10);
    const seedUsers = [
      { id: uuidv4(), name: 'Admin User', email: 'admin@eventsphere.com', password: hash('Admin123!'), role: 'admin', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AU&backgroundColor=c9a84c' },
      { id: uuidv4(), name: 'Alex Organizer', email: 'organizer@eventsphere.com', password: hash('Organizer1!'), role: 'organizer', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AO&backgroundColor=4c7bc9' },
      { id: uuidv4(), name: 'Sam Sponsor', email: 'sponsor@eventsphere.com', password: hash('Sponsor1!'), role: 'sponsor', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SS&backgroundColor=4cc97b', company: 'TechCorp Inc.', budget: 50000 },
      { id: uuidv4(), name: 'Jamie Buyer', email: 'buyer@eventsphere.com', password: hash('Buyer123!'), role: 'buyer', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JB&backgroundColor=c94c4c' },
    ];
    seedUsers.forEach(u => Users.create(u));
    console.log('✅ Seeded default users');
  }

  // Seed events only if empty
  if (Events.count() === 0) {
    const organizer = Users.findOne({ role: 'organizer' });
    sampleEvents.forEach(ev => {
      Events.create({
        id: uuidv4(),
        ...ev,
        organizerId: organizer?.id,
        organizerName: organizer?.name,
        seats: generateSeats(ev.category),
        ticketsSold: Math.floor(Math.random() * 30),
        revenue: 0,
        sponsorRequests: [],
      });
    });
    console.log('✅ Seeded sample events');
  }
}

module.exports = { seedDatabase };