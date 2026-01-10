"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AlertsSettings from "@/components/alerts/AlertsSettings";

export default function AlertsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fbfc]">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-[#f8fbfc]">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <AlertsSettings />
          </div>
        </div>
      </main>
    </div>
  );
}
