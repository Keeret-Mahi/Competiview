"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ThreatFeed from "@/components/dashboard/ThreatFeed";
import type { Competitor } from "@/app/onboarding/page";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedCompetitors, setSelectedCompetitors] = useState<Competitor[]>([]);

  useEffect(() => {
    // TODO: Replace with actual data fetching from backend/local storage
    // For now, check if we have competitors from onboarding
    // This is a placeholder - in production, fetch from API/local storage
    try {
      const storedData = localStorage.getItem("onboarding_data");
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.competitors && Array.isArray(data.competitors) && data.competitors.length > 0) {
          const filtered = data.competitors.filter((c: Competitor) => c.selected);
          if (filtered.length > 0) {
            setSelectedCompetitors(filtered);
            return;
          }
        }
      }

      // Fallback: Use mock competitors for demo if no data found
      // TODO: Remove this when backend is ready
      const mockCompetitors: Competitor[] = [
        {
          id: "1",
          name: "Acme Analytics",
          domain: "acmeanalytics.io",
          initial: "A",
          color: "indigo",
          matchScore: 98,
          selected: true,
        },
        {
          id: "2",
          name: "DataFlow Inc",
          domain: "dataflow.com",
          initial: "D",
          color: "orange",
          matchScore: 94,
          selected: true,
        },
        {
          id: "3",
          name: "MetricsHive",
          domain: "metricshive.co",
          initial: "M",
          color: "green",
          matchScore: 88,
          selected: true,
        },
      ];
      setSelectedCompetitors(mockCompetitors);
    } catch (e) {
      console.error("Error loading competitors:", e);
      // Set empty array on error - user can go through onboarding
      setSelectedCompetitors([]);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fbfc]">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-[#f8fbfc]">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <StatsGrid />
            <ThreatFeed competitors={selectedCompetitors} />
          </div>
        </div>
      </main>
    </div>
  );
}
