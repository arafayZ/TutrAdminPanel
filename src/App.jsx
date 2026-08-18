import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import TutorManagement from './pages/TutorManagement';
import HelpCenter from './pages/HelpCenter'; 
import StudentManagement from './pages/StudentManagement';
import VerificationRequests from './pages/VerificationRequests';
import Settings from './pages/Settings';
import CourseManagement from './pages/Courses';
import ReviewsPage from './pages/ReviewsPage';
import BlockedPage from './pages/BlockedPage';
import ReportsPage from './pages/ReportsPage';
import TeamAccessControlPage from './pages/TeamAccessControlPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Route */}
        <Route path="/login" element={<AdminLogin />} />
        
        {/* Main Console Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/tutors" element={<TutorManagement />} />
        <Route path="/tutormanagement" element={<Navigate to="/tutors" replace />} />
        
        {/* Placeholder Routes for Sidebar Items */}
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/verifications" element={<VerificationRequests />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/blocked" element={<BlockedPage />} />
        <Route path="/team" element={<TeamAccessControlPage />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Support */}
        <Route path="/help" element={<HelpCenter />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;