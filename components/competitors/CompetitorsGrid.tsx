"use client";

import { useState } from "react";
import Link from "next/link";
import type { Competitor } from "@/app/onboarding/page";

interface CompetitorsGridProps {
  competitors: Competitor[];
  onDelete?: (competitorId: string) => void;
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
};

export default function CompetitorsGrid({ competitors, onDelete }: CompetitorsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Filter competitors by search query
  const filteredCompetitors = competitors.filter((competitor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      competitor.name.toLowerCase().includes(query) ||
      competitor.domain.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e7f0f4] shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#49879c]">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-[#f8fbfc] text-[#0d181c] placeholder:text-[#49879c] focus:ring-2 focus:ring-primary focus:outline-none text-sm"
            placeholder="Search competitors by name or domain..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Competitors Grid */}
      {filteredCompetitors.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e7f0f4] p-12 text-center shadow-sm">
          <p className="text-[#49879c] text-lg">
            {searchQuery ? "No competitors found matching your search." : "No competitors added yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCompetitors.map((competitor) => (
            <Link
              key={competitor.id}
              href={`/competitors/${competitor.id}`}
              className="group relative bg-white rounded-xl border border-[#e7f0f4] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              {/* Delete Button (shown on hover) */}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteConfirm({ id: competitor.id, name: competitor.name });
                  }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#49879c] hover:text-red-600 transition-colors cursor-pointer z-10"
                  title="Delete Competitor"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              )}

              {/* Competitor Logo/Initial */}
              <div className="flex justify-center mb-4">
                <div
                  className={`size-20 rounded-xl border border-gray-100 flex items-center justify-center text-white font-bold text-3xl shadow-sm ${
                    gradientClasses[competitor.color] || gradientClasses.blue
                  }`}
                >
                  {competitor.initial}
                </div>
              </div>

              {/* Competitor Info */}
              <div className="flex flex-col gap-2 text-center flex-1">
                <h3 className="font-bold text-lg text-[#0d181c] group-hover:text-primary transition-colors">
                  {competitor.name}
                </h3>
                <p className="text-sm text-[#49879c] truncate">{competitor.domain}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

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
