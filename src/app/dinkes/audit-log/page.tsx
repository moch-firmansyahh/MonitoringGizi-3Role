"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import {
  Activity,
  Search,
  CheckCircle2,
  RefreshCw,
  Code2,
  X,
  Server,
  Layers,
  Clock,
  Eye,
  FileText,
  Copy,
  Check,
  Building2,
  User,
  ShieldCheck,
} from "lucide-react";

export default function DinkesAuditLogPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [brokerStatus, setBrokerStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"ringkasan" | "teknis">("ringkasan");
  const [isCopied, setIsCopied] = useState(false);

  const handleRefresh = async () => {
    try {
      const q = new URLSearchParams();
      if (filterType !== "all") q.append("eventType", filterType);
      if (searchQuery) q.append("search", searchQuery);

      const res = await fetch(`/api/dinkes/audit-log?${q.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setLogs(json.data.logs || []);
        setSummary(json.data.summary || null);
        setBrokerStatus(json.data.brokerStatus || null);
      }
    } catch (err) {
      console.error("Gagal refresh riwayat data:", err);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchLogs = async () => {
      try {
        const q = new URLSearchParams();
        if (filterType !== "all") q.append("eventType", filterType);
        if (searchQuery) q.append("search", searchQuery);

        const res = await fetch(`/api/dinkes/audit-log?${q.toString()}`);
        const json = await res.json();
        if (active && res.ok && json.success) {
          setLogs(json.data.logs || []);
          setSummary(json.data.summary || null);
          setBrokerStatus(json.data.brokerStatus || null);
        }
      } catch (err) {
        console.error("Gagal load riwayat data:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchLogs();
    const timer = setInterval(fetchLogs, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [filterType, searchQuery]);

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "pengukuran.created":
        return {
          label: "Penimbangan Balita",
          className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50",
        };
      case "rujukan.created":
        return {
          label: "Pengajuan Rujukan",
          className: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/50",
        };
      case "rujukan.updated":
        return {
          label: "Tindakan Puskesmas",
          className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50",
        };
      default:
        return {
          label: "Pembaruan Data",
          className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700",
        };
    }
  };

  const formatShortRef = (eventId: string) => {
    if (!eventId) return "-";
    const parts = eventId.split("_");
    if (parts.length >= 3) {
      return `#${parts[parts.length - 1].toUpperCase()}`;
    }
    return `#${eventId.slice(-6).toUpperCase()}`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen xl:h-screen xl:overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200">
      <Sidebar
        currentTab="audit-log"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 xl:h-screen xl:overflow-hidden">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1 xl:min-h-0 xl:overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaf5ec] dark:bg-emerald-950/40 text-[#0d472c] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Dinas Kesehatan Kab. Bandung
                </span>
                <span className="text-[12px] text-zinc-400">Jalur Pengawasan Terpadu</span>
              </div>
              <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight mt-1">
                Log Riwayat &amp; Sinkronisasi Data
              </h1>
              <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
                Rekam jejak digital pengiriman data penimbangan dan rujukan balita secara langsung (real-time)
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="h-[42px] px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#161920] hover:bg-gray-50 dark:hover:bg-[#1e222d] text-zinc-700 dark:text-zinc-300 text-[13.5px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
              <span>Perbarui Riwayat</span>
            </button>
          </div>

          {/* Status Integrasi 4 Cards */}
          <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[11.5px]">Status Integrasi</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {brokerStatus?.connected ? "Terhubung Otomatis" : "Mode Cadangan Lokal"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[11.5px]">Jalur Komunikasi Data</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    Terpadu Lintas Faskes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[11.5px]">Total Riwayat Tercatat</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {summary?.totalEvents || logs.length} Aktivitas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[11.5px]">Layanan Pengawasan</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    Siaga Menerima Data
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "Semua Aktivitas" },
                { id: "pengukuran.created", label: "Penimbangan Balita" },
                { id: "rujukan.created", label: "Pengajuan Rujukan" },
                { id: "rujukan.updated", label: "Tindakan Puskesmas" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    filterType === f.id
                      ? "bg-[#0d472c] text-white shadow-xs"
                      : "bg-white dark:bg-[#161920] border border-gray-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#1e222d]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-[280px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari balita, faskes, atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] pl-9 pr-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#161920] text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-[#1e222d]/60 text-zinc-500 dark:text-zinc-400 font-semibold h-[46px]">
                    <th className="px-4 py-2">Waktu</th>
                    <th className="px-4 py-2">Jenis Aktivitas</th>
                    <th className="px-4 py-2">No. Referensi</th>
                    <th className="px-4 py-2">Asal Pengirim</th>
                    <th className="px-4 py-2">Uraian Aktivitas</th>
                    <th className="px-4 py-2 text-center">Status Pengiriman</th>
                    <th className="px-4 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                        Tidak ada riwayat aktivitas data yang cocok dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const badge = getEventBadge(log.eventType);
                      const dateObj = new Date(log.timestamp);
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* Waktu */}
                          <td className="px-4 py-3 whitespace-nowrap text-zinc-500 text-[12px]">
                            <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                              {dateObj.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-zinc-400 text-[11px]">
                              {dateObj.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}{" "}
                              WIB
                            </p>
                          </td>

                          {/* Jenis Aktivitas */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold inline-block ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* No. Referensi */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className="font-mono text-[11.5px] font-medium text-zinc-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded border border-gray-200/60 dark:border-zinc-700/60"
                              title={log.eventId}
                            >
                              {formatShortRef(log.eventId)}
                            </span>
                          </td>

                          {/* Asal Pengirim */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-medium text-zinc-800 dark:text-zinc-200 capitalize">
                              {log.producer === "posyandu"
                                ? "Kader Posyandu"
                                : log.producer === "puskesmas"
                                ? "Dokter Puskesmas"
                                : log.producer}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {log.faskes || (log.producer === "posyandu" ? "Posyandu Binaan" : "Puskesmas Bojongsoang")}
                            </p>
                          </td>

                          {/* Uraian Aktivitas */}
                          <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200 max-w-[340px]">
                            <p className="line-clamp-1 font-medium">{log.ringkasan}</p>
                            {log.namaAnak && (
                              <p className="text-[11.5px] text-zinc-400 mt-0.5">
                                Balita:{" "}
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                  {log.namaAnak}
                                </span>
                              </p>
                            )}
                          </td>

                          {/* Status Pengiriman */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>Tersinkronisasi</span>
                            </span>
                          </td>

                          {/* Aksi / Detail */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLog(log);
                                setActiveModalTab("ringkasan");
                              }}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-[#eef3ed] dark:hover:bg-[#1b2720] hover:text-[#0d472c] dark:hover:text-emerald-300 text-[12px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 ml-auto cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Detail</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Human-Friendly Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[620px] bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getEventBadge(selectedLog.eventType).className}`}
                  >
                    {getEventBadge(selectedLog.eventType).label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 stroke-[2.2]" />
                    Tersinkronisasi Real-Time
                  </span>
                </div>
                <h3 className="font-bold text-[18px] text-zinc-900 dark:text-zinc-100 mt-1">
                  Rincian Informasi Aktivitas
                </h3>
                <p className="text-[12px] text-zinc-400 font-mono mt-0.5">
                  ID Referensi: {selectedLog.eventId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Tab Nav (Ringkasan vs Format Teknis) */}
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalTab("ringkasan")}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeModalTab === "ringkasan"
                    ? "bg-[#0d472c] text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ringkasan Informasi</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("teknis")}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeModalTab === "teknis"
                    ? "bg-[#0d472c] text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Format Teknis (JSON)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {activeModalTab === "ringkasan" ? (
                <div className="space-y-4 text-[13px]">
                  {/* Uraian Box */}
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1e222d] border border-gray-100 dark:border-zinc-800">
                    <p className="text-[11.5px] font-medium text-zinc-400 mb-1">
                      Uraian Catatan Aktivitas
                    </p>
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                      {selectedLog.ringkasan}
                    </p>
                  </div>

                  {/* 2-Col Grid Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-1">
                      <p className="text-[11px] text-zinc-400">Waktu Tercatat</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {new Date(selectedLog.timestamp).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[12px] text-zinc-500">
                        Pukul{" "}
                        {new Date(selectedLog.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}{" "}
                        WIB
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-1">
                      <p className="text-[11px] text-zinc-400">Instansi / Asal Pengirim</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                        {selectedLog.producer === "posyandu"
                          ? "Kader Posyandu"
                          : selectedLog.producer === "puskesmas"
                          ? "Dokter Puskesmas"
                          : selectedLog.producer}
                      </p>
                      <p className="text-[12px] text-zinc-500">
                        {selectedLog.faskes || (selectedLog.producer === "posyandu" ? "Posyandu Binaan" : "Puskesmas Bojongsoang")}
                      </p>
                    </div>
                  </div>

                  {/* Informasi Balita & Detail Pengukuran / Rujukan */}
                  {selectedLog.namaAnak && (
                    <div className="p-3.5 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-2">
                      <p className="text-[11.5px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Data Pasien &amp; Pengukuran Terkait
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                        <div>
                          <p className="text-[11px] text-zinc-400">Nama Balita</p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">
                            {selectedLog.namaAnak}
                          </p>
                        </div>

                        {selectedLog.data?.beratKg && (
                          <div>
                            <p className="text-[11px] text-zinc-400">Berat Badan</p>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {selectedLog.data.beratKg} kg
                            </p>
                          </div>
                        )}

                        {selectedLog.data?.tinggiCm && (
                          <div>
                            <p className="text-[11px] text-zinc-400">Tinggi / Panjang</p>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {selectedLog.data.tinggiCm} cm
                            </p>
                          </div>
                        )}

                        {selectedLog.data?.zTbu !== undefined && (
                          <div>
                            <p className="text-[11px] text-zinc-400">Nilai Z-Score TB/U</p>
                            <p className="font-semibold text-rose-600 dark:text-rose-400">
                              {selectedLog.data.zTbu} SD
                            </p>
                          </div>
                        )}

                        {selectedLog.status && (
                          <div>
                            <p className="text-[11px] text-zinc-400">Status Tindak Lanjut</p>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                              {selectedLog.status}
                            </p>
                          </div>
                        )}

                        {selectedLog.data?.namaDokter && (
                          <div>
                            <p className="text-[11px] text-zinc-400">Dokter Pemeriksa</p>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {selectedLog.data.namaDokter}
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedLog.data?.diagnosis && (
                        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                          <p className="text-[11px] text-zinc-400">Diagnosis Dokter:</p>
                          <p className="font-medium text-zinc-700 dark:text-zinc-300">
                            {selectedLog.data.diagnosis}
                          </p>
                        </div>
                      )}

                      {(selectedLog.data?.tindakan || selectedLog.data?.resepPmt) && (
                        <div className="pt-1.5">
                          <p className="text-[11px] text-zinc-400">Tindakan / Resep Bantuan PMT:</p>
                          <p className="font-medium text-zinc-700 dark:text-zinc-300">
                            {selectedLog.data.tindakan || selectedLog.data.resepPmt}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11.5px] text-zinc-400">
                    <span>Format data mentah untuk kebutuhan teknis &amp; pengembang:</span>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Data JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-zinc-950 text-emerald-400 rounded-xl p-4 font-mono text-[11.5px] overflow-x-auto max-h-[360px] leading-relaxed border border-zinc-800">
                    <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-medium text-[13px] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
