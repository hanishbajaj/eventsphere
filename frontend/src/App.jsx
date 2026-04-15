// App.jsx — Root component with routing
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import { PageTransition } from './components/Interactive';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import TicketPage from './pages/TicketPage';

// Dashboards
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import SponsorDashboard from './pages/sponsor/SponsorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Pages that show the navbar
const SHOW_NAV_PATHS = ['/', '/events', '/login', '/register'];
function shouldShowNav(pathname) {
  return (
    SHOW_NAV_PATHS.includes(pathname) ||
    pathname.startsWith('/events/') ||
    pathname.startsWith('/ticket/')
  );
}

function AppLayout({ children }) {
  return (
    <div className="page-wrapper">
      {children}
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes with Navbar */}
        <Route path="/" element={<><Navbar /><PageTransition><Landing /></PageTransition></>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/events" element={<><Navbar /><PageTransition><Events /></PageTransition></>} />
        <Route path="/events/:id" element={<><Navbar /><PageTransition><EventDetail /></PageTransition></>} />
        <Route path="/ticket/:id" element={<><Navbar /><PageTransition><TicketPage /></PageTransition></>} />

        {/* Buyer dashboard routes */}
        <Route path="/dashboard/buyer" element={
          <ProtectedRoute roles={['buyer']}>
            <><Navbar /><PageTransition><BuyerDashboard tab="Overview" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/buyer/tickets" element={
          <ProtectedRoute roles={['buyer']}>
            <><Navbar /><PageTransition><BuyerDashboard tab="My Tickets" /></PageTransition></>
          </ProtectedRoute>
        } />

        {/* Organizer dashboard routes */}
        <Route path="/dashboard/organizer" element={
          <ProtectedRoute roles={['organizer']}>
            <><Navbar /><PageTransition><OrganizerDashboard tab="Overview" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/organizer/events" element={
          <ProtectedRoute roles={['organizer']}>
            <><Navbar /><PageTransition><OrganizerDashboard tab="My Events" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/organizer/create" element={
          <ProtectedRoute roles={['organizer']}>
            <><Navbar /><PageTransition><OrganizerDashboard tab="Create Event" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/organizer/sponsors" element={
          <ProtectedRoute roles={['organizer']}>
            <><Navbar /><PageTransition><OrganizerDashboard tab="Sponsor Requests" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/organizer/poster" element={
          <ProtectedRoute roles={['organizer']}>
            <><Navbar /><PageTransition><OrganizerDashboard tab="Poster Generator" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/organizer/analytics" element={
          <ProtectedRoute roles={['organizer']}>
            <><Navbar /><PageTransition><OrganizerDashboard tab="Analytics" /></PageTransition></>
          </ProtectedRoute>
        } />

        {/* Sponsor dashboard routes */}
        <Route path="/dashboard/sponsor" element={
          <ProtectedRoute roles={['sponsor']}>
            <><Navbar /><PageTransition><SponsorDashboard tab="Overview" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/sponsor/calendar" element={
          <ProtectedRoute roles={['sponsor']}>
            <><Navbar /><PageTransition><SponsorDashboard tab="Event Calendar" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/sponsor/requests" element={
          <ProtectedRoute roles={['sponsor']}>
            <><Navbar /><PageTransition><SponsorDashboard tab="My Requests" /></PageTransition></>
          </ProtectedRoute>
        } />

        {/* Admin dashboard routes */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute roles={['admin']}>
            <><Navbar /><PageTransition><AdminDashboard tab="Overview" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/events" element={
          <ProtectedRoute roles={['admin']}>
            <><Navbar /><PageTransition><AdminDashboard tab="All Events" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <><Navbar /><PageTransition><AdminDashboard tab="Users" /></PageTransition></>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/analytics" element={
          <ProtectedRoute roles={['admin']}>
            <><Navbar /><PageTransition><AdminDashboard tab="Analytics" /></PageTransition></>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
