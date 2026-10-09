"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import WhoRulesModal from "@/components/_shared/WhoRulesModal";
import CustomSelect from "@/components/forms/CustomSelect";
import { showToast } from "@/lib/custom-toast";

import {
  Book,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Filter,
  Sparkles,
} from "lucide-react";

import { AnakRecord } from "@/lib/data-anak";
import { useDataAnak, deleteDataAnak } from "@/lib/data-anak-store";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  SkeletonTableBody,
  SkeletonTableFooter,
} from "@/components/_shared/skeletons";

export default function RekapDataGiziPage() {
  const hasMounted = useHasMounted();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWhoRules, setShowWhoRules] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Kategori");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedChild, setSelectedChild] = useState<AnakRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnakRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl + F / Cmd + F Shortcut for Quick Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Centralized Reactive Store (Persisted to localStorage)
  const allChildren = useDataAnak();

  /* export */
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);

      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: allChildren,
          filter: statusFilter !== "Semua Kategori" ? statusFilter : "",
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memuat dokumen PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (err) {
      console.error("Export PDF error:", err);
      showToast.error("Gagal membuka dokumen PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  /* filter */
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return allChildren.filter((child) => {
      const matchesSearch =
        child.nama.toLowerCase().includes(query) || child.nik.includes(query);

      const matchesStatus =
        statusFilter === "Semua Kategori" || child.statusGizi === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allChildren, searchQuery, statusFilter]);

  /* =========================================================================
     PAGINATION DATA (Murni Terpisah untuk Laptop & Monitor Tanpa State Resize)
     ========================================================================= */
  // 1. LAPTOP (< 850px height): Murni 3 data per halaman
  const totalPagesLaptop = Math.max(1, Math.ceil(filteredData.length / 3));
  const validPageLaptop = Math.min(currentPage, totalPagesLaptop);
  const currentItemsLaptop = filteredData.slice(
    (validPageLaptop - 1) * 3,
    validPageLaptop * 3,
  );

  // 2. MONITOR (>= 850px height): Murni 8 data per halaman
  const totalPagesMonitor = Math.max(1, Math.ceil(filteredData.length / 8));
  const validPageMonitor = Math.min(currentPage, totalPagesMonitor);
  const currentItemsMonitor = filteredData.slice(
    (validPageMonitor - 1) * 8,
    validPageMonitor * 8,
  );

  /* Page Jump Input states */
  const [pageInputLaptop, setPageInputLaptop] = useState(
    String(validPageLaptop),
  );
  const [prevValidLaptop, setPrevValidLaptop] = useState(validPageLaptop);
  if (prevValidLaptop !== validPageLaptop) {
    setPrevValidLaptop(validPageLaptop);
    setPageInputLaptop(String(validPageLaptop));
  }

  const [pageInputMonitor, setPageInputMonitor] = useState(
    String(validPageMonitor),
  );
  const [prevValidMonitor, setPrevValidMonitor] = useState(validPageMonitor);
  if (prevValidMonitor !== validPageMonitor) {
    setPrevValidMonitor(validPageMonitor);
    setPageInputMonitor(String(validPageMonitor));
  }

  /* delete */
  const handleDelete = () => {
    if (!deleteTarget) return;

    deleteDataAnak(deleteTarget.id);
    showToast.delete(`Data balita ${deleteTarget.nama} berhasil dihapus`);
    setDeleteTarget(null);
  };

  /* badge */
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-[#eaf5ec] dark:bg-emerald-950/40 text-[#0d472c] dark:text-emerald-300 font-medium";

      case "Gizi Kurang":
        return "bg-[#fef6dc] dark:bg-[#332b00] text-[#b45309] dark:text-[#fde047] font-medium";

      case "Gizi Buruk":
        return "bg-[#fff0eb] dark:bg-[#3a1d17] text-[#c2410c] dark:text-[#FFA382] font-medium";

      case "Stunting":
        return "bg-[#fde8e8] dark:bg-[#3b1212] text-[#a81a1a] dark:text-[#f87171] font-medium";

      default:
        return "bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium";
    }
  };

  const statusOptions = [
    {
      value: "Semua Kategori",
      label: "Semua Kategori",
    },
    {
      value: "Normal",
      label: "Normal",
    },
    {
      value: "Gizi Kurang",
      label: "Gizi Kurang",
    },
    {
      value: "Gizi Buruk",
      label: "Gizi Buruk",
    },
    {
      value: "Stunting",
      label: "Stunting",
    },
  ];

  /* Row render helper with explicit height */
  const renderRow = (child: AnakRecord) => (
    <tr
      key={child.id}
      className="h-[54px] hover:bg-gray-50/80 dark:hover:bg-zinc-800/40"
    >
      <td className="py-3 px-4">
        <div className="font-bold leading-tight">{child.nama}</div>
        <div className="text-[11.5px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          {child.nik}
        </div>
      </td>

      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
        {child.usiaBulan} Bulan ({child.jenisKelamin})
      </td>

      <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
        {child.beratBadan} kg / {child.tinggiBadan} cm
      </td>

      <td className="py-3 px-4">
        <span
          className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium inline-block ${getBadgeStyle(
            child.statusGizi,
          )}`}
        >
          {child.statusGizi}
        </span>
      </td>

      <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
        {child.zScoreTBU}
      </td>

      <td className="py-3 px-4 text-center">
        <button
          type="button"
          onClick={() => setSelectedChild(child)}
          className="px-3.5 py-1.5 bg-[#0d472c] hover:bg-[#0a3923] text-white rounded-full text-[12px] font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          Detail
        </button>
      </td>

      <td className="py-3 px-4 text-center">
        <button
          type="button"
          onClick={() => setDeleteTarget(child)}
          className="p-2 bg-[#FDEAEA] hover:bg-rose-200 dark:bg-rose-950/40 text-[#B91C1C] dark:text-rose-300 rounded-full inline-flex items-center justify-center cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen xl:h-screen xl:overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter select-none">
      {/* sidebar */}
      <Sidebar
        currentTab="rekap-data-gizi"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 xl:h-screen xl:overflow-hidden">
        {/* topbar */}
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <WhoRulesModal
          isOpen={showWhoRules}
          onClose={() => setShowWhoRules(false)}
        />

        {/* content */}
        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1 xl:min-h-0 xl:overflow-hidden">
          {/* header */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight">
              Rekap Data Gizi
            </h1>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowWhoRules(true)}
                className="px-4 h-[42px] bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 text-[#0d472c] dark:text-emerald-300 text-[14px] font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Book className="w-[18px] h-[18px]" />
                <span>Rumus & Aturan WHO</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="h-[42px] px-4 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1e222d] hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download
                  className={`w-[18px] h-[18px] ${
                    isExporting ? "animate-bounce" : ""
                  }`}
                />
                <span>{isExporting ? "Memuat PDF..." : "Export PDF"}</span>
              </button>
            </div>
          </div>

          {/* card */}
          <section className="bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-[24px] p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5">
            {/* title */}
            <div>
              <h2 className="text-[18px] sm:text-[19px] font-semibold leading-tight">
                Rekapitulasi Data Gizi Balita
              </h2>
              <p className="text-[13px] sm:text-[13.5px] text-zinc-400 dark:text-zinc-500 mt-1">
                Daftar seluruh balita terdaftar dan status risiko WHO
              </p>
            </div>

            {/* search & filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:flex-1 h-[42px]">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-full pl-9 pr-4 bg-white dark:bg-[#1e222d] rounded-xl text-[13.5px] border border-gray-200 dark:border-zinc-700 focus:border-[#0d472c] focus:outline-none placeholder:text-zinc-400"
                />
              </div>

              <div className="h-[42px] flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1e222d] rounded-xl px-3.5 shrink-0">
                <Filter className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
                <span className="text-[13px] text-zinc-400 font-medium">
                  Filter:
                </span>
                <CustomSelect
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  triggerClassName="px-3.5 py-1.5 bg-white dark:bg-[#161920] border border-gray-200/90 dark:border-zinc-700 rounded-xl text-[12.5px] font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5"
                />
              </div>
            </div>

            {/* table container */}
            <div className="w-full border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-white dark:bg-[#161920]">
              <div className="w-full overflow-x-auto overflow-y-hidden">
                <table className="w-full min-w-[900px] text-left text-[13.5px] border-collapse">
                  <thead>
                    <tr className="bg-[#f8f9fa] dark:bg-[#1e222d] border-b border-gray-200/80 dark:border-zinc-800 font-bold text-[13px] h-[48px]">
                      <th className="py-3 px-4 w-[24%] whitespace-nowrap">
                        Anak &amp; NIK
                      </th>
                      <th className="py-3 px-4 w-[13%] whitespace-nowrap">
                        Usia / JK
                      </th>
                      <th className="py-3 px-4 w-[16%] whitespace-nowrap">
                        BB / TB
                      </th>
                      <th className="py-3 px-4 w-[14%] whitespace-nowrap">
                        Status Gizi
                      </th>
                      <th className="py-3 px-4 w-[11%] whitespace-nowrap">
                        Z Score TB/U
                      </th>
                      <th className="py-3 px-4 w-[13%] text-center whitespace-nowrap">
                        Aksi
                      </th>
                      <th className="py-3 px-4 w-[9%] text-center whitespace-nowrap">
                        -
                      </th>
                    </tr>
                  </thead>

                  {/* ========================================================
                      TBODY WITH SKELETON LOADING GUARD
                      ======================================================== */}
                  {!hasMounted ? (
                    <SkeletonTableBody />
                  ) : (
                    <>
                      {/* TBODY LAPTOP (< 850px height) — Murni 3 data per halaman */}
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 hidden [@media(max-height:849px)]:table-row-group animate-fade-in">
                        {currentItemsLaptop.length > 0 ? (
                          currentItemsLaptop.map(renderRow)
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-12 text-center text-zinc-400 font-medium"
                            >
                              Belum ada data balita.
                            </td>
                          </tr>
                        )}
                      </tbody>

                      {/* TBODY MONITOR (>= 850px height) — Murni 8 data per halaman */}
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 hidden [@media(min-height:850px)]:table-row-group animate-fade-in">
                        {currentItemsMonitor.length > 0 ? (
                          currentItemsMonitor.map(renderRow)
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-12 text-center text-zinc-400 font-medium"
                            >
                              Belum ada data balita.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </>
                  )}
                </table>
              </div>

              {/* =========================================
                  PAGINATION FOOTER WITH SKELETON GUARD
                  ========================================= */}
              {!hasMounted ? (
                <SkeletonTableFooter />
              ) : (
                <>
                  {/* PAGINATION FOOTER (LAPTOP: < 850px) */}
                  <div className="h-[58px] shrink-0 px-3.5 bg-[#f8f9fa] dark:bg-[#1e222d] border-t border-gray-200/80 dark:border-zinc-800 hidden [@media(max-height:849px)]:flex items-center justify-between gap-3 text-[13px] font-medium text-zinc-500">
                    <div>
                      Halaman {validPageLaptop} dari {totalPagesLaptop} (
                      {filteredData.length} balita)
                    </div>

                    {/* CAPSULE PAGINATION CONTROL WITH DIRECT TYPE INPUT */}
                    <div className="inline-flex items-center rounded-lg bg-[#f0f2f5] dark:bg-[#1f242d] border border-gray-200/90 dark:border-zinc-700/80 p-0.5 shadow-2xs">
                      {/* PREVIOUS BUTTON */}
                      <button
                        type="button"
                        disabled={validPageLaptop <= 1}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-[4px] transition-colors"
                        aria-label="Halaman sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                      </button>

                      {/* ACTIVE PAGE INPUT (CLICK TO TYPE DIRECTLY) */}
                      <input
                        type="text"
                        inputMode="numeric"
                        value={pageInputLaptop}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setPageInputLaptop(val);
                          if (val !== "") {
                            const num = parseInt(val, 10);
                            if (num >= 1 && num <= totalPagesLaptop) {
                              setCurrentPage(num);
                            }
                          }
                        }}
                        onBlur={() => {
                          if (
                            !pageInputLaptop ||
                            parseInt(pageInputLaptop, 10) < 1
                          ) {
                            setCurrentPage(1);
                            setPageInputLaptop("1");
                          } else if (
                            parseInt(pageInputLaptop, 10) > totalPagesLaptop
                          ) {
                            setCurrentPage(totalPagesLaptop);
                            setPageInputLaptop(String(totalPagesLaptop));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-[38px] h-8 text-center bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 font-bold text-[13px] rounded-[4px] shadow-xs border border-gray-200/60 dark:border-zinc-700/60 focus:outline-none focus:ring-1.5 focus:ring-[#0d472c] dark:focus:ring-emerald-500 cursor-text"
                        aria-label="Nomor halaman aktif"
                        title="Ketik nomor halaman dan tekan Enter"
                      />

                      {/* NEXT BUTTON */}
                      <button
                        type="button"
                        disabled={validPageLaptop >= totalPagesLaptop}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPagesLaptop),
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-[4px] transition-colors"
                        aria-label="Halaman berikutnya"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>

                  {/* PAGINATION FOOTER (MONITOR: >= 850px) */}
                  <div className="h-[58px] shrink-0 px-3.5 bg-[#f8f9fa] dark:bg-[#1e222d] border-t border-gray-200/80 dark:border-zinc-800 hidden [@media(min-height:850px)]:flex items-center justify-between gap-3 text-[13px] font-medium text-zinc-500">
                    <div>
                      Halaman {validPageMonitor} dari {totalPagesMonitor} (
                      {filteredData.length} balita)
                    </div>

                    {/* CAPSULE PAGINATION CONTROL WITH DIRECT TYPE INPUT */}
                    <div className="inline-flex items-center rounded-lg bg-[#f0f2f5] dark:bg-[#1f242d] border border-gray-200/90 dark:border-zinc-700/80 p-0.5 shadow-2xs">
                      {/* PREVIOUS BUTTON */}
                      <button
                        type="button"
                        disabled={validPageMonitor <= 1}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-[4px] transition-colors"
                        aria-label="Halaman sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                      </button>

                      {/* ACTIVE PAGE INPUT (CLICK TO TYPE DIRECTLY) */}
                      <input
                        type="text"
                        inputMode="numeric"
                        value={pageInputMonitor}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setPageInputMonitor(val);
                          if (val !== "") {
                            const num = parseInt(val, 10);
                            if (num >= 1 && num <= totalPagesMonitor) {
                              setCurrentPage(num);
                            }
                          }
                        }}
                        onBlur={() => {
                          if (
                            !pageInputMonitor ||
                            parseInt(pageInputMonitor, 10) < 1
                          ) {
                            setCurrentPage(1);
                            setPageInputMonitor("1");
                          } else if (
                            parseInt(pageInputMonitor, 10) > totalPagesMonitor
                          ) {
                            setCurrentPage(totalPagesMonitor);
                            setPageInputMonitor(String(totalPagesMonitor));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-[38px] h-8 text-center bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 font-bold text-[13px] rounded-[4px] shadow-xs border border-gray-200/60 dark:border-zinc-700/60 focus:outline-none focus:ring-1.5 focus:ring-[#0d472c] dark:focus:ring-emerald-500 cursor-text"
                        aria-label="Nomor halaman aktif"
                        title="Ketik nomor halaman dan tekan Enter"
                      />

                      {/* NEXT BUTTON */}
                      <button
                        type="button"
                        disabled={validPageMonitor >= totalPagesMonitor}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPagesMonitor),
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-[4px] transition-colors"
                        aria-label="Halaman berikutnya"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Detail Anak Modal */}
      {selectedChild && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedChild(null)}
        >
          <div
            className="bg-white dark:bg-[#161920] rounded-[24px] max-w-[480px] w-full p-6 shadow-2xl font-inter select-none animate-in zoom-in-95 border border-gray-100 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Detail Anak
            </h3>

            {/* Child Info Box */}
            <div className="border border-gray-200/70 dark:border-zinc-800 rounded-2xl p-4.5 mb-5 space-y-3 text-[13.5px] bg-white dark:bg-[#1e222d]/40">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Nama Lengkap:
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedChild.nama}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Umur:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedChild.usiaBulan} Bulan
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">BB/TB:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedChild.beratBadan} kg / {selectedChild.tinggiBadan} cm
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium ${
                    selectedChild.statusGizi === "Normal"
                      ? "bg-[#eaf5ec] text-[#0d472c] dark:bg-emerald-950/40 dark:text-emerald-300"
                      : selectedChild.statusGizi === "Gizi Kurang"
                        ? "bg-[#fef6dc] text-[#b45309] dark:bg-[#332b00] dark:text-[#fde047]"
                        : selectedChild.statusGizi === "Gizi Buruk"
                          ? "bg-[#fff0eb] text-[#c2410c] dark:bg-[#3a1d17] dark:text-[#FFA382]"
                          : "bg-[#fde8e8] text-[#a81a1a] dark:bg-[#3b1212] dark:text-[#f87171]"
                  }`}
                >
                  {selectedChild.statusGizi}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Z Score TB/U
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedChild.zScoreTBU.includes("SD")
                    ? selectedChild.zScoreTBU
                    : `${selectedChild.zScoreTBU} SD`}
                </span>
              </div>
            </div>

            {/* Subheader */}
            <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Matriks Penilaian Status Gizi WHO &amp; Risk Level
            </h4>

            {/* Fixed Purple AI Box */}
            <div className="p-4.5 rounded-2xl bg-[#faf5ff] dark:bg-[#1a1424] border border-[#f3e8ff] dark:border-[#382654] text-[13px] mb-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#7e22ce] dark:text-[#c084fc] text-[14px]">
                <Sparkles className="w-4 h-4 text-[#7e22ce] dark:text-[#c084fc] stroke-[2.2]" />
                <span>Rekomendasi analisis AI</span>
              </div>

              <p className="text-[#6b21a8] dark:text-[#d8b4fe] leading-relaxed whitespace-pre-line font-normal text-[12.5px] sm:text-[13px]">
                {selectedChild.rekomendasiAI}
              </p>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => setSelectedChild(null)}
              className="w-full py-3.5 bg-[#0d472c] hover:bg-[#0a3923] text-white rounded-xl text-[14.5px] font-medium cursor-pointer transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      )}

      {/* delete modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#161920] rounded-2xl max-w-[480px] w-full p-6 shadow-2xl font-inter"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[17px] font-bold mb-6">Hapus Data</h3>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-[#fce8e8] dark:bg-rose-950/40 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-[#d32f2f]" />
              </div>

              <h4 className="text-[15px] font-semibold mb-1">
                Apakah anda yakin ingin menghapus data ini?
              </h4>

              <p className="text-[13px] text-zinc-500">
                data yang sudah di hapus tidak akan bisa dipulihkan
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg text-[14px] font-medium cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 bg-[#c62828] hover:bg-[#b71c1c] text-white rounded-lg text-[14px] font-medium cursor-pointer"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
