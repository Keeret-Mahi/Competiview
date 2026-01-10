"use client";

import { FormData } from "@/app/onboarding/page";

interface Step1BusinessInfoProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}

export default function Step1BusinessInfo({
  formData,
  updateFormData,
  onNext,
}: Step1BusinessInfoProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.websiteUrl && formData.category && formData.country && formData.city && formData.postalCode) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0d181c] mb-2">
          Tell us about your business
        </h1>
        <p className="text-[#49879c] text-lg">
          We'll use this to find your local competitors automatically.
        </p>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        <label className="flex flex-col w-full">
          <span className="text-[#0d181c] text-base font-semibold mb-2">
            Business Website URL <span className="text-red-500">*</span>
          </span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
              language
            </span>
            <input
              className="form-input flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-14 pl-12 pr-4 text-[#0d181c] placeholder:text-[#49879c] text-base transition-all"
              placeholder="https://www.yourbusiness.com"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) =>
                updateFormData({ websiteUrl: e.target.value })
              }
              required
            />
          </div>
        </label>

        <label className="flex flex-col w-full">
          <span className="text-[#0d181c] text-base font-semibold mb-2">
            Instagram URL <span className="text-[#49879c] text-sm font-normal">(Optional)</span>
          </span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
              photo_camera
            </span>
            <input
              className="form-input flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-14 pl-12 pr-4 text-[#0d181c] placeholder:text-[#49879c] text-base transition-all"
              placeholder="https://instagram.com/yourbusiness"
              type="url"
              value={formData.instagramUrl || ""}
              onChange={(e) =>
                updateFormData({ instagramUrl: e.target.value })
              }
            />
          </div>
        </label>

        <label className="flex flex-col w-full">
          <span className="text-[#0d181c] text-base font-semibold mb-2">
            LinkedIn URL <span className="text-[#49879c] text-sm font-normal">(Optional)</span>
          </span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
              work
            </span>
            <input
              className="form-input flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-14 pl-12 pr-4 text-[#0d181c] placeholder:text-[#49879c] text-base transition-all"
              placeholder="https://linkedin.com/company/yourbusiness"
              type="url"
              value={formData.linkedinUrl || ""}
              onChange={(e) =>
                updateFormData({ linkedinUrl: e.target.value })
              }
            />
          </div>
        </label>

        <label className="flex flex-col w-full">
          <span className="text-[#0d181c] text-base font-semibold mb-2">
            Business Category <span className="text-red-500">*</span>
          </span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
              category
            </span>
            <select
              className="form-select flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-14 pl-12 pr-10 text-[#0d181c] text-base transition-all appearance-none cursor-pointer"
              value={formData.category}
              onChange={(e) => updateFormData({ category: e.target.value })}
              required
            >
              <option disabled value="">
                Select a category
              </option>
              <option value="restaurant">Restaurant</option>
              <option value="retail">Retail</option>
              <option value="saas">SaaS / Software</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="finance">Finance & Banking</option>
              <option value="healthcare">Healthcare</option>
              <option value="fitness">Fitness & Gym</option>
              <option value="education">Education</option>
              <option value="real-estate">Real Estate</option>
              <option value="legal">Legal Services</option>
              <option value="consulting">Consulting</option>
              <option value="marketing">Marketing & Advertising</option>
              <option value="beauty">Beauty & Salon</option>
              <option value="automotive">Automotive</option>
              <option value="construction">Construction</option>
              <option value="hospitality">Hospitality & Hotels</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="logistics">Logistics & Transportation</option>
              <option value="energy">Energy & Utilities</option>
              <option value="telecom">Telecommunications</option>
              <option value="agriculture">Agriculture</option>
              <option value="nonprofit">Non-Profit</option>
              <option value="other">Other</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#49879c] pointer-events-none">
              expand_more
            </span>
          </div>
        </label>

        {/* Location Fields */}
        <div className="flex flex-col gap-4 pt-2">
          <h3 className="text-[#0d181c] text-base font-semibold">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col w-full">
              <span className="text-[#0d181c] text-sm font-semibold mb-2">
                Country <span className="text-red-500">*</span>
              </span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
                  public
                </span>
                <input
                  className="form-input flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-14 pl-12 pr-4 text-[#0d181c] placeholder:text-[#49879c] text-base transition-all"
                  placeholder="United States"
                  type="text"
                  value={formData.country || ""}
                  onChange={(e) =>
                    updateFormData({ country: e.target.value })
                  }
                  required
                />
              </div>
            </label>

            <label className="flex flex-col w-full">
              <span className="text-[#0d181c] text-sm font-semibold mb-2">
                City <span className="text-red-500">*</span>
              </span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
                  location_city
                </span>
                <input
                  className="form-input flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-14 pl-12 pr-4 text-[#0d181c] placeholder:text-[#49879c] text-base transition-all"
                  placeholder="San Francisco"
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) =>
                    updateFormData({ city: e.target.value })
                  }
                  required
                />
              </div>
            </label>

            <label className="flex flex-col w-full">
              <span className="text-[#0d181c] text-sm font-semibold mb-2">
                Postal Code <span className="text-red-500">*</span>
              </span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49879c]">
                  pin_drop
                </span>
                <input
                  className="form-input flex w-full rounded-lg border border-[#cee2e8] bg-[#f8fbfc] focus:ring-2 focus:ring-primary focus:border-transparent h-14 pl-12 pr-4 text-[#0d181c] placeholder:text-[#49879c] text-base transition-all"
                  placeholder="94102"
                  type="text"
                  value={formData.postalCode || ""}
                  onChange={(e) =>
                    updateFormData({ postalCode: e.target.value })
                  }
                  required
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8 mt-auto border-t border-[#e7f0f4]">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-[#0aa6da] text-white text-base font-bold transition-colors shadow-md hover:shadow-lg cursor-pointer"
        >
          Continue
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}
