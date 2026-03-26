// App.jsx — Root component with routing
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

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
  return (
    <Routes>
      {/* Public routes with Navbar */}
      <Route path="/" element={<><Navbar /><Landing /></>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/events" element={<><Navbar /><Events /></>} />
      <Route path="/events/:id" element={<><Navbar /><EventDetail /></>} />
      <Route path="/ticket/:id" element={<><Navbar /><TicketPage /></>} />

      {/* Buyer dashboard routes */}
      <Route path="/dashboard/buyer" element={
        <ProtectedRoute roles={['buyer']}>
          <><Navbar /><BuyerDashboard tab="Overview" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/buyer/tickets" element={
        <ProtectedRoute roles={['buyer']}>
          <><Navbar /><BuyerDashboard tab="My Tickets" /></>
        </ProtectedRoute>
      } />

      {/* Organizer dashboard routes */}
      <Route path="/dashboard/organizer" element={
        <ProtectedRoute roles={['organizer']}>
          <><Navbar /><OrganizerDashboard tab="Overview" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/organizer/events" element={
        <ProtectedRoute roles={['organizer']}>
          <><Navbar /><OrganizerDashboard tab="My Events" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/organizer/create" element={
        <ProtectedRoute roles={['organizer']}>
          <><Navbar /><OrganizerDashboard tab="Create Event" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/organizer/sponsors" element={
        <ProtectedRoute roles={['organizer']}>
          <><Navbar /><OrganizerDashboard tab="Sponsor Requests" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/organizer/poster" element={
        <ProtectedRoute roles={['organizer']}>
          <><Navbar /><OrganizerDashboard tab="Poster Generator" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/organizer/analytics" element={
        <ProtectedRoute roles={['organizer']}>
          <><Navbar /><OrganizerDashboard tab="Analytics" /></>
        </ProtectedRoute>
      } />

      {/* Sponsor dashboard routes */}
      <Route path="/dashboard/sponsor" element={
        <ProtectedRoute roles={['sponsor']}>
          <><Navbar /><SponsorDashboard tab="Overview" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/sponsor/calendar" element={
        <ProtectedRoute roles={['sponsor']}>
          <><Navbar /><SponsorDashboard tab="Event Calendar" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/sponsor/requests" element={
        <ProtectedRoute roles={['sponsor']}>
          <><Navbar /><SponsorDashboard tab="My Requests" /></>
        </ProtectedRoute>
      } />

      {/* Admin dashboard routes */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute roles={['admin']}>
          <><Navbar /><AdminDashboard tab="Overview" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/events" element={
        <ProtectedRoute roles={['admin']}>
          <><Navbar /><AdminDashboard tab="All Events" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <><Navbar /><AdminDashboard tab="Users" /></>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/analytics" element={
        <ProtectedRoute roles={['admin']}>
          <><Navbar /><AdminDashboard tab="Analytics" /></>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
