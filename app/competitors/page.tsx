"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import CompetitorsGrid from "@/components/competitors/CompetitorsGrid";
import AddCompetitorModal from "@/components/competitors/AddCompetitorModal";
import type { Competitor } from "@/app/onboarding/page";

export default function CompetitorsPage() {
  const [selectedCompetitors, setSelectedCompetitors] = useState<Competitor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadCompetitors = () => {
    // Load competitors from localStorage (from onboarding)
    // TODO: Replace with actual API call when backend is ready
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      
      // Always include pizza demo competitor
      const pizzaDemoCompetitor: Competitor = {
        id: "pizza-demo",
        name: "Slice & Wood Pizzeria",
        domain: `${baseUrl}/api/demo/pizza-website`,
        initial: "S",
        color: "red",
        matchScore: 100,
        selected: true,
      };
      
      const storedData = localStorage.getItem("onboarding_data");
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.competitors && Array.isArray(data.competitors) && data.competitors.length > 0) {
          const filtered = data.competitors.filter((c: Competitor) => c.selected);
          
          // Remove old pizza-demo if it exists (we'll add the updated one with current origin)
          const filteredWithoutPizza = filtered.filter((c: Competitor) => c.id !== 'pizza-demo');
          
          // Always include pizza demo competitor with current origin (ensures correct URL in deployment)
          setSelectedCompetitors([pizzaDemoCompetitor, ...filteredWithoutPizza]);
          
          // Update localStorage with the correct pizza-demo URL
          try {
            const data = JSON.parse(storedData);
            if (data.competitors && Array.isArray(data.competitors)) {
              const index = data.competitors.findIndex((c: Competitor) => c.id === 'pizza-demo');
              if (index >= 0) {
                data.competitors[index] = pizzaDemoCompetitor;
              } else {
                data.competitors.push(pizzaDemoCompetitor);
              }
              localStorage.setItem("onboarding_data", JSON.stringify(data));
            }
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
          return;
        }
      }

      // Fallback: Use pizza demo competitor + mock competitors for demo if no data found
      // TODO: Remove this when backend is ready
      const mockCompetitors: Competitor[] = [
        pizzaDemoCompetitor,
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
      // Even on error, show pizza demo
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      setSelectedCompetitors([{
        id: "pizza-demo",
        name: "Slice & Wood Pizzeria",
        domain: `${baseUrl}/api/demo/pizza-website`,
        initial: "S",
        color: "red",
        matchScore: 100,
        selected: true,
      }]);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

  const handleAddCompetitor = (newCompetitor: Competitor) => {
    // Add the new competitor to the list
    const updated = [...selectedCompetitors, newCompetitor];
    setSelectedCompetitors(updated);

    // Update localStorage to persist the change
    // TODO: Replace with actual API call when backend is ready
    try {
      const storedData = localStorage.getItem("onboarding_data");
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.competitors) {
          data.competitors = [...data.competitors, newCompetitor];
        } else {
          data.competitors = [newCompetitor];
        }
        localStorage.setItem("onboarding_data", JSON.stringify(data));
      } else {
        // If no stored data, create new entry
        localStorage.setItem(
          "onboarding_data",
          JSON.stringify({
            competitors: [newCompetitor],
          })
        );
      }
    } catch (e) {
      console.error("Error saving competitor:", e);
    }

    setShowAddModal(false);
  };

  const handleDeleteCompetitor = (competitorId: string) => {
    // Remove the competitor from the list
    const updated = selectedCompetitors.filter((c) => c.id !== competitorId);
    setSelectedCompetitors(updated);

    // Update localStorage to persist the deletion
    // TODO: Replace with actual API call when backend is ready
    try {
      const storedData = localStorage.getItem("onboarding_data");
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.competitors) {
          data.competitors = data.competitors.filter((c: Competitor) => c.id !== competitorId);
          localStorage.setItem("onboarding_data", JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error("Error deleting competitor:", e);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fbfc]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f8fbfc] p-6 md:p-10">
        <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
          {/* Page Heading & Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0d181c]">
                Competitors List
              </h1>
              <p className="text-[#49879c] text-base">
                Manage and monitor your competitor landscape effectively.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#0aa6da] text-white font-bold h-11 px-5 transition-colors shadow-sm shadow-primary/30 w-full md:w-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Add Competitor</span>
            </button>
          </div>

          {/* Competitors Grid */}
          <CompetitorsGrid 
            competitors={selectedCompetitors} 
            onDelete={handleDeleteCompetitor}
          />

          {/* Add Competitor Modal */}
          <AddCompetitorModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddCompetitor}
            existingCompetitors={selectedCompetitors}
          />
        </div>
      </main>
    </div>
  );
}
