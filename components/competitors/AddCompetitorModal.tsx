"use client";

import { useState } from "react";
import type { Competitor } from "@/app/onboarding/page";

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (competitor: Competitor) => void;
  existingCompetitors: Competitor[];
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

export default function AddCompetitorModal({
  isOpen,
  onClose,
  onAdd,
  existingCompetitors,
}: AddCompetitorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.domain) {
      const initials = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      const colors = Object.keys(colorClasses);
      const existingIds = existingCompetitors.map((c) =>
        parseInt(c.id.replace("comp-", "")) || 0
      );
      const nextId = Math.max(...existingIds, 0) + 1;

      const newCompetitor: Competitor = {
        id: `comp-${nextId}`,
        name: formData.name,
        domain: formData.domain,
        initial: formData.name[0]?.toUpperCase() || "C",
        color: colors[existingCompetitors.length % colors.length],
        matchScore: 85, // Default match score for manually added
        selected: true, // Auto-select manually added competitors
      };

      onAdd(newCompetitor);
      setFormData({ name: "", domain: "" });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-[#e7f0f4] max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-[#0d181c]">Add Competitor Manually</h2>
          <button
            onClick={onClose}
            className="text-[#98aeb6] hover:text-[#0d181c] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-[#49879c] text-sm mb-6">
          Add a competitor to monitor. We'll track their website for changes and create threat cards.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                required
              />
            </div>
          </label>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-transparent hover:bg-[#f8fbfc] text-[#49879c] text-sm font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.domain}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary hover:bg-[#0aa6da] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-bold transition-colors shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Competitor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
