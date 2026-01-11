"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ThreatFeed from "@/components/dashboard/ThreatFeed";
import UpdatesFeed from "@/components/dashboard/UpdatesFeed";
import type { Competitor } from "@/app/onboarding/page";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedCompetitors, setSelectedCompetitors] = useState<Competitor[]>([]);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | undefined>();

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

  const handleCheckNow = async () => {
    try {
      setChecking(true);
      console.log('🔄 Manual check triggered');
      
      // Get competitors to check (use pizza demo if none selected)
      const baseUrl = window.location.origin;
      const competitorsToCheck = selectedCompetitors.length > 0 
        ? selectedCompetitors 
        : [{
            id: 'pizza-demo',
            name: 'Slice & Wood Pizzeria',
            domain: `${baseUrl}/api/demo/pizza-website`,
            initial: 'S',
            color: 'red',
            matchScore: 100,
            selected: true,
          }];
      
      const response = await fetch('/api/monitoring/menu/check-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors: competitorsToCheck }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to check for updates');
      }
      
      const result = await response.json();
      console.log('✅ Check complete:', result);
      
      setLastCheckedAt(new Date());
      
      // Refresh the updates feed will happen automatically via useEffect
      // But we can trigger a small delay to ensure server state is updated
      setTimeout(() => {
        window.location.reload(); // Simple refresh to show new updates
      }, 500);
    } catch (error: any) {
      console.error('❌ Error checking for updates:', error);
      alert(`Failed to check for updates: ${error.message}`);
    } finally {
      setChecking(false);
    }
  };

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
