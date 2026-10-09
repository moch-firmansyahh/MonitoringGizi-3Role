"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { User, Menu, Wifi, WifiOff, Bell, AlertTriangle, Activity, Calendar, X } from "lucide-react";
import ThemeToggle from "@/components/layouts/ThemeToggle";
import { usePathname } from "next/navigation";
import { offlineQueue } from "@/lib/offline/queue";

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  userName?: string;
  userSub?: string;
}

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerOnlineSnapshot() {
  return true;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  userName,
  userSub,
}) => {
  const pathname = usePathname();
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (isOnline) {
      offlineQueue.flush().then(() => {
        if (isMounted) offlineQueue.count().then(setPendingCount);
      });
    } else {
      offlineQueue.count().then((count) => {
        if (isMounted) setPendingCount(count);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  // Deteksi nama & faskes berdasarkan pathname jika tidak dipassing eksplisit
  let displayName = userName || "Bidan Sri Wahyuni, S.Tr.Keb";
  let displaySub = userSub || "Posyandu Melati 03";

  if (!userName && !userSub) {
    if (pathname.startsWith("/puskesmas")) {
      displayName = "Dr. Hj. Syahla Mutiara Latifah, M.Kes";
      displaySub = "Puskesmas Bojongsoang";
    } else if (pathname.startsWith("/orang-tua")) {
      displayName = "Rahmat Hidayat";
      displaySub = "Orang Tua Muhammad Arfan";
    }
  }

  return (
    <header className="w-full h-[66px] bg-white/90 dark:bg-[#161920]/90 backdrop-blur-md border-b border-gray-200/70 dark:border-zinc-800/70 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200 select-none">
      {/* Left: Mobile Menu Button (Hamburger) */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Right: Sync Status Badge + Notification Bell + Theme Switcher + User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
        {/* Offline / Sync Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-800 text-[11px] font-semibold transition-colors duration-150">
          {isOnline ? (
            pendingCount > 0 ? (
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>{pendingCount} Antrean Offline</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#0d472c] dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d472c] dark:bg-emerald-400" />
                <span>Tersinkron</span>
              </span>
            )
          ) : (
            <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/40">
              <WifiOff className="w-3 h-3 stroke-[2]" />
              <span>Offline (Lokal)</span>
            </span>
          )}
        </div>

        {/* Interactive Notification Bell Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasUnread(false);
            }}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative"
            aria-label="Pemberitahuan Sistem"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#161920]" />
            )}
          </button>

          {/* Popover Card */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-[50px] z-40 w-[310px] sm:w-[350px] bg-white dark:bg-[#161920] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-150 select-none">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
                    <h4 className="font-inter text-[13.5px] font-bold text-zinc-900 dark:text-zinc-100">
                      Pemberitahuan
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-zinc-800 max-h-[300px] overflow-y-auto">
                  <div className="py-2.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-[11.5px] font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Rujukan Medis Faskes</span>
                    </div>
                    <p className="text-[12.5px] text-zinc-700 dark:text-zinc-300 leading-snug">
                      Posyandu Melati 03 telah mengajukan rujukan ke Puskesmas Bojongsoang untuk ananda Muhammad Arfan.
                    </p>
                    <span className="text-[11px] text-zinc-400 block pt-0.5">12 Agustus 2026</span>
                  </div>

                  <div className="py-2.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0d472c] dark:text-emerald-400 text-[11.5px] font-semibold">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Hasil Pengukuran Antropometri</span>
                    </div>
                    <p className="text-[12.5px] text-zinc-700 dark:text-zinc-300 leading-snug">
                      Tinggi badan Muhammad Arfan tercatat 78.5 cm pada usia 28 bulan (TB/U -3.10 SD).
                    </p>
                    <span className="text-[11px] text-zinc-400 block pt-0.5">12 Agustus 2026</span>
                  </div>

                  <div className="py-2.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-[11.5px] font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Jadwal Penimbangan Rutin</span>
                    </div>
                    <p className="text-[12.5px] text-zinc-700 dark:text-zinc-300 leading-snug">
                      Penimbangan serentak balita berikutnya di Posyandu Melati 03 pada 12 September 2026.
                    </p>
                    <span className="text-[11px] text-zinc-400 block pt-0.5">Kemarin</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Switcher Toggle (Mode Gelap & Terang) */}
        <ThemeToggle />

        {/* User Profile Widget */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200 dark:border-zinc-800">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 flex items-center justify-center text-[#0d472c] dark:text-emerald-300 shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-inter text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
              {displayName}
            </span>
            <span className="font-inter text-[11.5px] text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5">
              {displaySub}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
