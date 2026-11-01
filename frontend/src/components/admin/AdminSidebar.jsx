import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  Calendar,
  Star,
  CreditCard,
  MessageSquareWarning,
  Bell,
  FileBarChart2,
  History,
  Settings,
  LogOut,
  Scale,
  X
} from "lucide-react";

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  pendingVerifications = 0,
  openComplaints = 0,
  onLogout
}) {
  const navigationSections = [
    {
      group: "Core",
      items: [
        {
          name: "Dashboard",
          to: "/admin/dashboard",
          icon: LayoutDashboard,
          badge: null
        }
      ]
    },
    {
      group: "User Management",
      items: [
        {
          name: "Manage Clients",
          to: "/admin/clients",
          icon: Users,
          badge: null
        },
        {
          name: "Manage Lawyers",
          to: "/admin/lawyers",
          icon: Briefcase,
          badge: null
        },
        {
          name: "Lawyer Verification",
          to: "/admin/lawyer-verification",
          icon: ShieldCheck,
          badge: pendingVerifications > 0 ? pendingVerifications : null,
          badgeColor: "bg-amber-500 text-white"
        }
      ]
    },
    {
      group: "Platform Operations",
      items: [
        {
          name: "Appointments",
          to: "/admin/appointments",
          icon: Calendar,
          badge: null
        },
        {
          name: "Reviews & Ratings",
          to: "/admin/reviews",
          icon: Star,
          badge: null
        },
        {
          name: "Payments & Refunds",
          to: "/admin/payments",
          icon: CreditCard,
          badge: null
        },
        {
          name: "Complaints & Support",
          to: "/admin/complaints",
          icon: MessageSquareWarning,
          badge: openComplaints > 0 ? openComplaints : null,
          badgeColor: "bg-red-500 text-white"
        }
      ]
    },
    {
      group: "System & Insights",
      items: [
        {
          name: "Notifications",
          to: "/admin/notifications",
          icon: Bell,
          badge: null
        },
        {
          name: "Reports & Analytics",
          to: "/admin/reports",
          icon: FileBarChart2,
          badge: null
        },
        {
          name: "Activity Logs",
          to: "/admin/activity-logs",
          icon: History,
          badge: null
        },
        {
          name: "Admin Settings",
          to: "/admin/settings",
          icon: Settings,
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xs">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">LegalConnect</span>
                <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-amber-400 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise Management</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navigationSections.map((section) => (
            <div key={section.group}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {section.group}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-blue-600/20 text-white font-bold border border-blue-500/30 shadow-xs"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`h-4 w-4 transition ${
                                isActive
                                  ? "text-amber-400"
                                  : "text-slate-400 group-hover:text-slate-200"
                              }`}
                            />
                            <span>{item.name}</span>
                          </div>

                          {item.badge !== null && item.badge !== undefined && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                item.badgeColor || "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Logout */}
        <div className="border-t border-slate-800/80 p-3.5">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
