import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyAccount from "./pages/VerifyAccount";
import ClientProfileCompletion from "./pages/ClientProfileCompletion";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Lawyers from "./pages/Lawyers";
import LawyersInIndia from "./pages/LawyersInIndia";
import StateLawyersPage from "./pages/StateLawyersPage";
import CityDistrictLawyersPage from "./pages/CityDistrictLawyersPage";
import LawyerProfile from "./pages/LawyerProfile";
import LegalServices from "./pages/LegalServices";
import LegalServiceDetail from "./pages/LegalServiceDetail";
import HowWeWork from "./pages/HowWeWork";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import IpcSections from "./pages/IpcSections";
import IpcSectionDetail from "./pages/IpcSectionDetail";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import LawyerDashboard from "./pages/LawyerDashboard";
import LawyerEditProfile from "./pages/LawyerEditProfile";
import LawyerAvailabilityPage from "./pages/LawyerAvailabilityPage";
import LawyerAboutUs from "./pages/LawyerAboutUs";
import AdminVerification from "./pages/AdminVerification";
import VideoRoom from "./pages/VideoRoom";
import LawyerSignup from "./pages/LawyerSignup";
import LawyerDocumentation from "./pages/LawyerDocumentation";
import AskQuestion from "./pages/AskQuestion";
import LegalAdvice from "./pages/LegalAdvice";
import LegalAid from "./pages/LegalAid";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      {/* Restores scroll to top on every navigation/route change */}
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Public Pages with Common Header & Universal Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/lawyers" element={<Lawyers />} />
            <Route path="/lawyers-in-india" element={<LawyersInIndia />} />
            
            {/* Dedicated Reusable State / UT Location Pages */}
            <Route path="/advocate-lawyer-:stateSlug" element={<StateLawyersPage />} />
            <Route path="/lawyers-in/:stateSlug" element={<StateLawyersPage />} />

            {/* Dedicated Reusable City / District Location Pages */}
            <Route path="/advocate-lawyer-:stateSlug/:citySlug" element={<CityDistrictLawyersPage />} />
            <Route path="/lawyers-in/:stateSlug/:citySlug" element={<CityDistrictLawyersPage />} />

            <Route path="/lawyers/:lawyerId" element={<LawyerProfile />} />
            <Route path="/legal-services" element={<LegalServices />} />
            <Route path="/legal-services/:categorySlug" element={<LegalServiceDetail />} />
            
            {/* How We Work / Consultation Journey with backward-compatible aliases */}
            <Route path="/how-we-work" element={<HowWeWork />} />
            <Route path="/consultation-journey" element={<Navigate to="/how-we-work" replace />} />
            <Route path="/how-it-works" element={<Navigate to="/how-we-work" replace />} />
            <Route path="/howitworks" element={<Navigate to="/how-we-work" replace />} />

            <Route path="/ipc-sections" element={<IpcSections />} />
            <Route path="/ipc-sections/:sectionSlug" element={<IpcSectionDetail />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:articleSlug" element={<BlogDetail />} />
            <Route path="/legal-advice" element={<LegalAdvice />} />
            <Route path="/ask-question" element={<AskQuestion />} />
            <Route path="/legal-aid" element={<LegalAid />} />
            <Route path="/lawyer/signup" element={<LawyerSignup />} />
            <Route path="/lawyer/documentation" element={<LawyerDocumentation />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* Standalone Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/verify" element={<Navigate to="/verify-account" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<Navigate to="/login?role=admin" replace />} />
          <Route path="/client/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/lawyer/dashboard" element={<Navigate to="/lawyer-dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

          {/* Client Profile Completion */}
          <Route
            path="/client/profile-completion"
            element={
              <RoleRoute allowedRole="client">
                <ClientProfileCompletion />
              </RoleRoute>
            }
          />
          <Route path="/profile-completion" element={<Navigate to="/client/profile-completion" replace />} />

          {/* Protected Routes for any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/video-room/:appointmentId" element={<VideoRoom />} />
          </Route>

          {/* Client-only Routes */}
          <Route element={<RoleRoute allowedRole="client" />}>
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
          </Route>

          {/* Lawyer-only Routes */}
          <Route element={<RoleRoute allowedRole="lawyer" />}>
            <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
            <Route path="/lawyer/edit-profile" element={<LawyerEditProfile />} />
            <Route path="/lawyer/profile" element={<Navigate to="/lawyer/edit-profile" replace />} />
            <Route path="/lawyer/availability" element={<LawyerAvailabilityPage />} />
            <Route path="/lawyer/about-us" element={<LawyerAboutUs />} />
            <Route path="/lawyer/about" element={<Navigate to="/lawyer/about-us" replace />} />
          </Route>

          {/* Admin-only Routes */}
          <Route element={<RoleRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminVerification />} />
          </Route>

          {/* Unknown Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
