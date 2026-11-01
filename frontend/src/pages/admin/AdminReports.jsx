import { useState, useEffect, useCallback } from "react";
import {
  FileBarChart2,
  Download,
  Calendar,
  Filter,
  Users,
  Briefcase,
  CreditCard,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Table,
  RotateCcw
} from "lucide-react";
import { getAdminReports } from "../../services/adminService";

export default function AdminReports() {
  const [reportType, setReportType] = useState("users");
  const [range, setRange] = useState("30d");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const reportTypes = [
    { label: "User Registrations", value: "users", icon: Users },
    { label: "Advocates & Verification", value: "lawyers", icon: Briefcase },
    { label: "Consultation Bookings", value: "appointments", icon: Calendar },
    { label: "Payments & Revenue Ledger", value: "payments", icon: CreditCard },
    { label: "Reviews & Ratings Audit", value: "reviews", icon: Star }
  ];

  const loadReportData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminReports(reportType, { range });
      setData(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to generate report from database records");
    } finally {
      setLoading(false);
    }
  }, [reportType, range]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Export to CSV helper
  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    setExporting(true);
    try {
      const headers = Object.keys(data[0]);
      const csvRows = [];
      csvRows.push(headers.join(","));

      for (const row of data) {
        const values = headers.map((header) => {
          const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : "";
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      }

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `LegalConnect_${reportType}_report_${range}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("CSV Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart2 className="h-6 w-6 text-blue-900" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Reports & Data Exports
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate audit-ready reports from actual MongoDB records and export clean CSV datasets.
          </p>
        </div>

        <button
          type="button"
          onClick={exportToCSV}
          disabled={data.length === 0 || loading || exporting}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span>Export CSV Dataset ({data.length} Rows)</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Report Type Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {reportTypes.map((rt) => {
          const Icon = rt.icon;
          const isSelected = reportType === rt.value;
          return (
            <button
              key={rt.value}
              type="button"
              onClick={() => setReportType(rt.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-blue-900 bg-blue-900 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-5 w-5 mb-2 ${isSelected ? "text-amber-400" : "text-blue-900"}`} />
              <p className="font-bold text-xs">{rt.label}</p>
            </button>
          );
        })}
      </div>

      {/* Date Interval Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="font-bold text-slate-700">Report Window:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { label: "Today", value: "today" },
              { label: "7 Days", value: "7d" },
              { label: "30 Days", value: "30d" },
              { label: "3 Months", value: "3m" },
              { label: "6 Months", value: "6m" },
              { label: "1 Year", value: "1y" }
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  range === r.value
                    ? "bg-blue-900 text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={loadReportData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Live Data Preview Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Live Record Preview ({data.length} records generated)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Source: Live MongoDB Production Collections
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-900" />
              Generating dataset from database records...
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No records found for the selected report type and date range.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {data.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 whitespace-nowrap">
                        {String(row[col] || "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {data.length > 50 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 text-center bg-slate-50/50">
            Preview limited to first 50 rows. Click <strong>Export CSV Dataset</strong> above to download the full {data.length} rows.
          </div>
        )}
      </div>
    </div>
  );
}
