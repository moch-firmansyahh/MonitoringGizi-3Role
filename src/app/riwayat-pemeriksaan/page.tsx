"use client";

import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnakRecord } from "@/lib/data-anak";
import { useDataAnak } from "@/lib/data-anak-store";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  SkeletonTableBody,
  SkeletonTableFooter,
} from "@/components/_shared/skeletons";
import CustomDatePicker from "@/components/forms/CustomDatePicker";

export default function RiwayatPemeriksaanPage() {
  const hasMounted = useHasMounted();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const historyList = useDataAnak();

  /**
   * Filter dan sorting data (Berdasarkan Tanggal Periksa).
   */
  const filteredData = useMemo(() => {
    return historyList
      .filter((item) => {
        if (!dateFilter) return true;
        return item.tanggalPeriksa === dateFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.tanggalPeriksa).getTime() -
          new Date(a.tanggalPeriksa).getTime(),
      );
  }, [historyList, dateFilter]);

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

  /**
   * Badge status gizi.
   */
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

  /* Row render helper with explicit height matching Rekap Data Gizi */
  const renderRow = (item: AnakRecord) => (
    <tr
      key={item.id}
      className="h-[54px] hover:bg-gray-50/80 dark:hover:bg-zinc-800/40"
    >
      {/* ANAK */}
      <td className="py-3 px-4">
        <div className="font-bold leading-tight">{item.nama}</div>
        <div className="text-[11.5px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          {item.nik}
        </div>
      </td>

      {/* USIA / JK */}
      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
        {item.usiaBulan} Bulan ({item.jenisKelamin})
      </td>

      {/* BB / TB */}
      <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
        {item.beratBadan} kg / {item.tinggiBadan} cm
      </td>

      {/* STATUS GIZI */}
      <td className="py-3 px-4">
        <span
          className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium inline-block ${getBadgeStyle(
            item.statusGizi,
          )}`}
        >
          {item.statusGizi}
        </span>
      </td>

      {/* Z SCORE */}
      <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
        {item.zScoreTBU}
      </td>

      {/* TANGGAL */}
      <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300 text-center whitespace-nowrap">
        {item.tanggalPeriksa}
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen xl:h-screen xl:overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter select-none">
      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <Sidebar
        currentTab="riwayat-pemeriksaan"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 xl:h-screen xl:overflow-hidden">
        {/* TOPBAR */}
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* =======================================================
            PAGE
        ======================================================= */}
        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1 xl:min-h-0 xl:overflow-hidden">
          {/* PAGE TITLE */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between min-h-[42px] gap-3">
            <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight">
              Riwayat Pemeriksaan
            </h1>
          </div>

          {/* =====================================================
              MAIN CARD
          ===================================================== */}
          <section className="bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-[24px] p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5">
            {/* CARD HEADER */}
            <div>
              <h2 className="text-[18px] sm:text-[19px] font-semibold leading-tight">
                Riwayat Sesi Pemeriksaan Posyandu
              </h2>

              <p className="text-[13px] sm:text-[13.5px] text-zinc-400 dark:text-zinc-500 mt-1">
                Log historis penimbangan dan pengukuran fisik anak Posyandu
              </p>
            </div>

            {/* ===================================================
                FILTER (DATE PICKER PILL)
            =================================================== */}
            <div className="h-[42px] flex items-center justify-between gap-3">
              <div>
                <CustomDatePicker
                  value={dateFilter}
                  onChange={(dateStr) => {
                    setDateFilter(dateStr);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari berdasarkan tanggal"
                />
              </div>
            </div>

            {/* ===================================================
                TABLE CONTAINER
            =================================================== */}
            <div className="w-full border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-white dark:bg-[#161920]">
              <div className="w-full overflow-x-auto overflow-y-hidden">
                <table className="w-full min-w-[900px] text-left text-[13.5px] border-collapse">
                  {/* =================================================
                      TABLE HEADER
                  ================================================= */}
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

                      <th className="py-3 px-4 w-[22%] text-center whitespace-nowrap">
                        Tanggal Periksa
                      </th>
                    </tr>
                  </thead>

                  {/* ========================================================
                      TBODY WITH SKELETON LOADING GUARD
                      ======================================================== */}
                  {!hasMounted ? (
                    <SkeletonTableBody isRiwayat />
                  ) : (
                    <>
                      {/* TBODY LAPTOP (< 850px height) — Murni 3 data per halaman */}
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 hidden [@media(max-height:849px)]:table-row-group animate-fade-in">
                        {currentItemsLaptop.length > 0 ? (
                          currentItemsLaptop.map(renderRow)
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-12 text-center text-zinc-400 font-medium text-[13px]"
                            >
                              Tidak ada riwayat pemeriksaan yang ditemukan.
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
                              colSpan={6}
                              className="py-12 text-center text-zinc-400 font-medium text-[13px]"
                            >
                              Tidak ada riwayat pemeriksaan yang ditemukan.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </>
                  )}
                </table>
              </div>

              {/* =================================================
                  PAGINATION FOOTER WITH SKELETON GUARD
                  ================================================= */}
              {!hasMounted ? (
                <SkeletonTableFooter />
              ) : (
                <>
                  {/* PAGINATION FOOTER (LAPTOP: < 850px) */}
                  <div className="h-[58px] shrink-0 px-3.5 bg-[#f8f9fa] dark:bg-[#1e222d] border-t border-gray-200/80 dark:border-zinc-800 hidden [@media(max-height:849px)]:flex items-center justify-between gap-3 text-[13px] font-medium text-zinc-500">
                    {/* SUMMARY */}
                    <div>
                      Halaman {validPageLaptop} dari {totalPagesLaptop} (
                      {filteredData.length} riwayat)
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
                    {/* SUMMARY */}
                    <div>
                      Halaman {validPageMonitor} dari {totalPagesMonitor} (
                      {filteredData.length} riwayat)
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
    </div>
  );
}
