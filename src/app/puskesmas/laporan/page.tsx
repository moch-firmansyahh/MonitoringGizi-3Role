"use client";

import React, { useState } from "react";
import { Download, FileText, Filter, CheckCircle2 } from "lucide-react";
import { showToast } from "@/lib/custom-toast";

export default function PuskesmasLaporanPage() {
  const [filterPosyandu, setFilterPosyandu] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filterPosyandu) params.set("posyanduId", filterPosyandu);
      if (filterStatus) params.set("filter", filterStatus);

      const res = await fetch(`/api/export-pdf?${params.toString()}`);
      if (!res.ok) {
        showToast.error("Gagal menghasilkan dokumen laporan PDF");
        setIsExporting(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-gizi-wilayah-puskesmas-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast.success("Laporan PDF wilayah berhasil diunduh!");
    } catch {
      showToast.error("Terjadi kesalahan saat mengunduh laporan");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1">
      {/* Header Bar */}
      <div>
        <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Laporan Rekap Wilayah Puskesmas
        </h1>
        <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
          Ekspor dokumen resmi rekapitulasi data pemantauan gizi dan stunting per posyandu binaan
        </p>
      </div>

      {/* Filter & Export Card */}
      <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5 max-w-[700px]">
        <h2 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0d472c] dark:text-emerald-400" />
          <span>Pengaturan Ekspor Dokumen Resmi</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="filterPosyanduWilayah"
              className="block font-inter text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Pilih Cakupan Posyandu:
            </label>
            <select
              id="filterPosyanduWilayah"
              value={filterPosyandu}
              onChange={(e) => setFilterPosyandu(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1e222d] text-zinc-900 dark:text-zinc-100 text-[13.5px] focus:outline-none focus:border-[#0d472c] cursor-pointer"
            >
              <option value="">Seluruh Posyandu (Puskesmas Bojongsoang)</option>
              <option value="a0000000-0000-0000-0000-000000000001">Posyandu Melati 03</option>
              <option value="a0000000-0000-0000-0000-000000000002">Posyandu Mekar Sari 01</option>
              <option value="a0000000-0000-0000-0000-000000000003">Posyandu Mawar 02</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filterStatusGiziWilayah"
              className="block font-inter text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Kategori Status Gizi:
            </label>
            <select
              id="filterStatusGiziWilayah"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1e222d] text-zinc-900 dark:text-zinc-100 text-[13.5px] focus:outline-none focus:border-[#0d472c] cursor-pointer"
            >
              <option value="">Semua Kategori (Lengkap)</option>
              <option value="Stunting">Hanya Kasus Stunting</option>
              <option value="Gizi Buruk">Hanya Kasus Gizi Buruk</option>
              <option value="Gizi Kurang">Hanya Kasus Gizi Kurang</option>
              <option value="Normal">Hanya Kasus Normal</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 text-[12.5px] text-zinc-700 dark:text-zinc-300 space-y-1">
            <span className="font-semibold text-[#0d472c] dark:text-emerald-300 block">
              Format Dokumen: PDF Resmi Dinas Kesehatan
            </span>
            <p>
              Dokumen menyertakan kop dinas, tabel antropometri terurut prioritas medis, dan lembar tanda tangan Kepala Puskesmas.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="w-full h-[46px] rounded-xl bg-[#0d472c] hover:bg-[#0a3923] text-white font-inter text-[14px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>{isExporting ? "Membuat Dokumen PDF..." : "Unduh Laporan PDF Wilayah"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
