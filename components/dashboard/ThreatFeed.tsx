"use client";

import { useState } from "react";
import ThreatCard from "./ThreatCard";
import type { Competitor } from "@/app/onboarding/page";

interface ThreatFeedProps {
  competitors: Competitor[];
}

// Mock threat data structure
export interface Threat {
  id: string;
  competitorId: string;
  competitorName: string;
  competitorInitial: string;
  competitorColor: string;
  category: "Pricing" | "Product" | "Marketing";
  severity: "High" | "Medium" | "Low";
  title: string;
  timeAgo: string;
  whyItMatters?: string;
  beforeText?: string;
  afterText?: string;
  diffView?: string;
}

// Generate mock threats based on selected competitors
function generateMockThreats(competitors: Competitor[]): Threat[] {
  if (competitors.length === 0) {
    return [];
  }

  const threats: Threat[] = [];
  const severities: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Low"];
  const categories: ("Pricing" | "Product" | "Marketing")[] = ["Pricing", "Product", "Marketing"];

  competitors.forEach((competitor, index) => {
    const severity = severities[index % severities.length];
    const category = categories[index % categories.length];

    // Create different threat types based on index
    // In production, these would come from the backend API
    if (index % 3 === 0) {
      // High severity pricing change (first, fourth, etc.)
      threats.push({
        id: `threat-${competitor.id}-${index}-1`,
        competitorId: competitor.id,
        competitorName: competitor.name,
        competitorInitial: competitor.initial,
        competitorColor: competitor.color,
        category: "Pricing",
        severity: "High",
        title: "Changed Pricing Page",
        timeAgo: `${index + 1}h ago`,
        whyItMatters: `${competitor.name} has significantly lowered their Enterprise tier pricing by approximately 15%. This move likely signals an aggressive strategy to capture market share in the mid-market segment where we currently have a stronghold.`,
        beforeText: "Enterprise Plan: Starting at $5,000 / month",
        afterText: "Enterprise Plan: Starting at $4,250 / month",
      });
    } else if (index % 3 === 1) {
      // Medium severity product change (second, fifth, etc.)
      threats.push({
        id: `threat-${competitor.id}-${index}-1`,
        competitorId: competitor.id,
        competitorName: competitor.name,
        competitorInitial: competitor.initial,
        competitorColor: competitor.color,
        category: "Product",
        severity: "Medium",
        title: "New Feature Detected",
        timeAgo: `${index + 3}h ago`,
        whyItMatters: `${competitor.name} has rolled out a new 'Auto-Sync' feature in beta. This directly competes with our core 'Instant Connect' offering. Early user reviews suggest it's faster but lacks customization.`,
        diffView: `<div class="feature-highlight">\n  <h3>New: Auto-Sync</h3>\n  <p>Keep your data fresh with real-time bi-directional sync.</p>\n</div>`,
      });
    } else {
      // Low severity marketing change (third, sixth, etc.)
      threats.push({
        id: `threat-${competitor.id}-${index}-1`,
        competitorId: competitor.id,
        competitorName: competitor.name,
        competitorInitial: competitor.initial,
        competitorColor: competitor.color,
        category: "Marketing",
        severity: "Low",
        title: "Updated Blog",
        timeAgo: `${index + 1}d ago`,
        whyItMatters: `New blog post published: "5 Ways to optimize your workflow with AI". Mentions generic industry trends, low immediate impact.`,
      });
    }
  });

  return threats;
}

export default function ThreatFeed({ competitors }: ThreatFeedProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All Threats");
  const mockThreats = generateMockThreats(competitors);

  const filteredThreats =
    selectedFilter === "All Threats"
      ? mockThreats
      : mockThreats.filter((threat) => threat.category === selectedFilter);

  const filters = ["All Threats", "Pricing", "Product", "Marketing"];

  return (
    <div className="space-y-8">
      {/* Filter / Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#0d181c]">Latest Threat Feed</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition cursor-pointer ${
                selectedFilter === filter
                  ? "bg-primary text-white"
                  : "border border-[#cee2e8] bg-white text-[#49879c] hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col space-y-4">
        {filteredThreats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-[#cee2e8] bg-white">
            <span className="material-symbols-outlined text-6xl text-[#98aeb6] mb-4">
              notifications_off
            </span>
            <p className="text-lg font-semibold text-[#0d181c] mb-2">No threats found</p>
            <p className="text-sm text-[#49879c] text-center max-w-md">
              {competitors.length === 0
                ? "No competitors selected. Complete onboarding to start monitoring threats."
                : `No ${selectedFilter === "All Threats" ? "" : selectedFilter} threats detected yet.`}
            </p>
          </div>
        ) : (
          filteredThreats.map((threat) => (
            <ThreatCard key={threat.id} threat={threat} />
          ))
        )}
      </div>

      {/* Loading / Pagination */}
      {filteredThreats.length > 0 && (
        <div className="flex justify-center py-6">
          <button className="flex items-center gap-2 rounded-full border border-[#cee2e8] bg-white px-6 py-2 text-sm font-medium text-[#49879c] shadow-sm transition hover:bg-gray-50 cursor-pointer">
            <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
            Load More Threats
          </button>
        </div>
      )}
    </div>
  );
}
