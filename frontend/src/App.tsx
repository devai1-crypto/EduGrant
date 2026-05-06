import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import { Navbar } from './components/Navbar';

// Pages
import { LandingPage } from './apps/student/LandingPage';
import { StudentPortal } from './apps/student/StudentPortal';
import { StatusPage } from './apps/student/StatusPage';
import { AdminDashboard } from './apps/admin/AdminDashboard';
import { ApplicationDetail } from './apps/admin/ApplicationDetail';
import { AdminLogin } from './apps/admin/AdminLogin';
import { TraceUI } from './apps/trace/TraceUI';

function AppContent() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('edugrant_admin_auth') === 'true';
  });

  const handleLogin = (password: string) => {
    if (password === '13092025') {
      setIsAdmin(true);
      localStorage.setItem('edugrant_admin_auth', 'true');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('edugrant_admin_auth');
  };
  
  return (
    <div className="w-full min-h-screen font-sans overflow-x-hidden bg-[#FAFAF9]">
      <Navbar isAdmin={isAdmin} onLogout={handleLogout} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location?.pathname || 'default'}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<StudentPortal />} />
          <Route path="/status/:runId" element={<StatusPage />} />
          
          {/* Admin Routes with Friction */}
          <Route 
            path="/admin" 
            element={isAdmin ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/admin/applications/:id" 
            element={isAdmin ? <ApplicationDetail /> : <Navigate to="/admin" />} 
          />
          <Route 
            path="/trace/:runId" 
            element={isAdmin ? <TraceUI /> : <Navigate to="/admin" />} 
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
