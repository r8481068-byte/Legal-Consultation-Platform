import { useState, useEffect, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Users,
  Briefcase,
  ShieldCheck,
  Calendar,
  CreditCard,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import StatCard from "../../components/admin/StatCard";
import {
  getAdminMetrics,
  getAdminAnalytics,
  getAdminRecentActivity
} from "../../services/adminService";

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#64748b"];

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async (range) => {
    setLoading(true);
    setError("");
    try {
      const [metricsRes, analyticsRes, recentRes] = await Promise.all([
        getAdminMetrics({ range }),
        getAdminAnalytics({ range }),
        getAdminRecentActivity()
      ]);
      setMetrics(metricsRes.metrics || {});
      setAnalytics(analyticsRes.analytics || {});
      setRecent(recentRes.activity || {});
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError(err.message || "Failed to load dashboard metrics from server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(dateRange);
  }, [dateRange, loadDashboardData]);

  if (loading && !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const u = metrics?.users || {};
  const v = metrics?.lawyerVerifications || {};
  const a = metrics?.appointments || {};
  const f = metrics?.financials || {};

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Platform Overview
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              Live MongoDB Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry and management controls across all LegalConnect operations.
          </p>
        </div>

        {/* Date Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-xs">
          {[
            { label: "Today", value: "today" },
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "3 Months", value: "3m" },
            { label: "6 Months", value: "6m" },
            { label: "This Year", value: "1y" }
          ].map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setDateRange(chip.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                dateRange === chip.value
                  ? "bg-blue-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadDashboardData(dateRange)}
            className="rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-800 hover:bg-red-200 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROW 1: USER, CLIENT, LAWYER, VERIFICATION KPI CARDS                       */}
      {/* ========================================================================= */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          User & Advocate Metrics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Users"
            value={u.total || 0}
            description={`+${u.rangeRegistrations || 0} in selected period`}
            icon={Users}
            to="/admin/clients"
            badgeText={`${u.activeClients || 0} Active`}
            badgeColor="emerald"
          />

          <StatCard
            title="Total Clients"
            value={u.clients || 0}
            description={`${u.blockedClients || 0} currently blocked`}
            icon={UserCheck}
            to="/admin/clients"
            badgeText={`${u.activeClients || 0} Active`}
            badgeColor="blue"
          />

          <StatCard
            title="Total Advocates"
            value={u.lawyers || 0}
            description={`${u.blockedLawyers || 0} currently blocked`}
            icon={Briefcase}
            to="/admin/lawyers"
            badgeText={`${u.activeLawyers || 0} Active`}
            badgeColor="blue"
          />

          <StatCard
            title="Verified Advocates"
            value={v.verified || 0}
            description={`${v.pending || 0} applications pending`}
            icon={ShieldCheck}
            to="/admin/lawyer-verification"
            badgeText={v.pending > 0 ? `${v.pending} Pending` : "All Reviewed"}
            badgeColor={v.pending > 0 ? "amber" : "emerald"}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: APPOINTMENT, PAYMENT, REVENUE KPI CARDS                            */}
      {/* ========================================================================= */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Appointments & Financial Operations
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Consultations"
            value={a.total || 0}
            description={`${a.confirmed || 0} confirmed, ${a.completed || 0} done`}
            icon={Calendar}
            to="/admin/appointments"
            badgeText={`${a.pending || 0} Pending`}
            badgeColor="amber"
          />

          <StatCard
            title="Successful Payments"
            value={f.totalTransactions || 0}
            description={`${f.totalRefundsCount || 0} refunds processed`}
            icon={CreditCard}
            to="/admin/payments"
            badgeText="Captured"
            badgeColor="emerald"
          />

          <StatCard
            title="Gross Collected"
            value={`₹${(f.grossRevenueRupees || 0).toLocaleString("en-IN")}`}
            description="Total captured consultation fees"
            icon={IndianRupee}
            to="/admin/payments"
            badgeText="Gross Volume"
            badgeColor="blue"
          />

          <StatCard
            title="Net Collected Revenue"
            value={`₹${(f.netRevenueRupees || 0).toLocaleString("en-IN")}`}
            description={`After ₹${(f.refundAmountRupees || 0).toLocaleString("en-IN")} refunds`}
            icon={TrendingUp}
            to="/admin/payments"
            badgeText="Net Revenue"
            badgeColor="emerald"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: MAIN GRAPH 1 - USER REGISTRATION GROWTH                            */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Graph 1 – User Registration Growth
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily trend of overall, client, and lawyer registrations over the selected interval.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Interval: <strong className="text-blue-900 font-bold uppercase">{dateRange}</strong>
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          {analytics?.userGrowth && analytics.userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.userGrowth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px"
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="total" name="Total Users" stroke="#1e3a8a" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="client" name="Clients" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="lawyer" name="Advocates" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No registration entries found for this date boundary.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 4: GRAPH 2 (APPOINTMENTS) & GRAPH 3 (LAWYER VERIFICATION)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 2 - Appointment Analytics Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Graph 2 – Appointment Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of appointment statuses in the database.
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            {analytics?.appointmentStatuses ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Pending", count: analytics.appointmentStatuses.pending || 0, fill: "#f59e0b" },
                    { name: "Confirmed", count: analytics.appointmentStatuses.confirmed || 0, fill: "#3b82f6" },
                    { name: "Completed", count: analytics.appointmentStatuses.completed || 0, fill: "#10b981" },
                    { name: "Cancelled", count: analytics.appointmentStatuses.cancelled || 0, fill: "#ef4444" },
                    { name: "Rejected", count: analytics.appointmentStatuses.rejected || 0, fill: "#64748b" }
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="count" name="Appointments" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Graph 3 - Lawyer Verification Analytics Donut/Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Graph 3 – Lawyer Verification Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current state of advocate credential applications.
            </p>
          </div>

          <div className="h-64 w-full pt-2 flex items-center justify-center">
            {analytics?.verificationStatuses ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Pending", value: analytics.verificationStatuses.pending || 0 },
                      { name: "Under Review", value: analytics.verificationStatuses.under_review || 0 },
                      { name: "Approved", value: analytics.verificationStatuses.approved || 0 },
                      { name: "Rejected", value: analytics.verificationStatuses.rejected || 0 },
                      { name: "Info Required", value: analytics.verificationStatuses.additional_info_required || 0 },
                      { name: "Suspended", value: analytics.verificationStatuses.suspended || 0 }
                    ].filter((item) => item.value > 0)}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {PIE_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 5: GRAPH 4 (REVENUE AREA) & GRAPH 5 (CLIENT VS LAWYER BARS)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 4 - Revenue Analytics Area Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Graph 4 – Revenue Analytics (₹)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gross captured vs refunds vs net revenue over time.
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            {analytics?.revenueTrend && analytics.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, ""]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="gross" name="Gross Captured" stroke="#1e3a8a" fillOpacity={1} fill="url(#colorGross)" />
                  <Area type="monotone" dataKey="net" name="Net Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorNet)" />
                  <Area type="monotone" dataKey="refund" name="Refunds" stroke="#ef4444" fill="#fee2e2" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No financial transactions recorded for this period.
              </div>
            )}
          </div>
        </div>

        {/* Graph 5 - Client vs Lawyer Monthly Growth */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Graph 5 – Client vs Lawyer Growth (Monthly)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side monthly registrations comparison.
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            {analytics?.monthlyGrowth && analytics.monthlyGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="clients" name="Clients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lawyers" name="Advocates" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No monthly growth data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 6: GRAPH 6 (SPECIALIZATIONS), GRAPH 7 (TRENDS), GRAPH 8 (PAYMENTS)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Graph 6 - Specialization Analytics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Graph 6 – Lawyer Specializations
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">Top areas of practice in platform.</p>
          <div className="h-52 w-full">
            {analytics?.specializations && analytics.specializations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.specializations} layout="vertical" margin={{ top: 5, right: 15, left: 35, bottom: 0 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "11px"
                    }}
                  />
                  <Bar dataKey="count" name="Lawyers" fill="#1e3a8a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No specializations recorded.
              </div>
            )}
          </div>
        </div>

        {/* Graph 7 - Appointment Trends */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Graph 7 – Appointment Trends
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">Booking volume over selected window.</p>
          <div className="h-52 w-full">
            {analytics?.appointmentTrends && analytics.appointmentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.appointmentTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "11px"
                    }}
                  />
                  <Line type="monotone" dataKey="count" name="Bookings" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No appointments in interval.
              </div>
            )}
          </div>
        </div>

        {/* Graph 8 - Payment Analytics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Graph 8 – Payment Status Breakdown
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">Transaction gateway outcomes.</p>
          <div className="h-52 w-full">
            {analytics?.paymentStatuses ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Captured", count: analytics.paymentStatuses.captured?.count || 0, fill: "#10b981" },
                    { name: "Refunded", count: analytics.paymentStatuses.refunded?.count || 0, fill: "#ef4444" },
                    { name: "Failed", count: analytics.paymentStatuses.failed?.count || 0, fill: "#64748b" }
                  ]}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "11px"
                    }}
                  />
                  <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 7: RECENT ACTIVITIES (6 SECTIONS WITH VIEW ALL LINKS)                  */}
      {/* ========================================================================= */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">
          Live Platform Activity Feeds
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Recent Registrations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-900" />
                  Recent Registrations
                </span>
                <Link to="/admin/clients" className="text-[11px] font-bold text-blue-900 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recent?.recentRegistrations && recent.recentRegistrations.length > 0 ? (
                  recent.recentRegistrations.map((u) => (
                    <div key={u._id} className="flex items-center justify-between text-xs">
                      <div className="truncate max-w-[180px]">
                        <p className="font-bold text-slate-800 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.role === "lawyer" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent users.</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Recent Lawyer Applications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Recent Applications
                </span>
                <Link to="/admin/lawyer-verification" className="text-[11px] font-bold text-blue-900 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recent?.recentApplications && recent.recentApplications.length > 0 ? (
                  recent.recentApplications.map((l) => (
                    <div key={l._id} className="flex items-center justify-between text-xs">
                      <div className="truncate max-w-[170px]">
                        <p className="font-bold text-slate-800 truncate">{l.user?.name || "Advocate"}</p>
                        <p className="text-[11px] text-slate-400 truncate">Bar: {l.barCouncilId}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        l.verificationStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {l.verificationStatus}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No applications.</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Recent Appointments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-700" />
                  Recent Appointments
                </span>
                <Link to="/admin/appointments" className="text-[11px] font-bold text-blue-900 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recent?.recentAppointments && recent.recentAppointments.length > 0 ? (
                  recent.recentAppointments.map((a) => (
                    <div key={a._id} className="flex items-center justify-between text-xs">
                      <div className="truncate max-w-[170px]">
                        <p className="font-bold text-slate-800 truncate">{a.client?.name || "Client"}</p>
                        <p className="text-[11px] text-slate-400 truncate">with {a.lawyer?.user?.name || "Lawyer"}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold capitalize">
                        {a.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No appointments.</p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Recent Payments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  Recent Payments
                </span>
                <Link to="/admin/payments" className="text-[11px] font-bold text-blue-900 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recent?.recentPayments && recent.recentPayments.length > 0 ? (
                  recent.recentPayments.map((p) => (
                    <div key={p._id} className="flex items-center justify-between text-xs">
                      <div className="truncate max-w-[170px]">
                        <p className="font-bold text-slate-800 truncate">{p.client?.name || "Client"}</p>
                        <p className="text-[11px] text-slate-400 truncate">{p.razorpayPaymentId || p._id}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-blue-900">₹{p.amountRupees}</span>
                        <p className="text-[9px] text-emerald-600 font-bold capitalize">{p.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No transactions.</p>
                )}
              </div>
            </div>
          </div>

          {/* 5. Recent Complaints */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Support Tickets
                </span>
                <Link to="/admin/complaints" className="text-[11px] font-bold text-blue-900 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recent?.recentComplaints && recent.recentComplaints.length > 0 ? (
                  recent.recentComplaints.map((c) => (
                    <div key={c._id} className="flex items-center justify-between text-xs">
                      <div className="truncate max-w-[180px]">
                        <p className="font-bold text-slate-800 truncate">{c.subject}</p>
                        <p className="text-[11px] text-slate-400 truncate">By: {c.submittedBy?.name || "User"}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                        c.status === "open" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No open complaints.</p>
                )}
              </div>
            </div>
          </div>

          {/* 6. Recent Admin Activities */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-indigo-700" />
                  Admin Audit Log
                </span>
                <Link to="/admin/activity-logs" className="text-[11px] font-bold text-blue-900 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recent?.recentAdminLogs && recent.recentAdminLogs.length > 0 ? (
                  recent.recentAdminLogs.map((log) => (
                    <div key={log._id} className="text-xs border-b border-slate-50 pb-2 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">{log.adminName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{log.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent admin logs.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
