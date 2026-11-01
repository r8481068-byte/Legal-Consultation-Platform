import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  to,
  badgeText,
  badgeColor = "emerald", // "emerald" | "amber" | "blue" | "red"
  trend = null, // { value: "+12%", positive: true }
  gradient = "from-blue-900 to-indigo-900",
}) {
  const CardContent = (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md group">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>
            {trend && (
              <span
                className={`inline-flex items-center text-[11px] font-bold ${
                  trend.positive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {trend.positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trend.value}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700 border border-slate-200/80 group-hover:bg-blue-50 group-hover:text-blue-900 group-hover:border-blue-200 transition">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-medium truncate">
          {description}
        </span>
        {badgeText && (
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
              badgeColor === "emerald"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : badgeColor === "amber"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : badgeColor === "red"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {badgeText}
          </span>
        )}
        {to && (
          <span className="inline-flex items-center text-blue-900 font-semibold group-hover:translate-x-0.5 transition shrink-0 ml-2">
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{CardContent}</Link>;
  }

  return CardContent;
}
