"use client";

import { useState } from "react";
import type { Threat } from "./ThreatFeed";
import type { Competitor } from "@/app/onboarding/page";

interface ThreatCardProps {
  threat: Threat;
}

// Map competitor colors to gradient backgrounds
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

const severityStyles = {
  High: {
    borderColor: "border-l-danger",
    badge: "text-red-800 bg-danger/10 dark:bg-red-900/30 dark:text-red-300",
    dot: "bg-danger",
  },
  Medium: {
    borderColor: "border-l-warning",
    badge: "bg-yellow-50 text-[#78350F] dark:bg-yellow-900/30 dark:text-yellow-300",
    dot: "bg-yellow-700",
  },
  Low: {
    borderColor: "border-l-success",
    badge: "bg-green-50 text-[#14532D] dark:bg-green-900/30 dark:text-green-300",
    dot: "bg-green-700",
  },
};

const categoryColors = {
  Pricing: "bg-sky-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Product: "bg-purple-50 text-[#581C87] dark:bg-purple-900/30 dark:text-purple-300",
  Marketing: "bg-orange-50 text-[#7C2D12] dark:bg-orange-900/30 dark:text-orange-300",
};

export default function ThreatCard({ threat }: ThreatCardProps) {
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const severityStyle = severityStyles[threat.severity];

  return (
    <article
      className={`flex flex-col gap-4 rounded-xl border border-l-4 border-[#cee2e8] ${severityStyle.borderColor} bg-white p-5 shadow-sm transition ${
        threat.severity === "Low" ? "opacity-80 hover:opacity-100" : ""
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-100 p-1 shadow-sm">
            <div
              className={`h-full w-full rounded ${
                gradientClasses[threat.competitorColor] || gradientClasses.blue
              }`}
            ></div>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0d181c]">{threat.competitorName}</h3>
            <div className="flex items-center gap-2 text-sm text-[#49879c]">
              <span>{threat.title}</span>
              <span className="text-xs">•</span>
              <span>{threat.timeAgo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[threat.category]}`}>
            {threat.category}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${severityStyle.badge} flex items-center gap-1`}>
            <span className={`h-1.5 w-1.5 rounded-full ${severityStyle.dot}`}></span>
            {threat.severity} Severity
          </span>
        </div>
      </div>

      {/* AI Summary */}
      {threat.whyItMatters && (
        <div className="relative rounded-lg bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Why it matters
          </div>
          <p className="text-sm leading-relaxed text-[#0d181c]">{threat.whyItMatters}</p>
        </div>
      )}

      {/* Diff View */}
      {(threat.beforeText || threat.afterText || threat.diffView) && (
        <details
          className="group rounded-lg border border-[#cee2e8] bg-[#f8fbfc]"
          open={isDiffOpen}
          onToggle={(e) => setIsDiffOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50 transition rounded-lg">
            <span className="text-sm font-medium text-[#49879c] group-open:text-primary">
              View Changes
            </span>
            <span className="material-symbols-outlined text-[#49879c] transition-transform group-open:rotate-180">
              expand_more
            </span>
          </summary>
          <div className="border-t border-[#cee2e8] p-4 text-sm font-mono leading-relaxed bg-white">
            {threat.beforeText && (
              <>
                <div className="mb-2 text-xs text-[#49879c] uppercase tracking-wider">Before</div>
                <p className="mb-4 text-gray-500 line-through decoration-red-500 decoration-2 bg-red-50 p-2 rounded block">
                  {threat.beforeText}
                </p>
              </>
            )}
            {threat.afterText && (
              <>
                <div className="mb-2 text-xs text-[#49879c] uppercase tracking-wider">After</div>
                <p className="text-gray-900 bg-green-50 p-2 rounded block border-l-4 border-green-500">
                  {threat.afterText.replace(
                    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
                    '<span class="bg-green-200 font-bold px-1 rounded text-green-900">$$1</span>'
                  )}
                </p>
              </>
            )}
            {threat.diffView && (
              <p
                className="text-gray-900 bg-green-50 p-2 rounded block border-l-4 border-green-500 whitespace-pre"
                dangerouslySetInnerHTML={{ __html: threat.diffView }}
              ></p>
            )}
          </div>
        </details>
      )}

      {/* Simple summary for low severity threats without diff */}
      {threat.severity === "Low" && !threat.whyItMatters && (
        <p className="text-sm text-[#49879c]">Low impact change detected.</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#49879c] hover:bg-gray-100 transition cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">close</span>
          Dismiss
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#49879c] hover:bg-gray-100 transition cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">share</span>
          Share
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          Create Task
        </button>
      </div>
    </article>
  );
}
