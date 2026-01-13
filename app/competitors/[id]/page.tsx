"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UpdatesFeed from "@/components/dashboard/UpdatesFeed";
import type { Competitor } from "@/app/onboarding/page";

interface MonitoringData {
  competitor: Competitor;
  url: string;
}

const gradientClasses: Record<string, string> = {
  indigo: "bg-gradient-to-br from-blue-500 to-indigo-600",
  orange: "bg-gradient-to-br from-orange-400 to-orange-600",
  green: "bg-gradient-to-br from-green-400 to-green-600",
  purple: "bg-gradient-to-tr from-purple-500 to-pink-500",
  pink: "bg-gradient-to-br from-pink-400 to-pink-600",
  blue: "bg-gradient-to-br from-blue-400 to-blue-600",
  teal: "bg-gradient-to-r from-teal-400 to-green-500",
  yellow: "bg-gradient-to-br from-yellow-400 to-yellow-600",
  red: "bg-gradient-to-br from-red-500 to-red-600",
};

export default function CompetitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const competitorId = params.id as string;

  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingChanges, setCheckingChanges] = useState(false);

  useEffect(() => {
    if (!competitorId) return;

    const fetchMonitoringData = async () => {
      try {
        setLoading(true);
        
        // Get competitor from localStorage (client-side) or use default pizza demo
        let competitor: Competitor | undefined;
        const storedData = localStorage.getItem("onboarding_data");
        
        if (storedData) {
          const data = JSON.parse(storedData);
          competitor = data.competitors?.find((c: Competitor) => c.id === competitorId);
        }
        
        // If not found and it's the pizza demo ID, create it
        if (!competitor && competitorId === 'pizza-demo') {
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          competitor = {
            id: 'pizza-demo',
            name: 'Slice & Wood Pizzeria',
            domain: `${baseUrl}/api/demo/pizza-website`,
            initial: 'S',
            color: 'red',
            matchScore: 100,
            selected: true,
          };
        }
        
        if (!competitor) {
          throw new Error('Competitor not found');
        }

        // Get website URL - always use competitor.domain (which is now guaranteed to be correct for pizza-demo)
        const domain = competitor.domain;
        const url = domain.startsWith('http://') || domain.startsWith('https://')
          ? domain
          : `https://${domain}`;

        // Set monitoring data (updates will be fetched by UpdatesFeed component)
        setMonitoringData({
          competitor,
          url,
        });
      } catch (err: any) {
        console.error('Error loading monitoring data:', err);
        setError(err.message || 'Failed to load monitoring data');
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringData();
  }, [competitorId]);

  const [lastCheckedAt, setLastCheckedAt] = useState<Date | undefined>();

  const handleCheckForChanges = async () => {
    if (!monitoringData) return;

    console.log('🔄 Check for Changes button clicked!');
    setCheckingChanges(true);
    
    try {
      // Get competitors to check
      const competitorsToCheck = [monitoringData.competitor];
      
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
      
      // Refresh the page to show new updates
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error('❌ Error checking for changes:', err);
      alert(`Failed to check for changes: ${err.message}`);
    } finally {
      setCheckingChanges(false);
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f8fbfc]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#f8fbfc] p-6 md:p-10">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-[#49879c]">Loading monitoring data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !monitoringData) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f8fbfc]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#f8fbfc] p-6 md:p-10">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Competitor not found'}</p>
              <Link
                href="/competitors"
                className="text-primary hover:underline"
              >
                ← Back to Competitors
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { competitor, url } = monitoringData;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fbfc]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f8fbfc]">
        <DashboardHeader />
        <div className="p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/competitors"
                  className="text-[#49879c] hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-xl border border-gray-100 flex items-center justify-center text-white font-bold text-2xl ${
                    gradientClasses[competitor.color] || gradientClasses.blue
                  }`}>
                    {competitor.initial}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[#0d181c]">{competitor.name}</h1>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#49879c] hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {url}
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckForChanges}
                disabled={checkingChanges}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#0aa6da] text-white font-bold h-11 px-5 transition-colors shadow-sm shadow-primary/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {checkingChanges ? 'hourglass_empty' : 'refresh'}
                </span>
                <span>{checkingChanges ? 'Checking...' : 'Check for Changes'}</span>
              </button>
            </div>

            {/* Menu Updates Feed */}
            <UpdatesFeed 
              onCheckNow={handleCheckForChanges}
              lastCheckedAt={lastCheckedAt}
              checking={checkingChanges}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
