"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard", isActive: pathname === "/dashboard" },
    { href: "/competitors", icon: "groups", label: "Competitors", isActive: pathname === "/competitors" },
    { href: "/alerts", icon: "notifications", label: "Alerts", isActive: pathname === "/alerts" },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-[#cee2e8] bg-white lg:flex shrink-0">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-[#cee2e8]">
        <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-xl">
          <span className="material-symbols-outlined text-primary text-2xl">insights</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight text-[#0d181c]">Competiview</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  item.isActive
                    ? "bg-primary/10 text-primary"
                    : "text-[#49879c] hover:bg-gray-100"
                }`}
              >
                <span className={`material-symbols-outlined ${item.isActive ? "filled" : ""}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t border-[#cee2e8] p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 bg-cover bg-center"></div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#0d181c]">Keeret Mahi</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
