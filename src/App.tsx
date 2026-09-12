import React, { useState } from "react";
import { NatalProvider, useNatal } from "./context/NatalStore";
import { Navigation } from "./components/Navigation";
import { TodayTab } from "./components/TodayTab";
import { PathTab } from "./components/PathTab";
import { ReviewTab } from "./components/ReviewTab";
import { StatsTab } from "./components/StatsTab";
import { YouTab } from "./components/YouTab";
import { CurriculumEditorModal } from "./components/CurriculumEditorModal";
import { FloatingPomodoroBar } from "./components/FloatingPomodoroBar";
import { PWAInstallBanner } from "./components/PWAInstallBanner";

const MainContent: React.FC = () => {
  const { activeTab } = useNatal();
  const [showCurriculumEditor, setShowCurriculumEditor] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] selection:bg-[#F59E0B] selection:text-black flex justify-center">
      {/* Centered Device / App Shell matching Natal & Linear mobile container */}
      <div className="w-full max-w-[440px] min-h-screen bg-[#050505] flex flex-col relative border-x border-white/[0.04] sm:shadow-[0_0_60px_rgba(0,0,0,0.9)] pb-[72px]">
        {/* Safe-area top spacer */}
        <div className="h-[env(safe-area-inset-top,0px)] bg-[#050505] w-full" />

        {/* PWA In-App Install Banner (Suppresses automatically when in standalone mode) */}
        <div className="pt-2">
          <PWAInstallBanner />
        </div>

        {/* Dynamic Tab View */}
        <main className="flex-1 w-full">
          {activeTab === "today" && <TodayTab />}
          {activeTab === "path" && <PathTab onOpenCurriculumEditor={() => setShowCurriculumEditor(true)} />}
          {activeTab === "review" && <ReviewTab />}
          {activeTab === "stats" && <StatsTab />}
          {activeTab === "you" && <YouTab onOpenCurriculumEditor={() => setShowCurriculumEditor(true)} />}
        </main>

        {/* Floating Pomodoro Bar */}
        <FloatingPomodoroBar />

        {/* Curriculum Architect Modal */}
        {showCurriculumEditor && (
          <CurriculumEditorModal onClose={() => setShowCurriculumEditor(false)} />
        )}

        {/* Fixed Bottom Navigation */}
        <Navigation />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <NatalProvider>
      <MainContent />
    </NatalProvider>
  );
}
