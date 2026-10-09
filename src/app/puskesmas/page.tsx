"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Building2,
  Send,
  ArrowRight,
} from "lucide-react";
import { STATUS_GIZI_MAP } from "@/lib/constants/nutrition";

export default function PuskesmasDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch("/api/puskesmas/dashboard");
        const json = await res.json();
        if (res.ok && json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Gagal load dashboard puskesmas:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSummary();
  }, []);

  return (
    <div className="flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            Dashboard Wilayah Faskes
          </h1>
          <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
            Monitoring epidemiologi gizi balita & rujukan terpadu Puskesmas Bojongsoang
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/puskesmas/balita-berisiko"
            className="px-4 h-[42px] bg-white dark:bg-[#161920] border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl font-inter text-[13.5px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 stroke-[1.8] text-[#a81a1a] dark:text-[#f87171]" />
            <span>Triage Balita Berisiko</span>
          </Link>
          <Link
            href="/puskesmas/rujukan"
            className="px-4 h-[42px] bg-[#0d472c] hover:bg-[#0a3923] text-white rounded-xl font-inter text-[13.5px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2]" />
            <span>Inbox Rujukan ({data?.rujukanAktif ?? 0})</span>
          </Link>
        </div>
      </div>

      {/* Kartu Metrik Wilayah */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        {/* Metrik Total Balita */}
        <div className="bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
              Total Balita Wilayah
            </span>
            <Users className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
          </div>
          <div className="text-[26px] font-bold text-zinc-900 dark:text-zinc-100 mt-2 font-inter">
            {isLoading ? "..." : data?.totalBalita ?? 5}
          </div>
          <span className="text-[11.5px] text-zinc-400">3 Posyandu Binaan</span>
        </div>

        {/* Metrik Normal */}
        <div className="bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
              Gizi Normal
            </span>
            <CheckCircle className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
          </div>
          <div className="text-[26px] font-bold text-[#0d472c] dark:text-emerald-400 mt-2 font-inter">
            {isLoading ? "..." : data?.normal ?? 1}
          </div>
          <span className="text-[11.5px] text-zinc-400">Pertumbuhan optimal</span>
        </div>

        {/* Metrik Stunting */}
        <div className="bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
              Kasus Stunting
            </span>
            <AlertTriangle className="w-4 h-4 text-[#a81a1a] dark:text-[#f87171]" />
          </div>
          <div className="text-[26px] font-bold text-[#a81a1a] dark:text-[#f87171] mt-2 font-inter">
            {isLoading ? "..." : data?.stunting ?? 3}
          </div>
          <span className="text-[11.5px] text-zinc-400">Prioritas intervensi</span>
        </div>

        {/* Metrik Gizi Buruk */}
        <div className="bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
              Gizi Buruk / Kurang
            </span>
            <AlertOctagon className="w-4 h-4 text-[#b45309] dark:text-[#fde047]" />
          </div>
          <div className="text-[26px] font-bold text-[#b45309] dark:text-[#fde047] mt-2 font-inter">
            {isLoading ? "..." : (data?.giziBuruk ?? 1) + (data?.giziKurang ?? 0)}
          </div>
          <span className="text-[11.5px] text-zinc-400">Pengawasan PMT</span>
        </div>
      </div>

      {/* Tabel Pemantauan Posyandu Binaan */}
      <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-inter text-[18px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0d472c] dark:text-emerald-400" />
            <span>Kinerja & Prevalensi Stunting Posyandu Binaan</span>
          </h2>
          <Link
            href="/puskesmas/posyandu"
            className="text-[13px] font-semibold text-[#0d472c] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Kelola Posyandu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-[13px] font-bold text-zinc-500 dark:text-zinc-400 h-[48px]">
                <th className="py-2.5 px-4">Nama Posyandu</th>
                <th className="py-2.5 px-4">Alamat Wilayah</th>
                <th className="py-2.5 px-4 text-center">Total Balita</th>
                <th className="py-2.5 px-4 text-center">Balita Stunting</th>
                <th className="py-2.5 px-4 text-center">Prevalensi</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {(data?.posyanduStats || [
                {
                  id: "1",
                  nama: "Posyandu Melati 03",
                  alamat: "Balai Warga RW 03, Bojongsoang",
                  totalBalita: 5,
                  stuntingCount: 3,
                  persentaseStunting: 60,
                },
                {
                  id: "2",
                  nama: "Posyandu Mekar Sari 01",
                  alamat: "Balai Warga RW 01, Lengkong",
                  totalBalita: 0,
                  stuntingCount: 0,
                  persentaseStunting: 0,
                },
                {
                  id: "3",
                  nama: "Posyandu Mawar 02",
                  alamat: "Balai Warga RW 02, Buahbatu",
                  totalBalita: 0,
                  stuntingCount: 0,
                  persentaseStunting: 0,
                },
              ]).map((pos: any) => (
                <tr key={pos.id} className="h-[54px] hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {pos.nama}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500 dark:text-zinc-400">
                    {pos.alamat}
                  </td>
                  <td className="py-2.5 px-4 text-center font-medium">
                    {pos.totalBalita} anak
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-[#a81a1a] dark:text-[#f87171]">
                    {pos.stuntingCount}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold border ${
                        pos.persentaseStunting > 20
                          ? "bg-[#fde8e8] dark:bg-[#3b1212] text-[#a81a1a] dark:text-[#f87171] border-rose-200/60 dark:border-rose-950/40"
                          : "bg-[#eaf5ec] dark:bg-emerald-950/40 text-[#0d472c] dark:text-[#6ee7b7] border-emerald-200/60 dark:border-emerald-800/40"
                      }`}
                    >
                      {pos.persentaseStunting}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <Link
                      href={`/puskesmas/balita-berisiko?posyanduId=${pos.id}`}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300 inline-block"
                    >
                      Filter Balita
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
