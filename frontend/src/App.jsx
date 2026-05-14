import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; 
import ProtectedRoute from './components/ProtectedRoute';


import LandingPage from './pages/LandingPage';
import EventFeed from './pages/EventFeed';
import OrganizerDashboard from './pages/OrganizerDashboard'; 
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Register from './pages/Register';
import RegisterOrganizer from './pages/RegisterOrganizer';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import QRScanner from './pages/QRScanner';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16"> 
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventFeed />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-organizer" element={<RegisterOrganizer />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Protected Department Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Admin Panel */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Event Creation */}
          <Route 
            path="/create-event" 
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />

          {/* QR Scanner — organizers & admins only */}
          <Route
            path="/scan"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <QRScanner />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;