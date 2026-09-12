import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // If installable directly (Android Chrome, Edge, Desktop Chrome)
  if (isInstallable) {
    return (
      <div id="pwa-install-banner" className="w-full max-w-[460px] mx-auto px-4 mb-3">
        <div className="bg-gradient-to-r from-[#00F5A0]/15 via-[#00D9F5]/10 to-[#00F5A0]/5 border border-[#00F5A0]/30 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg shadow-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/pwa-192x192.png" alt="Natal" className="w-9 h-9 rounded-xl border border-white/10 shrink-0" />
            <div className="min-w-0" dir="rtl">
              <div className="text-[12px] font-bold text-white leading-tight font-fa truncate">
                نصب نسخه وب‌اپ (PWA)
              </div>
              <div className="text-[10px] text-[#00F5A0] font-fa font-medium leading-tight mt-0.5">
                تجربه تمام‌صفحه و بدون نوار آدرس مرورگر
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={install}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#00F5A0] hover:bg-[#00d98d] text-slate-950 text-[11px] font-bold rounded-xl shadow-md font-fa transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>نصب</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-white/40 hover:text-white transition-colors"
              title="بستن"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If on iOS Safari
  if (isIOS) {
    return (
      <>
        <div id="pwa-install-banner-ios" className="w-full max-w-[460px] mx-auto px-4 mb-3">
          <div className="bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-500/5 border border-blue-400/30 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg shadow-black/40 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/apple-touch-icon.png" alt="Natal" className="w-9 h-9 rounded-xl border border-white/10 shrink-0" />
              <div className="min-w-0" dir="rtl">
                <div className="text-[12px] font-bold text-white leading-tight font-fa truncate">
                  نصب روی آیفون / آیپد
                </div>
                <div className="text-[10px] text-blue-300 font-fa font-medium leading-tight mt-0.5">
                  حذف نوار آدرس و تبدیل به اپلیکیشن بومی
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-[11px] font-bold rounded-xl shadow-md font-fa transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>راهنما</span>
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-white/40 hover:text-white transition-colors"
                title="بستن"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* iOS Safari Guide Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-[#11131c] border border-white/10 p-5 shadow-2xl space-y-4" dir="rtl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <img src="/apple-touch-icon.png" alt="Natal" className="w-8 h-8 rounded-lg" />
                  <h3 className="text-[15px] font-bold text-white font-fa">نصب روی صفحه اصلی (iOS)</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 font-fa leading-relaxed">
                <div className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#00F5A0]/20 text-[#00F5A0] font-bold shrink-0 text-xs">
                    ۱
                  </span>
                  <div>
                    در نوار پایین یا بالای مرورگر Safari، دکمه <strong className="text-white">Share (اشتراک‌گذاری)</strong> <span className="inline-block px-1.5 py-0.5 bg-white/10 rounded">⎋</span> را بزنید.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#00F5A0]/20 text-[#00F5A0] font-bold shrink-0 text-xs">
                    ۲
                  </span>
                  <div>
                    در منوی باز شده به پایین اسکرول کرده و گزینه <strong className="text-white">Add to Home Screen (افزودن به صفحه اصلی)</strong> <span className="inline-block px-1.5 py-0.5 bg-white/10 rounded">⊞</span> را انتخاب کنید.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#00F5A0]/20 text-[#00F5A0] font-bold shrink-0 text-xs">
                    ۳
                  </span>
                  <div>
                    در گوشه بالا دکمه <strong className="text-[#00F5A0]">Add</strong> را بزنید. اکنون برنامه مانند یک اپلیکیشن بومی بدون نوار آدرس باز خواهد شد!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-[#00F5A0] text-slate-950 font-bold rounded-2xl font-fa text-xs transition active:scale-98 shadow-md"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
