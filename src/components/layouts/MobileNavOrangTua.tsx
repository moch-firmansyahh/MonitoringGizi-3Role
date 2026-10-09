"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Calendar, PlusCircle } from "lucide-react";

export const MobileNavOrangTua: React.FC = () => {
  const pathname = usePathname();

  const navs = [
    { label: "Beranda", href: "/orang-tua", icon: Home },
    { label: "Grafik WHO", href: "/orang-tua/perkembangan", icon: TrendingUp },
    { label: "Jadwal", href: "/orang-tua/jadwal", icon: Calendar },
    { label: "Klaim Balita", href: "/orang-tua/klaim", icon: PlusCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#161920]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-zinc-800 flex items-center justify-around h-[64px] px-2 select-none">
      {navs.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
              isActive
                ? "text-[#0d472c] dark:text-emerald-300 font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                isActive ? "stroke-[2.2] scale-105" : "stroke-[1.8]"
              } transition-transform`}
            />
            <span className="text-[11px] mt-0.5 leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNavOrangTua;
