"use client";

import { useState } from "react";
import type { Competitor } from "@/app/onboarding/page";

interface CompetitorsTableProps {
  competitors: Competitor[];
  onDelete?: (competitorId: string) => void;
}

interface CompetitorRow {
  id: string;
  name: string;
  domain: string;
  location: string;
  categories: string[];
  sourcesCount: number;
  lastChange: string;
  lastChangeStatus: "active" | "inactive";
  isPaused: boolean;
  logoUrl?: string;
}

// Generate mock competitor rows based on selected competitors
function generateCompetitorRows(competitors: Competitor[]): CompetitorRow[] {
  const locations = ["San Francisco, CA", "San Jose, CA", "New York, NY", "London, UK", "Amsterdam, NL"];
  const categories = [
    ["Fintech", "Payments"],
    ["Fintech"],
    ["Enterprise", "Payments"],
    ["POS"],
    ["SaaS"],
  ];
  const timeAgo = ["2 hours ago", "1 day ago", "3 days ago", "2 weeks ago", "5 hours ago"];
  const sourcesCounts = [12, 8, 15, 5, 7];

  return competitors.map((competitor, index) => ({
    id: competitor.id,
    name: competitor.name,
    domain: competitor.domain,
    location: locations[index % locations.length],
    categories: categories[index % categories.length],
    sourcesCount: sourcesCounts[index % sourcesCounts.length],
    lastChange: timeAgo[index % timeAgo.length],
    lastChangeStatus: index % 3 === 0 ? "active" : "inactive",
    isPaused: index === 3, // Make the 4th competitor paused for demo
  }));
}

