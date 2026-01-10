"use client";

import { useState, useEffect } from "react";
import { FormData, Competitor } from "@/app/onboarding/page";

interface Step2CompetitorsProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const colorClasses: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-600",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  pink: "bg-pink-100 text-pink-600",
  blue: "bg-blue-100 text-blue-600",
  teal: "bg-teal-100 text-teal-600",
  yellow: "bg-yellow-100 text-yellow-600",
};

// Generate mock competitors based on Step 1 data
function generateCompetitors(formData: FormData): Competitor[] {
  const category = formData.category || "business";
  const location = formData.city || formData.country || "";
  
  // Generate 3-5 competitors based on category and location
  // In production, this would call the discovery API
  const mockData: Record<string, { names: string[]; domains: string[] }> = {
    restaurant: {
      names: ["Bella Vista", "The Corner Bistro", "Coastal Kitchen", "Downtown Diner", "Garden Grill"],
      domains: ["bellavista-restaurant.com", "cornerbistro.com", "coastalkitchen.com", "downtowndiner.com", "gardengrill.com"],
    },
    retail: {
      names: ["Market Square", "Urban Trends", "City Commerce", "Local Boutique", "Trending Styles"],
      domains: ["marketsquare.com", "urbantrends.com", "citycommerce.com", "localboutique.com", "trendingstyles.com"],
    },
    saas: {
      names: ["CloudTech Solutions", "DataFlow Inc", "MetricsPro", "AnalyticsHub", "TechStream"],
      domains: ["cloudtech.io", "dataflow.com", "metricspro.com", "analyticshub.io", "techstream.com"],
    },
    ecommerce: {
      names: ["ShopLocal", "Urban Market", "Digital Storefront", "QuickCart", "FastBuy"],
      domains: ["shoplocal.com", "urbanmarket.com", "digitalstore.com", "quickcart.com", "fastbuy.com"],
    },
    default: {
      names: ["Local Competitor 1", "Competitor Plus", "Regional Business", "City Services", "Nearby Business"],
      domains: ["competitor1.com", "competitorplus.com", "regionalbiz.com", "cityservices.com", "nearbybusiness.com"],
    },
  };

  const data = mockData[category] || mockData.default;
  const initials = ["A", "B", "C", "D", "E"];
  const colors = Object.keys(colorClasses);
  
  // Generate 3-5 competitors (random between 3-5)
  const count = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
  
  return data.names.slice(0, count).map((name, index) => ({
    id: `comp-${index + 1}`,
    name: name,
    domain: data.domains[index] || `${name.toLowerCase().replace(/\s+/g, "")}.com`,
    initial: initials[index] || name[0] || "C",
    color: colors[index % colors.length],
    matchScore: Math.max(75, 95 - (index * 5)), // Match scores between 95-75
    selected: index < 3, // First 3 selected by default
  }));
}

