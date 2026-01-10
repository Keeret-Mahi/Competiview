"use client";

import { useRouter } from "next/navigation";
import { FormData } from "@/app/onboarding/page";

interface Step4SuccessProps {
  formData: FormData;
  onFinish: () => void;
  onBack: () => void;
}

export default function Step4Success({
  formData,
  onFinish,
  onBack,
}: Step4SuccessProps) {
  const selectedCompetitors = formData.competitors.filter((c) => c.selected);
  const activeSources = Object.entries(formData.sources)
    .filter(([_, active]) => active)
    .map(([key]) => key);

  const sourceLabels: Record<string, string> = {
    pricing: "Web",
    blog: "Web",
    instagram: "Instagram",
    linkedin: "LinkedIn",
  };

  const uniqueSources = [...new Set(activeSources.map((s) => sourceLabels[s] || s))];

  return (
    <div className="flex flex-col h-full items-center justify-center text-center py-10">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
        <div className="relative size-24 bg-primary text-white rounded-full flex items-center justify-center shadow-xl">
          <span className="material-symbols-outlined text-6xl">radar</span>
        </div>
      </div>

      <h1 className="text-4xl font-black text-[#0d181c] mb-4">
        Monitoring is Live!
      </h1>

      <p className="text-[#49879c] text-lg max-w-md mb-8">
        We are now tracking{" "}
        <strong className="text-[#0d181c]">
          {selectedCompetitors.length} competitors
        </strong>{" "}
        across{" "}
        {uniqueSources.map((source, index) => (
          <span key={source}>
            <strong className="text-[#0d181c]">{source}</strong>
            {index < uniqueSources.length - 2 && ", "}
            {index === uniqueSources.length - 2 && " and "}
          </span>
        ))}
        . Your first report will be ready in approximately 10 minutes.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          onClick={onFinish}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-[#0aa6da] text-white text-base font-bold transition-colors shadow-md hover:shadow-lg"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
