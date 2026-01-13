"use client";

import { useEffect, useState } from "react";

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

type StatItem = {
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
};

export default function StatsGrid() {
  const [stats, setStats] = useState<StatItem[]>([
    {
      label: "Total Threats",
      value: 0,
      trend: { value: "0%", isPositive: true, type: "success" },
      icon: "security",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "High Severity",
      value: 0,
      trend: { value: "0%", isPositive: false, type: "danger" },
      icon: "warning",
      iconColor: "text-danger",
      iconBg: "bg-danger/10",
    },
    {
      label: "Monitored Orgs",
      value: 1,
      trend: { value: "0%", isPositive: true, type: "neutral" },
      icon: "domain",
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
    {
      label: "Recent Changes",
      value: 0,
      trend: { value: "0%", isPositive: true, type: "success" },
      icon: "history",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10",
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        
        const totalThreatsTrend = parseFloat(data.trends.totalThreats.replace('%', ''));
        const recentChangesTrend = parseFloat(data.trends.recentChanges.replace('%', ''));
        
        const getTrendType = (trend: number): "success" | "danger" | "neutral" => {
          if (trend > 0) return "success";
          if (trend < 0) return "danger";
          return "neutral";
        };

        setStats([
          {
            label: "Total Threats",
            value: data.totalThreats,
            trend: { 
              value: `${totalThreatsTrend >= 0 ? '+' : ''}${data.trends.totalThreats}`, 
              isPositive: totalThreatsTrend >= 0, 
              type: getTrendType(totalThreatsTrend)
            },
            icon: "security",
            iconColor: "text-primary",
            iconBg: "bg-primary/10",
          },
          {
            label: "High Severity",
            value: data.highSeverity,
            trend: { value: data.trends.highSeverity, isPositive: false, type: "danger" },
            icon: "warning",
            iconColor: "text-danger",
            iconBg: "bg-danger/10",
          },
          {
            label: "Monitored Orgs",
            value: data.monitoredOrgs,
            trend: { value: data.trends.monitoredOrgs, isPositive: true, type: "neutral" },
            icon: "domain",
            iconColor: "text-warning",
            iconBg: "bg-warning/10",
          },
          {
            label: "Recent Changes",
            value: data.recentChanges,
            trend: { 
              value: `${recentChangesTrend >= 0 ? '+' : ''}${data.trends.recentChanges}`, 
              isPositive: recentChangesTrend >= 0, 
              type: getTrendType(recentChangesTrend)
            },
            icon: "history",
            iconColor: "text-purple-500",
            iconBg: "bg-purple-500/10",
          },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Keep default stats on error
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
