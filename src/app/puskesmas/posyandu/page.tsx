"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Users, AlertTriangle, ArrowRight } from "lucide-react";

export default function PosyanduBinaanPage() {
  const [posyanduList, setPosyanduList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/puskesmas/dashboard");
        const json = await res.json();
        if (res.ok && json.success) {
          setPosyanduList(json.data.posyanduStats || []);
        }
      } catch (err) {
        console.error("Gagal load posyandu binaan:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1">
      {/* Header */}
      <div>
        <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Posyandu Binaan Puskesmas
        </h1>
        <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
          Daftar seluruh posyandu di wilayah kerja Puskesmas Bojongsoang
        </p>
      </div>

      {/* Grid Posyandu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posyanduList.map((pos) => (
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
                    pos.persentaseStunting > 20
                      ? "bg-[#fde8e8] dark:bg-[#3b1212] text-[#a81a1a] dark:text-[#f87171] border-rose-200/60 dark:border-rose-950/40"
                      : "bg-[#eaf5ec] dark:bg-emerald-950/40 text-[#0d472c] dark:text-[#6ee7b7] border-emerald-200/60 dark:border-emerald-800/40"
                  }`}
                >
                  {pos.persentaseStunting}% Stunting
                </span>
              </div>

              <h2 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100 mt-3">
                {pos.nama}
              </h2>
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-1">
                {pos.alamat}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Total Balita:
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {pos.totalBalita} anak
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#a81a1a] dark:text-[#f87171]" /> Kasus Stunting:
                  </span>
                  <span className="font-bold text-[#a81a1a] dark:text-[#f87171]">
                    {pos.stuntingCount} anak
                  </span>
                </div>
                <div className="flex justify-between text-[11.5px] text-zinc-400 pt-1">
                  <span>Data Masuk Terakhir:</span>
                  <span>{pos.terakhirUpdate}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/puskesmas/balita-berisiko?posyanduId=${pos.id}`}
              className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-[13px] font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Lihat Rekap Balita</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
