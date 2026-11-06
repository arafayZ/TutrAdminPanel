import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import TutorManagement from "./pages/TutorManagement";
import HelpCenter from "./pages/HelpCenter";
import StudentManagement from "./pages/StudentManagement";
import VerificationRequests from "./pages/VerificationRequests";
import Settings from "./pages/Settings";
import CourseManagement from "./pages/Courses";
import ReviewsPage from "./pages/ReviewsPage";
import BlockedPage from "./pages/BlockedPage";
import ReportsPage from "./pages/ReportsPage";
import TeamAccessControlPage from "./pages/TeamAccessControlPage";
import NotificationsPage from "./pages/NotificationsPage";
import ForgotPassword from "./pages/ForgotPassword";

import SuperAdminRoute from "./components/SuperAdminRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ========== PUBLIC ROUTES (no login required) ========== */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ========== PROTECTED ROUTES (require admin_token) ========== */}
        <Route element={<AdminRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/tutors" element={<TutorManagement />} />
          <Route
            path="/tutormanagement"
            element={<Navigate to="/tutors" replace />}
          />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/verifications" element={<VerificationRequests />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/blocked" element={<BlockedPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<HelpCenter />} />

          {/* Super-admin-only — nested inside AdminRoute */}
          <Route
            path="/team"
            element={
              <SuperAdminRoute>
                <TeamAccessControlPage />
              </SuperAdminRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
