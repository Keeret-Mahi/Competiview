"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Temporary placeholder page - Full dashboard will be committed later
// Dashboard components are excluded from git for now
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect back to onboarding for now since dashboard is not ready for commit
    router.push("/onboarding");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
      <div className="text-center">
        <div className="mb-4">
          <span className="material-symbols-outlined text-6xl text-[#49879c]">dashboard</span>
        </div>
        <p className="text-[#0d181c] text-xl font-bold mb-2">Dashboard Coming Soon</p>
        <p className="text-[#49879c] text-sm">Redirecting to onboarding...</p>
      </div>
    </div>
  );
}
