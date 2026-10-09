"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import MobileNavOrangTua from "@/components/layouts/MobileNavOrangTua";

export default function OrangTuaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200 pb-16 lg:pb-0">
      <Sidebar
        role="orang_tua"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          userName="Rahmat Hidayat"
          userSub="Orang Tua Balita"
        />

        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 w-full flex-1 max-w-4xl mx-auto">
          {children}
        </main>
      </div>

      <div className="lg:hidden">
        <MobileNavOrangTua />
      </div>
    </div>
  );
}
