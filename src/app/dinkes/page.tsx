"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import {
  Activity,
  Users,
  AlertTriangle,
  Building2,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function DinkesDashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/dinkes/dashboard");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Gagal refresh data Dinkes:", err);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dinkes/dashboard");
        const json = await res.json();
        if (active && res.ok && json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Gagal load data Dinkes:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();
    const timer = setInterval(fetchDashboard, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const stats = data?.statistikGizi || {
    totalBalita: 30,
    normal: 17,
    giziKurang: 4,
    giziBuruk: 2,
    stunting: 7,
    prevalensiStunting: 23.3,
  };

  const posyanduList = data?.posyanduBreakdown || [];
  const recentLogs = data?.recentAuditLogs || [];
  const logistik = data?.logistikPmt || {
    alokasiTotalPaket: 150,
    terdistribusi: 48,
    sisaStok: 102,
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen xl:h-screen xl:overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200">
      <Sidebar
        currentTab="dashboard"
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
                  Surveilans Wilayah
                </span>
                <span className="text-[12px] text-zinc-400 dark:text-zinc-500">
                  Kabupaten Bandung
                </span>
              </div>
              <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight mt-1">
                Dashboard Dinas Kesehatan
              </h1>
              <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
                Pengawasan sebaran status gizi wilayah &amp; audit trail terpusat RabbitMQ
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRefresh}
                className="h-[42px] px-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#161920] hover:bg-gray-50 text-zinc-700 dark:text-zinc-300 text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Perbarui Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                href="/dinkes/audit-log"
                className="h-[42px] px-4 rounded-xl bg-[#0d472c] hover:bg-[#0a3923] text-white font-medium text-[13.5px] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Activity className="w-4 h-4 stroke-[2]" />
                <span>Live Audit Broker</span>
              </Link>
            </div>
          </div>

          {/* 4 Metric Big Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
                  Total Sasaran Balita
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#0d472c] dark:text-emerald-300 flex items-center justify-center">
                  <Users className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
              <p className="text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {stats.totalBalita} <span className="text-[13px] font-normal text-zinc-400">anak</span>
              </p>
              <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-1">
                Dari 3 Posyandu wilayah Puskesmas Bojongsoang
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
                  Prevalensi Stunting
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
              <p className="text-[24px] sm:text-[28px] font-bold text-rose-600 dark:text-rose-400 mt-2">
                {stats.prevalensiStunting}%
              </p>
              <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-1">
                {stats.stunting} balita terindikasi stunting
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
                  Rujukan Ditindaklanjuti
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
              <p className="text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {data?.rujukanStatus?.ditindaklanjuti || 1}{" "}
                <span className="text-[13px] font-normal text-zinc-400">
                  / {data?.rujukanStatus?.total || 7} kasus
                </span>
              </p>
              <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-1">
                Respons penanganan dokter Puskesmas
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
                  Paket PMT Tersalurkan
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <PackageCheck className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
              <p className="text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {logistik.terdistribusi}{" "}
                <span className="text-[13px] font-normal text-zinc-400">
                  / {logistik.alokasiTotalPaket} dus
                </span>
              </p>
              <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-1">
                Sisa stok logistik wilayah: {logistik.sisaStok} paket
              </p>
            </div>
          </div>

          {/* 2-Column Section: Status Gizi & Live Audit Log Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (7 cols): Sebaran Status Gizi Wilayah */}
            <div className="lg:col-span-7 bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-inter text-[18px] font-bold text-zinc-900 dark:text-zinc-100">
                    Sebaran Status Gizi Kabupaten
                  </h2>
                  <span className="text-[12px] font-medium text-zinc-400">
                    Baku WHO Permenkes 2020
                  </span>
                </div>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Proporsi klinis dari total 30 balita terdaftar di wilayah kerja
                </p>
              </div>

              {/* Progress Bar Grid */}
              <div className="space-y-3 pt-2">
                {/* Normal */}
                <div>
                  <div className="flex justify-between text-[13px] font-medium mb-1">
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#368364]"></span>
                      Normal ({stats.normal} Balita)
                    </span>
                    <span className="text-zinc-500">
                      {((stats.normal / stats.totalBalita) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#368364] rounded-full transition-all duration-500"
                      style={{ width: `${(stats.normal / stats.totalBalita) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stunting */}
                <div>
                  <div className="flex justify-between text-[13px] font-medium mb-1">
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                      Stunting ({stats.stunting} Balita)
                    </span>
                    <span className="text-rose-600 font-semibold">
                      {((stats.stunting / stats.totalBalita) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ef4444] rounded-full transition-all duration-500"
                      style={{ width: `${(stats.stunting / stats.totalBalita) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Gizi Kurang */}
                <div>
                  <div className="flex justify-between text-[13px] font-medium mb-1">
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFEA00]"></span>
                      Gizi Kurang ({stats.giziKurang} Balita)
                    </span>
                    <span className="text-amber-600">
                      {((stats.giziKurang / stats.totalBalita) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFEA00] rounded-full transition-all duration-500"
                      style={{ width: `${(stats.giziKurang / stats.totalBalita) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Gizi Buruk */}
                <div>
                  <div className="flex justify-between text-[13px] font-medium mb-1">
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFA382]"></span>
                      Gizi Buruk ({stats.giziBuruk} Balita)
                    </span>
                    <span className="text-orange-600 font-semibold">
                      {((stats.giziBuruk / stats.totalBalita) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFA382] rounded-full transition-all duration-500"
                      style={{ width: `${(stats.giziBuruk / stats.totalBalita) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[12.5px] text-zinc-500">
                <span>Target Rencana Aksi Nasional Stunting: &lt; 14%</span>
                <span className="text-rose-600 font-medium">Perlu Intervensi Wilayah</span>
              </div>
            </div>

            {/* Right Column (5 cols): Live Stream Audit Log RabbitMQ */}
            <div className="lg:col-span-5 bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h2 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100">
                      Jejak Event RabbitMQ
                    </h2>
                  </div>
                  <Link
                    href="/dinkes/audit-log"
                    className="text-[12.5px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Antrean: <code className="text-[11px] bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">simgizi.audit.laporan</code>
                </p>
              </div>

              {/* List 4 event terbaru */}
              <div className="space-y-2.5 overflow-hidden">
                {recentLogs.slice(0, 4).map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-gray-50/80 dark:bg-[#1e222d] border border-gray-100 dark:border-zinc-800 text-[12.5px]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {log.eventType}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium line-clamp-1">
                      {log.ringkasan}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                      <span>Produser: {log.producer}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ✔ Ack Recorded
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 text-[12px] text-zinc-500 flex items-center justify-between">
                <span>Consumer 3 RabbitMQ</span>
                <span className="text-emerald-600 font-semibold">Aktif Berjalan</span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Sebaran Kasus Per Posyandu Binaan */}
          <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-inter text-[18px] font-bold text-zinc-900 dark:text-zinc-100">
                  Pemantauan Posyandu Binaan Puskesmas
                </h2>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  Status zona risiko dan rekapitulasi data per posyandu
                </p>
              </div>
              <Link
                href="/dinkes/faskes"
                className="text-[13px] text-emerald-700 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
              >
                <span>Lihat Detail Posyandu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {posyanduList.map((pos: any) => (
                <div
                  key={pos.id}
                  className="p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#1e222d] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">
                      {pos.nama}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        pos.statusZona === "Merah"
                          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                          : pos.statusZona === "Kuning"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                      }`}
                    >
                      Zona {pos.statusZona}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#161920] border border-gray-100 dark:border-zinc-800">
                      <p className="text-zinc-400 text-[11px]">Total Balita</p>
                      <p className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100">
                        {pos.totalBalita} anak
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#161920] border border-gray-100 dark:border-zinc-800">
                      <p className="text-zinc-400 text-[11px]">Kasus Stunting</p>
                      <p className="text-[16px] font-bold text-rose-600">
                        {pos.stuntingCount} kasus
                      </p>
                    </div>
                  </div>

                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    Prevalensi Stunting Posyandu:{" "}
                    <strong className="text-zinc-900 dark:text-zinc-200">
                      {pos.persentaseStunting}%
                    </strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