export default function Step2Competitors({
  formData,
  updateFormData,
  onNext,
  onBack,
}: Step2CompetitorsProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>(
    formData.competitors.length > 0 ? formData.competitors : []
  );
  const [loading, setLoading] = useState(formData.competitors.length === 0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    domain: "",
  });

  const discoverCompetitorsFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/discover-competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          category: formData.category,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to discover competitors');
      }

      const data = await response.json();
      
      if (data.competitors && data.competitors.length > 0) {
        setCompetitors(data.competitors);
        updateFormData({ competitors: data.competitors });
      } else {
        // Fallback to mock data if no competitors found
        console.warn('No competitors found via API, using fallback data');
        const fallback = generateCompetitors(formData);
        setCompetitors(fallback);
        updateFormData({ competitors: fallback });
      }
    } catch (error: any) {
      console.error('Error discovering competitors:', error);
      // On error, fallback to mock data so the user can continue
      const fallback = generateCompetitors(formData);
      setCompetitors(fallback);
      updateFormData({ competitors: fallback });
      // You might want to show an error toast here
      alert(`Competitor discovery error: ${error.message}. Using fallback data.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.competitors.length === 0) {
      // Call the API to discover competitors when component mounts
      discoverCompetitorsFromAPI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleToggleCompetitor = (id: string) => {
    const updated = competitors.map((c) =>
      c.id === id ? { ...c, selected: !c.selected } : c
    );
    setCompetitors(updated);
    updateFormData({ competitors: updated });
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.name && newCompetitor.domain) {
      const initials = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      const colors = Object.keys(colorClasses);
      const existingIds = competitors.map((c) => parseInt(c.id.replace("comp-", "")) || 0);
      const nextId = Math.max(...existingIds, 0) + 1;
      
      const added: Competitor = {
        id: `comp-${nextId}`,
        name: newCompetitor.name,
        domain: newCompetitor.domain,
        initial: newCompetitor.name[0]?.toUpperCase() || "C",
        color: colors[competitors.length % colors.length],
        matchScore: 85, // Default match score for manually added
        selected: true, // Auto-select manually added competitors
      };

      const updated = [...competitors, added];
      setCompetitors(updated);
      updateFormData({ competitors: updated });
      setNewCompetitor({ name: "", domain: "" });
      setShowAddModal(false);
    }
  };

  const selectedCount = competitors.filter((c) => c.selected).length;

  const handleFinish = () => {
    if (selectedCount > 0) {
      onNext();
    }
  };

  // Build location string from Step 1 data
  const locationString = [formData.city, formData.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black text-[#0d181c] mb-2 break-words">
              Select competitors to monitor
            </h1>
            <p className="text-[#49879c] text-base break-words">
              {loading
                ? "Searching for competitors..."
                : competitors.length > 0
                ? locationString
                  ? `We found ${competitors.length} competitors in ${locationString} based on your ${formData.category} business.`
                  : `We found ${competitors.length} competitors in your ${formData.category} category.`
                : "No competitors found matching your criteria."}
            </p>
          </div>
          {competitors.length > 0 && !loading && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {competitors.length} Found
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative size-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl animate-spin">radar</span>
            </div>
          </div>
          <p className="text-[#49879c] text-lg font-medium">Discovering competitors...</p>
          <p className="text-[#98aeb6] text-sm mt-1">
            Searching for local businesses in {locationString || "your area"}
          </p>
        </div>
      ) : competitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12">
          <span className="material-symbols-outlined text-6xl text-[#98aeb6] mb-4">search_off</span>
          <p className="text-[#0d181c] text-lg font-semibold mb-2">No competitors found</p>
          <p className="text-[#49879c] text-sm text-center max-w-md">
            We couldn't find any competitors matching your criteria. Try adjusting your location or category.
          </p>
        </div>
      ) : (
        <>
          <div className="border border-[#e7f0f4] rounded-lg overflow-hidden flex flex-col flex-1 max-h-[400px]">
            <div className="bg-[#f8fbfc] px-4 py-3 border-b border-[#e7f0f4] flex text-xs font-bold text-[#49879c] uppercase tracking-wider">
              <div className="w-10 text-center">Select</div>
              <div className="flex-1">Competitor</div>
              <div className="w-32 text-right">Match Score</div>
            </div>

            <div className="overflow-y-auto custom-scrollbar bg-white">
              {competitors.map((competitor, index) => (
                <label
                  key={competitor.id}
                  className={`flex items-center px-4 py-3 ${
                    index < competitors.length - 1
                      ? "border-b border-[#e7f0f4]"
                      : ""
                  } hover:bg-[#f8fbfc] cursor-pointer group transition-colors`}
                >
                  <div className="w-10 text-center">
                    <input
                      type="checkbox"
                      checked={competitor.selected}
                      onChange={() => handleToggleCompetitor(competitor.id)}
                      className="form-checkbox size-5 rounded text-primary border-[#cee2e8] focus:ring-primary focus:ring-offset-0 bg-[#f8fbfc]"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div
                      className={`size-10 rounded ${colorClasses[competitor.color] || colorClasses.blue} flex items-center justify-center font-bold text-lg`}
                    >
                      {competitor.initial}
                    </div>
                    <div>
                      <p className="font-bold text-[#0d181c]">
                        {competitor.name}
                      </p>
                      <p className="text-xs text-[#49879c]">{competitor.domain}</p>
                    </div>
                  </div>
                  <div className="w-32 flex flex-col items-end justify-center gap-1">
                    <span
                      className={`text-sm font-bold ${
                        competitor.matchScore >= 90 ? "text-primary" : "text-[#49879c]"
                      }`}
                    >
                      {competitor.matchScore}%
                    </span>
                    <div className="w-24 h-1.5 bg-[#cee2e8] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          competitor.matchScore >= 90 ? "bg-primary" : "bg-[#49879c]"
                        } rounded-full`}
                        style={{ width: `${competitor.matchScore}%` }}
                      ></div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-4 mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 border-2 border-dashed border-[#cee2e8] hover:border-primary bg-transparent hover:bg-primary/5 text-[#49879c] hover:text-primary text-sm font-semibold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Competitor Manually
            </button>
          </div>
        </>
      )}

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAddModal(false);
            setNewCompetitor({ name: "", domain: "" });
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-[#e7f0f4] max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-[#0d181c]">
                Add Competitor Manually
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCompetitor({ name: "", domain: "" });
                }}
                className="text-[#98aeb6] hover:text-[#0d181c] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-[#49879c] text-sm mb-6">
              Add a competitor that wasn't found in our search. We'll monitor their website for changes.
            </p>

            <div className="flex flex-col gap-4 mb-6">
              <label className="flex flex-col w-full">
                <span className="text-[#0d181c] text-sm font-semibold mb-2">
                  Competitor Name <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
                    business
                  </span>
                  <input
                    className="flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-12 pl-12 pr-4 text-[#0d181c] placeholder:text-[#49879c] text-base transition-all"
                    placeholder="Company Name"
                    type="text"
                    value={newCompetitor.name}
                    onChange={(e) =>
                      setNewCompetitor({ ...newCompetitor, name: e.target.value })
                    }
                    required
                  />
                </div>
              </label>

              <label className="flex flex-col w-full">
                <span className="text-[#0d181c] text-sm font-semibold mb-2">
                  Website URL <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
                    language
                  </span>
                  <input
                    className="flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-12 pl-12 pr-4 text-[#0d181c] placeholder:text-[#49879c] text-base transition-all"
                    placeholder="https://competitor.com"
                    type="url"
                    value={newCompetitor.domain}
                    onChange={(e) =>
                      setNewCompetitor({ ...newCompetitor, domain: e.target.value })
                    }
                    required
                  />
                </div>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCompetitor({ name: "", domain: "" });
                }}
                className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-transparent hover:bg-[#f8fbfc] text-[#49879c] text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompetitor}
                disabled={!newCompetitor.name || !newCompetitor.domain}
                className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary hover:bg-[#0aa6da] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-bold transition-colors shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Competitor
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6 mt-auto border-t border-[#e7f0f4]">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-transparent hover:bg-[#f8fbfc] text-[#49879c] text-base font-bold transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={handleFinish}
          disabled={selectedCount === 0 || loading}
          className="flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-[#0aa6da] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-base font-bold transition-colors shadow-md hover:shadow-lg"
        >
          {selectedCount > 0 ? (
            <>
              Finish Setup ({selectedCount})
              <span className="material-symbols-outlined text-sm">check</span>
            </>
          ) : (
            "Select at least 1 competitor"
          )}
        </button>
      </div>
    </div>
  );
}
