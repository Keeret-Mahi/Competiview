"use client";

import { useState, useEffect } from "react";
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

// UpdateEvent from monitoring system
interface UpdateEvent {
  id: string;
  competitorId: string;
  competitorName?: string;
  url: string;
  type: 'PRODUCT_ADDED' | 'PRICE_CHANGED';
  createdAt: Date | string;
  payload: {
    itemKey: string;
    itemName: string;
    oldPrice?: number;
    newPrice?: number;
    price?: number;
    description?: string;
  };
}

// Convert UpdateEvent to Threat
function convertUpdateEventToThreat(event: UpdateEvent, competitor: Competitor | null): Threat | null {
  if (!competitor) {
    // Try to find competitor from competitors list or use defaults for pizza demo
    if (event.competitorId === 'pizza-demo') {
      competitor = {
        id: 'pizza-demo',
        name: 'Slice & Wood Pizzeria',
        domain: '',
        initial: 'S',
        color: 'red',
        matchScore: 100,
        selected: true,
      };
    } else {
      return null;
    }
  }

  const eventDate = new Date(event.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - eventDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo = 'Just now';
  if (diffMins >= 1 && diffMins < 60) {
    timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours >= 1 && diffHours < 24) {
    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays >= 1) {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  if (event.type === 'PRODUCT_ADDED') {
    return {
      id: event.id,
      competitorId: event.competitorId,
      competitorName: competitor.name,
      competitorInitial: competitor.initial,
      competitorColor: competitor.color,
      category: 'Product',
      severity: 'High',
      title: `New Menu Item Added: ${event.payload.itemName}`,
      timeAgo,
      whyItMatters: `${competitor.name} has added a new menu item "${event.payload.itemName}"${event.payload.price ? ` priced at $${event.payload.price.toFixed(2)}` : ''}. This could indicate they're expanding their menu offerings to attract new customers.`,
      afterText: `${event.payload.itemName}${event.payload.price ? ` - $${event.payload.price.toFixed(2)}` : ''}${event.payload.description ? ` - ${event.payload.description}` : ''}`,
    };
  } else if (event.type === 'PRICE_CHANGED') {
    const priceChange = event.payload.oldPrice && event.payload.newPrice
      ? ((event.payload.newPrice - event.payload.oldPrice) / event.payload.oldPrice * 100)
      : 0;
    
    return {
      id: event.id,
      competitorId: event.competitorId,
      competitorName: competitor.name,
      competitorInitial: competitor.initial,
      competitorColor: competitor.color,
      category: 'Pricing',
      severity: Math.abs(priceChange) > 10 ? 'High' : 'Medium',
      title: `Price Updated: ${event.payload.itemName}`,
      timeAgo,
      whyItMatters: `${competitor.name} has ${priceChange > 0 ? 'increased' : 'decreased'} the price of "${event.payload.itemName}" by ${Math.abs(priceChange).toFixed(1)}%${priceChange > 0 ? '. This could signal demand changes or cost adjustments.' : '. This may indicate a promotional strategy or competitive pricing adjustment.'}`,
      beforeText: `${event.payload.itemName} - $${event.payload.oldPrice?.toFixed(2)}`,
      afterText: `${event.payload.itemName} - $${event.payload.newPrice?.toFixed(2)}`,
    };
  }

  return null;
}

// Generate one generic mock threat
function generateOneGenericThreat(competitors: Competitor[]): Threat | null {
  if (competitors.length === 0) {
    return null;
  }

  // Use the first competitor for the generic threat
  const competitor = competitors[0];
  
  return {
    id: `threat-generic-${competitor.id}`,
    competitorId: competitor.id,
    competitorName: competitor.name,
    competitorInitial: competitor.initial,
    competitorColor: competitor.color,
    category: "Marketing",
    severity: "Low",
    title: "Updated Blog",
    timeAgo: "2d ago",
    whyItMatters: `New blog post published: "5 Ways to optimize your workflow with AI". Mentions generic industry trends, low immediate impact.`,
  };
}

export default function ThreatFeed({ competitors }: ThreatFeedProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All Threats");
  const [realThreats, setRealThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/monitoring/updates');
        if (!response.ok) {
          throw new Error('Failed to fetch updates');
        }
        
        const data = await response.json();
        const allEvents: UpdateEvent[] = data.events || [];
        
        // Convert events to threats
        const threats: Threat[] = [];
        for (const event of allEvents) {
          const competitor = competitors.find(c => c.id === event.competitorId);
          const threat = convertUpdateEventToThreat(event, competitor || null);
          if (threat) {
            threats.push(threat);
          }
        }
        
        setRealThreats(threats);
      } catch (error) {
        console.error('Error fetching threats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchThreats, 30000);
    return () => clearInterval(interval);
  }, [competitors]);

  // Combine real threats with one generic mock threat
  const genericThreat = generateOneGenericThreat(competitors);
  const allThreats = genericThreat 
    ? [...realThreats, genericThreat] 
    : realThreats;

  const filteredThreats =
    selectedFilter === "All Threats"
      ? allThreats
      : allThreats.filter((threat) => threat.category === selectedFilter);

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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-[#cee2e8] bg-white">
            <span className="material-symbols-outlined text-6xl text-[#98aeb6] mb-4 animate-spin">
              refresh
            </span>
            <p className="text-lg font-semibold text-[#0d181c] mb-2">Loading threats...</p>
          </div>
        ) : filteredThreats.length === 0 ? (
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
