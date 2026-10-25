import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ProfileSettingsModal from "./ProfileSettingsModal";
import { useAuth } from "../context/AuthContext";

export default function PublicLayout() {
  const { user } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Universal Two-Tier Header */}
      <Header onOpenProfileSettings={() => setProfileModalOpen(true)} />

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Universal 4-Column Footer */}
      <Footer />

      {/* Profile Settings Modal when triggered by authenticated user in My Account menu */}
      {user && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
