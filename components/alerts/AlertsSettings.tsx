"use client";

import { useState } from "react";

export default function AlertsSettings() {
  const [digestFrequency, setDigestFrequency] = useState<"weekly" | "daily">("weekly");
  const [deliveryTime, setDeliveryTime] = useState("9:00 AM");
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);

  const handleSave = () => {
    // TODO: Replace with actual API call when backend is ready
    try {
      const settings = {
        digestFrequency,
        deliveryTime,
        realTimeAlerts,
      };
      localStorage.setItem("alert_settings", JSON.stringify(settings));
      // Show success message or toast notification
      alert("Alert settings saved successfully!");
    } catch (e) {
      console.error("Error saving alert settings:", e);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-col gap-3 mb-8">
        <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-[#0d181c]">
          Alerts & Notifications
        </h1>
        <p className="text-[#49879c] text-base font-normal leading-normal max-w-2xl">
          Manage how and when Competiview updates you on market changes.
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-4xl">
        {/* Email Digest Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e7f0f4]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <h3 className="text-[#0d181c] text-lg font-bold leading-tight">
              Email Digest Settings
            </h3>
          </div>

          {/* RadioList */}
          <div className="flex flex-col gap-4 mb-6">
            <label className="group relative flex cursor-pointer rounded-lg border border-[#e7f0f4] bg-[#f8fbfc] p-4 hover:border-primary/50 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <div className="flex items-start gap-4 w-full">
                <div className="flex items-center h-5">
                  <input
                    className="h-5 w-5 border-[#e7f0f4] text-primary focus:ring-primary bg-white cursor-pointer"
                    name="digest_frequency"
                    type="radio"
                    value="weekly"
                    checked={digestFrequency === "weekly"}
                    onChange={(e) => setDigestFrequency(e.target.value as "weekly" | "daily")}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#0d181c] text-sm font-bold leading-normal">
                    Weekly Digest
                  </span>
                  <span className="text-[#49879c] text-sm font-normal leading-normal">
                    Comprehensive summary of the last 7 days.
                  </span>
                </div>
              </div>
            </label>

            <label className="group relative flex cursor-pointer rounded-lg border border-[#e7f0f4] bg-[#f8fbfc] p-4 hover:border-primary/50 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <div className="flex items-start gap-4 w-full">
                <div className="flex items-center h-5">
                  <input
                    className="h-5 w-5 border-[#e7f0f4] text-primary focus:ring-primary bg-white cursor-pointer"
                    name="digest_frequency"
                    type="radio"
                    value="daily"
                    checked={digestFrequency === "daily"}
                    onChange={(e) => setDigestFrequency(e.target.value as "weekly" | "daily")}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#0d181c] text-sm font-bold leading-normal">
                    Daily Digest
                  </span>
                  <span className="text-[#49879c] text-sm font-normal leading-normal">
                    Summary of the last 24 hours of market activity.
                  </span>
                </div>
              </div>
            </label>
          </div>

          {/* Time Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[#0d181c] text-sm font-medium" htmlFor="delivery-time">
              Delivery Time
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-[#e7f0f4] bg-[#f8fbfc] py-3 px-4 text-[#0d181c] text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all cursor-pointer"
                id="delivery-time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              >
                <option>9:00 AM</option>
                <option>12:00 PM</option>
                <option>5:00 PM</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#49879c] material-symbols-outlined">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Alerts Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e7f0f4]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <span className="material-symbols-outlined">notifications_active</span>
            </div>
            <h3 className="text-[#0d181c] text-lg font-bold leading-tight">Real-time Alerts</h3>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-[#e7f0f4] bg-[#f8fbfc]">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[#0d181c] text-sm font-bold">
                High-Severity Push Notifications
              </span>
              <span className="text-[#49879c] text-xs sm:text-sm">
                Receive instant browser notifications for critical competitor moves (e.g. &gt;10%
                price drop).
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                className="sr-only peer"
                type="checkbox"
                checked={realTimeAlerts}
                onChange={(e) => setRealTimeAlerts(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end gap-4 mt-2">
          <button
            className="px-6 py-2.5 rounded-lg border border-[#e7f0f4] bg-white text-[#0d181c] text-sm font-bold hover:bg-[#f8fbfc] transition-colors cursor-pointer"
            onClick={() => {
              // Reset to default values
              setDigestFrequency("weekly");
              setDeliveryTime("9:00 AM");
              setRealTimeAlerts(true);
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-md hover:bg-[#0aa6da] transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