export default function CompetitorsTable({ competitors, onDelete }: CompetitorsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("Status: All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const competitorRows = generateCompetitorRows(competitors);
  
  // Filter competitors
  const filteredRows = competitorRows.filter((row) => {
    if (searchQuery && !row.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !row.domain.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (locationFilter !== "All Locations" && !row.location.includes(locationFilter)) {
      return false;
    }
    if (categoryFilter !== "All Categories" && !row.categories.includes(categoryFilter)) {
      return false;
    }
    if (statusFilter === "Status: Active" && row.isPaused) {
      return false;
    }
    if (statusFilter === "Status: Paused" && !row.isPaused) {
      return false;
    }
    return true;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  const categoryColors: Record<string, string> = {
    Fintech: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    Payments: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    Enterprise: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
    POS: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    SaaS: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300",
  };

  const gradientClasses: Record<string, string> = {
    indigo: "bg-gradient-to-br from-blue-500 to-indigo-600",
    orange: "bg-gradient-to-br from-orange-400 to-orange-600",
    green: "bg-gradient-to-br from-green-400 to-green-600",
    purple: "bg-gradient-to-tr from-purple-500 to-pink-500",
    pink: "bg-gradient-to-br from-pink-400 to-pink-600",
    blue: "bg-gradient-to-br from-blue-400 to-blue-600",
    teal: "bg-gradient-to-r from-teal-400 to-green-500",
    yellow: "bg-gradient-to-br from-yellow-400 to-yellow-600",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-[#e7f0f4] shadow-sm">
        {/* Search */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#49879c]">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-[#f8fbfc] text-[#0d181c] placeholder:text-[#49879c] focus:ring-2 focus:ring-primary focus:outline-none text-sm"
            placeholder="Search by name, website, or tag..."
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filters */}
        <div className="lg:col-span-7 flex flex-wrap md:flex-nowrap gap-3 justify-end">
          <div className="relative group w-full md:w-auto">
            <select
              className="appearance-none w-full md:w-40 bg-[#f8fbfc] border-none text-[#0d181c] py-2.5 pl-4 pr-10 rounded-lg cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none text-sm font-medium"
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Locations</option>
              <option>North America</option>
              <option>Europe</option>
              <option>Asia Pacific</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#49879c]">
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </div>
          </div>

          <div className="relative group w-full md:w-auto">
            <select
              className="appearance-none w-full md:w-40 bg-[#f8fbfc] border-none text-[#0d181c] py-2.5 pl-4 pr-10 rounded-lg cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none text-sm font-medium"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Categories</option>
              <option>SaaS</option>
              <option>Fintech</option>
              <option>E-commerce</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#49879c]">
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </div>
          </div>

          <div className="relative group w-full md:w-auto">
            <select
              className="appearance-none w-full md:w-40 bg-[#f8fbfc] border-none text-[#0d181c] py-2.5 pl-4 pr-10 rounded-lg cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none text-sm font-medium"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>Status: All</option>
              <option>Status: Active</option>
              <option>Status: Paused</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#49879c]">
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#e7f0f4] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e7f0f4] bg-[#f8fbfc]/50 text-xs uppercase tracking-wider text-[#49879c] font-semibold">
                <th className="px-6 py-4">Competitor Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Sources</th>
                <th className="px-6 py-4">Last Change</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7f0f4] text-sm">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#49879c]">
                    No competitors found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const competitor = competitors.find((c) => c.id === row.id);
                  const competitorColor = competitor?.color || "blue";
                  
                  return (
                    <tr
                      key={row.id}
                      className={`group hover:bg-[#f8fbfc] transition-colors ${
                        row.isPaused ? "bg-[#f8fbfc]/30 opacity-75" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-10 rounded-lg border border-[#e7f0f4] flex items-center justify-center text-white font-bold text-lg ${
                              gradientClasses[competitorColor] || gradientClasses.blue
                            } ${row.isPaused ? "grayscale" : ""}`}
                          >
                            {competitor?.initial || row.name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0d181c] group-hover:text-primary transition-colors cursor-pointer">
                              {row.name}
                            </span>
                            <div className="flex items-center gap-1">
                              {row.isPaused && (
                                <span className="text-xs text-amber-600 font-semibold">[Paused]</span>
                              )}
                              <span className="text-xs text-[#49879c]">{row.domain}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#49879c]">{row.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {row.categories.map((cat) => (
                            <span
                              key={cat}
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                                categoryColors[cat] || "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold ${
                            row.sourcesCount >= 12
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-[#f8fbfc] text-[#49879c]"
                          }`}
                        >
                          {row.sourcesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#49879c]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`size-2 rounded-full ${
                              row.lastChangeStatus === "active"
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          ></span>
                          <span>{row.lastChange}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="size-8 flex items-center justify-center rounded-md hover:bg-primary/10 text-[#49879c] hover:text-primary transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          {row.isPaused ? (
                            <button
                              className="size-8 flex items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Resume Monitoring"
                            >
                              <span className="material-symbols-outlined text-[20px]">play_circle</span>
                            </button>
                          ) : (
                            <button
                              className="size-8 flex items-center justify-center rounded-md hover:bg-amber-50 text-[#49879c] hover:text-amber-600 transition-colors cursor-pointer"
                              title="Pause Monitoring"
                            >
                              <span className="material-symbols-outlined text-[20px]">pause_circle</span>
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm({ id: row.id, name: row.name })}
                            className="size-8 flex items-center justify-center rounded-md hover:bg-red-50 text-[#49879c] hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Competitor"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#e7f0f4] bg-white gap-4">
            <span className="text-sm text-[#49879c]">
              Showing <span className="font-bold text-[#0d181c]">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-[#0d181c]">
                {Math.min(startIndex + itemsPerPage, filteredRows.length)}
              </span>{" "}
              of <span className="font-bold text-[#0d181c]">{filteredRows.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button
                className="size-9 flex items-center justify-center rounded-lg border border-[#e7f0f4] text-[#49879c] hover:bg-[#f8fbfc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return pageNum;
              })
              .filter((pageNum) => pageNum > 0 && pageNum <= totalPages)
              .map((pageNum) => (
                <button
                  key={`page-${pageNum}`}
                  className={`size-9 flex items-center justify-center rounded-lg border border-[#e7f0f4] text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-primary text-white border-primary"
                      : "text-[#49879c] hover:bg-[#f8fbfc]"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="text-[#49879c] px-1">...</span>
              )}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  className="size-9 flex items-center justify-center rounded-lg border border-[#e7f0f4] text-[#49879c] hover:bg-[#f8fbfc] text-sm font-medium transition-colors cursor-pointer"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}
              <button
                className="size-9 flex items-center justify-center rounded-lg border border-[#e7f0f4] text-[#49879c] hover:bg-[#f8fbfc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-[#e7f0f4] max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-[#0d181c]">Delete Competitor</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-[#98aeb6] hover:text-[#0d181c] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-[#49879c] text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-[#0d181c]">{deleteConfirm.name}</span>? This action cannot be undone and will stop monitoring all their pages.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-transparent hover:bg-[#f8fbfc] text-[#49879c] text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDelete) {
                    onDelete(deleteConfirm.id);
                  }
                  setDeleteConfirm(null);
                }}
                className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-md hover:shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Delete Competitor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
