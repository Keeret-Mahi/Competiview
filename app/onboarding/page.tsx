"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import ProgressBar from "@/components/onboarding/ProgressBar";
import Step1BusinessInfo from "@/components/onboarding/steps/Step1BusinessInfo";
import Step2Competitors from "@/components/onboarding/steps/Step2Competitors";

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  initial: string;
  color: string;
  matchScore: number;
  selected: boolean;
}

export interface FormData {
  websiteUrl: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  category: string;
  country?: string;
  city?: string;
  postalCode?: string;
  competitors: Competitor[];
  sources: {
    pricing: boolean;
    blog: boolean;
    instagram: boolean;
    linkedin: boolean;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    websiteUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    category: "",
    country: "",
    city: "",
    postalCode: "",
    competitors: [],
    sources: {
      pricing: true,
      blog: true,
      instagram: false,
      linkedin: true,
    },
  });

  const stepNames = [
    "",
    "Business Info",
    "Select Competitors",
  ];

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Save onboarding data to localStorage (temporary until backend is ready)
    // TODO: Replace with actual API call when backend is ready
    try {
      const onboardingData = {
        competitors: formData.competitors.filter((c) => c.selected),
        websiteUrl: formData.websiteUrl,
        category: formData.category,
        country: formData.country,
        city: formData.city,
        postalCode: formData.postalCode,
      };
      localStorage.setItem("onboarding_data", JSON.stringify(onboardingData));
    } catch (e) {
      console.error("Error saving onboarding data:", e);
    }
    // Redirect to dashboard (will redirect to onboarding for now since dashboard is not in git)
    router.push("/dashboard");
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      <OnboardingHeader />
      
      <main className="flex-1 flex justify-center items-start pt-10 pb-20 px-4 md:px-10 overflow-y-auto">
        <div className="w-full max-w-[800px] flex flex-col gap-8">
          {/* Progress Bar Section */}
          <ProgressBar
            currentStep={currentStep}
            stepName={stepNames[currentStep]}
            totalSteps={2}
          />

          {/* Wizard Card Container */}
          <div className="bg-white rounded-xl shadow-lg border border-[#e7f0f4] p-8 min-h-[500px] flex flex-col">
            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <Step1BusinessInfo
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNext}
              />
            )}

            {/* Step 2: Competitor Discovery */}
            {currentStep === 2 && (
              <Step2Competitors
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleFinish}
                onBack={handleBack}
              />
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-[#98aeb6] text-sm">
              © 2024 Competiview Inc. All rights reserved.
            </p>
          </div>
        </div>
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-[0%] left-[0%] w-[30%] h-[30%] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
