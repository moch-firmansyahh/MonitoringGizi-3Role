"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, AlertOctagon, Filter, Eye } from "lucide-react";
import { formatZScore, STATUS_GIZI_MAP } from "@/lib/constants/nutrition";

export default function BalitaBerisikoPage() {
  const [list, setList] = useState<any[]>([]);
  const [filterPosyandu, setFilterPosyandu] = useState("semua");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/anak");
        const json = await res.json();
        const resPengukuran = await fetch("/api/pengukuran");
        const jsonPengukuran = await resPengukuran.json();

        if (res.ok && resPengukuran.ok) {
          const anakList = json.data || [];
          const pengukuranList = jsonPengukuran.data || [];

          const latestMap = new Map();
          for (const p of pengukuranList) {
            if (!latestMap.has(p.idAnak)) {
              latestMap.set(p.idAnak, p);
            }
          }

          const berisiko: any[] = [];
          for (const a of anakList) {
            const p = latestMap.get(a.id);
            if (!p) continue;

            if (
              p.statusGizi === "gizi_buruk" ||
              p.statusGizi === "stunting" ||
              p.statusGizi === "gizi_kurang"
            ) {
              let rank = 3;
              if (p.statusGizi === "gizi_buruk") rank = 1;
              else if (p.statusGizi === "stunting") rank = 2;

              berisiko.push({
                anak: a,
                pengukuran: p,
                rank,
              });
            }
          }

          berisiko.sort((a, b) => a.rank - b.rank);
          setList(berisiko);
        }
      } catch (err) {
        console.error("Gagal load balita berisiko:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered =
    filterPosyandu === "semua"
      ? list
      : list.filter((item) => item.anak.idPosyandu === filterPosyandu);

  return (
    <div className="flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            Triage Balita Berisiko
          </h1>
          <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
            Daftar balita dengan status Gizi Buruk, Stunting, dan Gizi Kurang berdasar prioritas klinis
          </p>
        </div>

        {/* Filter Posyandu Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={filterPosyandu}
            onChange={(e) => setFilterPosyandu(e.target.value)}
            className="h-[42px] px-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option value="semua">Semua Posyandu</option>
            <option value="a0000000-0000-0000-0000-000000000001">Posyandu Melati 03</option>
            <option value="a0000000-0000-0000-0000-000000000002">Posyandu Mekar Sari 01</option>
            <option value="a0000000-0000-0000-0000-000000000003">Posyandu Mawar 02</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-[13px] font-bold text-zinc-500 dark:text-zinc-400 h-[48px]">
                <th className="py-2.5 px-3">Prioritas</th>
                <th className="py-2.5 px-3">Nama Balita</th>
                <th className="py-2.5 px-3">NIK</th>
                <th className="py-2.5 px-3">Usia</th>
                <th className="py-2.5 px-3">Status Gizi</th>
                <th className="py-2.5 px-3">Z-Score TB/U</th>
                <th className="py-2.5 px-3">Z-Score BB/TB</th>
                <th className="py-2.5 px-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    Memuat data balita berisiko...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    Tidak ada balita berisiko pada filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const a = item.anak;
                  const p = item.pengukuran;
                  return (
                    <tr key={a.id} className="h-[54px] hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            item.rank === 1
                              ? "bg-[#fff0eb] dark:bg-[#3a1d17] text-[#c2410c] dark:text-[#FFA382] border-orange-200/60 dark:border-orange-950/40"
                              : item.rank === 2
                              ? "bg-[#fde8e8] dark:bg-[#3b1212] text-[#a81a1a] dark:text-[#f87171] border-rose-200/60 dark:border-rose-950/40"
                              : "bg-[#fef6dc] dark:bg-[#332b00] text-[#b45309] dark:text-[#fde047] border-amber-200/60 dark:border-amber-900/40"
                          }`}
                        >
                          {item.rank === 1 && <AlertOctagon className="w-3 h-3" />}
                          {item.rank === 2 && <AlertTriangle className="w-3 h-3" />}
                          Prioritas {item.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                        {a.nama}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-500 text-[12.5px]">
                        {a.nik}
                      </td>
                      <td className="py-2.5 px-3">{p.usiaBulan} bln</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold ${
                            STATUS_GIZI_MAP[p.statusGizi as keyof typeof STATUS_GIZI_MAP]
                              ?.badgeFullClass
                          }`}
                        >
                          {STATUS_GIZI_MAP[p.statusGizi as keyof typeof STATUS_GIZI_MAP]?.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{formatZScore(p.zTbu)}</td>
                      <td className="py-2.5 px-3 font-mono">{formatZScore(p.zBbtb)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/anak/${a.id}`}
                          className="px-3 py-1.5 rounded-lg bg-[#0d472c] hover:bg-[#0a3923] text-white text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
