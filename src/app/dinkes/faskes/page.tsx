"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import { Building2, Users, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DinkesFaskesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dinkes/dashboard")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setData(j.data);
      })
      .catch(console.error);
  }, []);

  const posyanduList = data?.posyanduBreakdown || [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen xl:h-screen xl:overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200">
      <Sidebar
        currentTab="faskes"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 xl:h-screen xl:overflow-hidden">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1 xl:min-h-0 xl:overflow-y-auto">
          {/* Header */}
          <div>
            <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              Pemantauan Faskes &amp; Posyandu
            </h1>
            <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
              Evaluasi prevalensi stunting dan status gizi anak di seluruh posyandu wilayah kerja
            </p>
          </div>

          {/* Grid Posyandu Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {posyanduList.map((pos: any) => (
              <div
                key={pos.id}
                className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 flex items-center justify-center text-[#0d472c] dark:text-emerald-300">
                      <Building2 className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold border ${
                        pos.statusZona === "Merah"
                          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
                          : pos.statusZona === "Kuning"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      Zona {pos.statusZona} ({pos.persentaseStunting}% Stunting)
                    </span>
                  </div>

                  <h2 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100 mt-3">
                    {pos.nama}
                  </h2>
                  <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Kelurahan {pos.kelurahan} • Puskesmas Bojongsoang
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Total Balita:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {pos.totalBalita} anak
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Normal:</span>
                      <span className="text-emerald-600 font-medium">
                        {pos.normalCount} anak
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Gizi Kurang:</span>
                      <span className="text-amber-600 font-medium">
                        {pos.giziKurangCount} anak
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Gizi Buruk:</span>
                      <span className="text-orange-600 font-medium">
                        {pos.giziBurukCount} anak
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Stunting:</span>
                      <span className="text-rose-600 font-bold">
                        {pos.stuntingCount} kasus
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[12px] text-zinc-400">
                  <span>Alokasi Bantuan: Prioritas Tinggi</span>
                  <span className="text-emerald-600 font-medium">Terkoneksi</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
