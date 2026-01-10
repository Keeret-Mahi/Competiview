"use client";

import { FormData } from "@/app/onboarding/page";

interface Step3SourcesProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface SourceOption {
  id: keyof FormData["sources"];
  icon: string;
  title: string;
  description: string;
  color: string;
}

const sources: SourceOption[] = [
  {
    id: "pricing",
    icon: "payments",
    title: "Pricing Changes",
    description: "Detect price increases or new tiers",
    color: "blue",
  },
  {
    id: "blog",
    icon: "feed",
    title: "Blog & Content",
    description: "Track new articles and keywords",
    color: "teal",
  },
  {
    id: "instagram",
    icon: "photo_camera",
    title: "Instagram Posts",
    description: "Monitor visual campaigns and hashtags",
    color: "pink",
  },
  {
    id: "linkedin",
    icon: "work",
    title: "LinkedIn Updates",
    description: "Corporate news and hiring trends",
    color: "blue",
  },
];

const colorClasses: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  teal: "bg-teal-100 text-teal-600",
  pink: "bg-pink-100 text-pink-600",
};

export default function Step3Sources({
  formData,
  updateFormData,
  onNext,
  onBack,
}: Step3SourcesProps) {
  const handleToggleSource = (id: keyof FormData["sources"]) => {
    updateFormData({
      sources: {
        ...formData.sources,
        [id]: !formData.sources[id],
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0d181c] mb-2">
          What should we monitor?
        </h1>
        <p className="text-[#49879c] text-lg">
          Choose the data sources you want to track for each competitor.
        </p>
      </div>

      <div className="flex flex-col gap-8 flex-1">
        {/* Web Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#49879c] mb-3 pl-1">
            Web Sources
          </h3>
          <div className="bg-[#f8fbfc] rounded-lg border border-[#cee2e8] divide-y divide-[#cee2e8]">
            {sources
              .filter((s) => s.id === "pricing" || s.id === "blog")
              .map((source) => (
                <div
                  key={source.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`size-10 rounded-full ${colorClasses[source.color]} flex items-center justify-center`}
                    >
                      <span className="material-symbols-outlined">
                        {source.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[#0d181c]">
                        {source.title}
                      </p>
                      <p className="text-sm text-[#49879c]">
                        {source.description}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sources[source.id]}
                      onChange={() => handleToggleSource(source.id)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
          </div>
        </div>

        {/* Social Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#49879c] mb-3 pl-1">
            Social Media
          </h3>
          <div className="bg-[#f8fbfc] rounded-lg border border-[#cee2e8] divide-y divide-[#cee2e8]">
            {sources
              .filter((s) => s.id === "instagram" || s.id === "linkedin")
              .map((source) => (
                <div
                  key={source.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`size-10 rounded-full ${colorClasses[source.color]} flex items-center justify-center`}
                    >
                      <span className="material-symbols-outlined">
                        {source.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[#0d181c]">
                        {source.title}
                      </p>
                      <p className="text-sm text-[#49879c]">
                        {source.description}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sources[source.id]}
                      onChange={() => handleToggleSource(source.id)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8 mt-auto border-t border-[#e7f0f4]">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-transparent hover:bg-[#f8fbfc] text-[#49879c] text-base font-bold transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-[#0aa6da] text-white text-base font-bold transition-colors shadow-md hover:shadow-lg"
        >
          Finish Setup
          <span className="material-symbols-outlined text-sm">check</span>
        </button>
      </div>
    </div>
  );
}
