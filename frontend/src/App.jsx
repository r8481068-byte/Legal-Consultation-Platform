import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Lawyers from "./pages/Lawyers";
import LawyerProfile from "./pages/LawyerProfile";
import LegalServices from "./pages/LegalServices";
import LegalServiceDetail from "./pages/LegalServiceDetail";
import HowWeWork from "./pages/HowWeWork";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import LawyerDashboard from "./pages/LawyerDashboard";
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
      <AuthProvider>
        <Routes>
          {/* Public Pages with Common Header & 5-Column Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/lawyers" element={<Lawyers />} />
            <Route path="/lawyers/:lawyerId" element={<LawyerProfile />} />
            <Route path="/legal-services" element={<LegalServices />} />
            <Route path="/legal-services/:categorySlug" element={<LegalServiceDetail />} />
            <Route path="/how-we-work" element={<HowWeWork />} />
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<Navigate to="/login?role=admin" replace />} />
          <Route path="/client/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/lawyer/dashboard" element={<Navigate to="/lawyer-dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

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
