import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ConfirmModal from "./ConfirmModal";
import { getAdminMetrics } from "../../services/adminService";

export default function AdminLayout({ title, dateRange, onDateRangeChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [openComplaints, setOpenComplaints] = useState(0);

  // Auto-fetch badge counts for sidebar
  useEffect(() => {
    async function loadBadges() {
      try {
        const res = await getAdminMetrics({ range: "today" });
        if (res.metrics) {
          setPendingVerifications(res.metrics.lawyerVerifications?.pending || 0);
          setOpenComplaints(res.metrics.support?.openComplaints || 0);
        }
      } catch (err) {
        // Silent background load
      }
    }
    loadBadges();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login?role=admin");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex">
      {/* 1. Fixed Left Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        pendingVerifications={pendingVerifications}
        openComplaints={openComplaints}
        onLogout={() => setLogoutModalOpen(true)}
      />

      {/* 2. Main Layout Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <AdminHeader
          currentTitle={title || "Administration"}
          adminUser={user}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          onLogout={() => setLogoutModalOpen(true)}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          unreadNotificationsCount={openComplaints}
        />

        {/* Main Scrollable Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        title="Sign Out of Admin Portal"
        message="Are you sure you want to end your administrative session? You will need to authenticate again with your administrator credentials."
        confirmText="Sign Out"
        confirmColor="danger"
        onConfirm={handleLogout}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
