"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import useSidebarCollapse from "@/hooks/useSidebarCollapse";
import { RolePengguna } from "@/types";
import { ROLE_NAV_ITEMS } from "@/lib/constants/navigation";

interface SidebarProps {
  currentTab?: string;
  role?: RolePengguna;
  onSelectTab?: (tabId: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  role,
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();

  // Deteksi role aktif berdasarkan props atau pathname
  const activeRole: RolePengguna =
    role ||
    (pathname.startsWith("/puskesmas")
      ? "puskesmas"
      : pathname.startsWith("/orang-tua")
      ? "orang_tua"
      : "posyandu");

  const navItems = ROLE_NAV_ITEMS[activeRole] || ROLE_NAV_ITEMS.posyandu;

  const handleNavClick = (id: string, href: string) => {
    if (onSelectTab) {
      onSelectTab(id);
    } else {
      router.push(href);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Abaikan jika network offline
    }
    document.cookie =
      "simgizi-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "simgizi_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "simgizi_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
    router.refresh();
  };

  const renderContent = (collapsed: boolean, isMobile = false) => (
    <aside
      className={`relative ${
        collapsed && !isMobile ? "w-[80px]" : "w-[290px]"
      } h-full bg-white dark:bg-[#161920] border-r border-gray-200/70 dark:border-zinc-800/70 flex flex-col justify-between p-0 shrink-0 transition-[width] duration-300 ease-in-out select-none z-30 overflow-visible`}
    >
      {/* Tombol Bulat Melayang di TENGAH VERTIKAL Garis Sidebar (w-8 h-8 -right-4) */}
      {!isMobile && (
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-[#1e222d] border border-gray-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm hover:scale-110 active:scale-95 transition-all duration-200 items-center justify-center z-40 cursor-pointer"
          title={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          aria-label={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4 stroke-[2]" />
          ) : (
            <ChevronsLeft className="w-4 h-4 stroke-[2]" />
          )}
        </button>
      )}

      {/* Top Header & Navigation */}
      <div className="w-full">
        {/* Brand Header (Tinggi h-[66px] Sejajar Sempurna dengan Topbar h-[66px]) */}
        <div className="h-[66px] px-4 flex items-center justify-between border-b border-gray-200/70 dark:border-zinc-800/70 shrink-0">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-[36px] h-[36px] rounded-xl overflow-hidden flex items-center justify-center shadow-xs shrink-0">
              <Image
                src="/images/Logo-SimGizi.png"
                alt="Logo SimGizi"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                unoptimized
                priority
              />
            </div>
            <span
              className={`font-inter text-[19px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                collapsed && !isMobile
                  ? "max-w-0 opacity-0 ml-0"
                  : "max-w-[140px] opacity-100"
              }`}
            >
              SimGizi
            </span>
          </div>

          {/* Close button for mobile drawer */}
          {isMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4 stroke-[1.8]" />
            </button>
          )}
        </div>

        {/* Nav Items List */}
        <nav className="p-4 space-y-2 flex flex-col items-start w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentTab === item.id ||
              pathname === item.href ||
              (pathname === "/" && item.id === "dashboard");

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.href)}
                title={collapsed && !isMobile ? item.label : undefined}
                className={`w-full h-[46px] px-3.5 rounded-xl flex items-center transition-all duration-200 group cursor-pointer text-left ${
                  isActive
                    ? "bg-[#eaf5ec] dark:bg-[#1b2720] text-[#0d472c] dark:text-emerald-300 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
                }`}
              >
                <div className="w-[20px] h-[20px] flex items-center justify-center shrink-0">
                  <Icon
                    className={`w-[19px] h-[19px] transition-colors stroke-[1.8] ${
                      isActive
                        ? "text-[#0d472c] dark:text-emerald-300 stroke-[2.2]"
                        : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                    }`}
                  />
                </div>
                <span
                  className={`font-inter text-[15px] whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    collapsed && !isMobile
                      ? "max-w-0 opacity-0 ml-0"
                      : "max-w-[180px] opacity-100 ml-3"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button (Center Aligned) */}
      <div className="flex justify-center w-full p-4 pb-4">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed && !isMobile ? "Log Out" : undefined}
          className="w-full h-[44px] px-3.5 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl flex items-center justify-center transition-colors cursor-pointer font-inter text-[15px] font-medium"
        >
          <div className="w-[20px] h-[20px] flex items-center justify-center shrink-0">
            <LogOut className="w-[19px] h-[19px] text-rose-500 stroke-[1.8]" />
          </div>
          <span
            className={`font-inter text-[15px] whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed && !isMobile
                ? "max-w-0 opacity-0 ml-0"
                : "max-w-[120px] opacity-100 ml-2.5"
            }`}
          >
            Log Out
          </span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 z-30">
        {renderContent(isCollapsed, false)}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden flex fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 max-w-[290px] w-full h-full z-10 shadow-2xl transition-transform duration-300">
            {renderContent(false, true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
