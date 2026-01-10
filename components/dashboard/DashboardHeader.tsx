"use client";

import { useState } from "react";

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[#cee2e8] bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <button className="text-[#49879c] lg:hidden cursor-pointer">
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        {/* Search Bar */}
        <div className="relative flex w-full max-w-md items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#49879c]">search</span>
          <input
            className="h-10 w-full rounded-lg border-none bg-[#f8fbfc] pl-10 pr-4 text-sm text-[#0d181c] focus:ring-2 focus:ring-primary placeholder:text-[#49879c] transition-all"
            placeholder="Search threats, competitors, or topics..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Date Range & Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-[#cee2e8] bg-[#f8fbfc] px-3 py-2 sm:flex">
          <span className="material-symbols-outlined text-[#49879c] text-[20px]">calendar_today</span>
          <span className="text-sm font-medium text-[#0d181c]">Last 7 Days</span>
          <span className="material-symbols-outlined text-[#49879c] text-[18px]">expand_more</span>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 cursor-pointer">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </header>
  );
}
