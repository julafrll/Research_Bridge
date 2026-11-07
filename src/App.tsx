import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingPage } from '@/components/ui';

// Public pages
import { LandingPage } from '@/pages/public/LandingPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { GuidelinesPage } from '@/pages/public/GuidelinesPage';
import { GalleryPage, GalleryProjectPage } from '@/pages/public/GalleryPage';
import { JudgesPage, WinnersPage, ContactPage } from '@/pages/public/InfoPages';
import { PublicLayout } from '@/layouts/PublicLayout';
import { CompetitionEntryPage } from '@/pages/student/CompetitionEntryPage';
import { AdminCompetition } from '@/pages/admin/AdminCompetition';
import { FEATURES } from '@/config/features';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';

// Student layout + pages
import { StudentLayout } from '@/layouts/StudentLayout';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { StudentLearn, StudentCourseDetail } from '@/pages/student/StudentLearn';
import { StudentProfile } from '@/pages/student/StudentProfile';

// Admin layout + pages
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminOverview } from '@/pages/admin/AdminOverview';
import { AdminStudents } from '@/pages/admin/AdminStudents';
import { AdminCourses } from '@/pages/admin/AdminCourses';
import { AdminAssignments } from '@/pages/admin/AdminAssignments';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';

// Placeholder
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { FileText, Inbox, Microscope, Megaphone, Bell, Settings } from 'lucide-react';

function AppRoutes() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingPage message="Loading Research Bridge..." />;
  }

  return (
    <Routes>
      {/* Public competition site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:projectId" element={<GalleryProjectPage />} />
        <Route path="/judges" element={<JudgesPage />} />
        <Route path="/winners" element={<WinnersPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route
        path="/login"
        element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <RegisterPage />}
      />

      {/* Student routes */}
      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/competition" element={<CompetitionEntryPage />} />
        <Route
          path="/dashboard"
          element={FEATURES.videos ? <StudentDashboard /> : <Navigate to="/competition" replace />}
        />
        {FEATURES.videos && (
          <>
            <Route path="/learn" element={<StudentLearn />} />
            <Route path="/learn/:courseId" element={<StudentCourseDetail />} />
            <Route path="/assignments" element={<PlaceholderPage title="Assignments" description="View and submit your assignments." icon={<FileText className="h-6 w-6" />} />} />
            <Route path="/my-submissions" element={<PlaceholderPage title="My Submissions" description="Track your submission status and grades." icon={<Inbox className="h-6 w-6" />} />} />
          </>
        )}
        <Route path="/research-hub" element={<PlaceholderPage title="Research Hub" description="Explore research resources and guides." icon={<Microscope className="h-6 w-6" />} />} />
        <Route path="/announcements" element={<PlaceholderPage title="Announcements" description="Read the latest announcements from your instructors." icon={<Megaphone className="h-6 w-6" />} />} />
        <Route path="/notifications" element={<PlaceholderPage title="Notifications" description="Your in-app notifications and alerts." icon={<Bell className="h-6 w-6" />} />} />
        <Route path="/profile" element={<StudentProfile />} />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={FEATURES.videos ? <AdminOverview /> : <Navigate to="/admin/competition" replace />}
        />
        <Route path="/admin/competition" element={<AdminCompetition />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        {FEATURES.videos && (
          <>
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/assignments" element={<AdminAssignments />} />
            <Route path="/admin/submissions" element={<PlaceholderPage title="Submissions" description="Review and grade student submissions." icon={<Inbox className="h-6 w-6" />} />} />
          </>
        )}
        <Route path="/admin/research-hub" element={<PlaceholderPage title="Research Hub" description="Publish and manage research resources." icon={<Microscope className="h-6 w-6" />} />} />
        <Route path="/admin/announcements" element={<PlaceholderPage title="Announcements" description="Publish announcements to students." icon={<Megaphone className="h-6 w-6" />} />} />
        <Route path="/admin/settings" element={<PlaceholderPage title="Settings" description="Manage platform settings." icon={<Settings className="h-6 w-6" />} />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
