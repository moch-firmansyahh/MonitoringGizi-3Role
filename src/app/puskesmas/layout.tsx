"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";

export default function PuskesmasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen xl:h-screen xl:overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200">
      <Sidebar
        role="puskesmas"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 xl:h-screen xl:overflow-hidden">
        <Topbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          userName="Dr. Hj. Syahla Mutiara Latifah, M.Kes"
          userSub="Puskesmas Bojongsoang"
        />

        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1 xl:min-h-0 xl:overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
