"use client";

interface StatCardProps {
  label: string;
  value: number;
  trend: {
    value: string;
    isPositive: boolean;
    type: "success" | "danger" | "neutral";
  };
  icon: string;
  iconColor: string;
  iconBg: string;
}

function StatCard({ label, value, trend, icon, iconColor, iconBg }: StatCardProps) {
  const trendColors = {
    success: "text-success bg-success/10",
    danger: "text-danger bg-danger/10",
    neutral: "text-[#49879c] bg-gray-100",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#cee2e8] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#49879c]">{label}</p>
        <span className={`material-symbols-outlined ${iconColor} ${iconBg} p-1 rounded text-xl`}>
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-[#0d181c]">{value}</p>
        <span className={`flex items-center text-xs font-medium ${trendColors[trend.type]} px-1.5 py-0.5 rounded`}>
          <span className={`material-symbols-outlined text-[14px] mr-0.5 ${trend.isPositive ? "" : "rotate-180"}`}>
            trending_up
          </span>
          {trend.value}
        </span>
      </div>
    </div>
  );
}

export default function StatsGrid() {
  const stats = [
    {
      label: "Total Threats",
      value: 142,
      trend: { value: "+12%", isPositive: true, type: "success" as const },
      icon: "security",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "High Severity",
      value: 8,
      trend: { value: "+5%", isPositive: false, type: "danger" as const },
      icon: "warning",
      iconColor: "text-danger",
      iconBg: "bg-danger/10",
    },
    {
      label: "Monitored Orgs",
      value: 12,
      trend: { value: "0%", isPositive: true, type: "neutral" as const },
      icon: "domain",
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
    {
      label: "Recent Changes",
      value: 24,
      trend: { value: "+15%", isPositive: true, type: "success" as const },
      icon: "history",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
