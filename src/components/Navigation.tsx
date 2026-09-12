import React from "react";
import { useNatal } from "../context/NatalStore";

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, dueReviews } = useNatal();
  const reviewCount = dueReviews.length;

  const tabs = [
    {
      id: "today" as const,
      fa: "امروز",
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ),
    },
    {
      id: "path" as const,
      fa: "مسیر",
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
    {
      id: "review" as const,
      fa: "مرور",
      badge: reviewCount,
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 21h5v-5" />
        </svg>
      ),
    },
    {
      id: "stats" as const,
      fa: "شاخص‌ها",
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: "you" as const,
      fa: "پروفایل",
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      id="bottom-nav-bar"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50 bg-[#050505]/95 backdrop-blur-2xl border-t border-white/[0.05] flex items-center justify-around pt-2 pb-[calc(10px+env(safe-area-inset-bottom,0px))]"
      role="tablist"
      dir="rtl"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const hasDue = tab.id === "review" && reviewCount > 0;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none py-1 relative transition-all duration-200 group"
          >
            <div className="relative">
              <div className={`transition-transform duration-200 ${isActive ? "scale-105 text-[#F59E0B]" : "text-white/40 group-hover:text-white/70 group-hover:scale-105"}`}>
                {tab.icon(isActive)}
              </div>
              {hasDue && (
                <span
                  id="nav-due-counter"
                  className="absolute -top-1.5 -left-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#EF4444] border border-[#080808] flex items-center justify-center text-[8px] font-bold text-white font-mono leading-none shadow-sm"
                >
                  {reviewCount > 9 ? "+۹" : reviewCount}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center leading-none mt-0.5">
              <span
                className={`text-[10px] font-fa transition-colors duration-200 ${
                  isActive ? "text-[#F59E0B] font-bold" : "text-white/40 group-hover:text-white/70 font-medium"
                }`}
              >
                {tab.fa}
              </span>
            </div>

            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[#F59E0B] opacity-90" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
