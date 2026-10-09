"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Anak, Pengukuran } from "@/types";
import { formatZScore, STATUS_GIZI_MAP } from "@/lib/constants/nutrition";

export default function OrangTuaBerandaPage() {
  const [anakList, setAnakList] = useState<Anak[]>([]);
  const [selectedAnak, setSelectedAnak] = useState<Anak | null>(null);
  const [latestPengukuran, setLatestPengukuran] = useState<Pengukuran | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/anak");
        const json = await res.json();
        if (!ignore && res.ok && json.success && json.data.length > 0) {
          setAnakList(json.data);
          const defaultAnak = json.data[0];
          setSelectedAnak(defaultAnak);

          const resP = await fetch(`/api/pengukuran?idAnak=${defaultAnak.id}`);
          const jsonP = await resP.json();
          if (!ignore && resP.ok && jsonP.success && jsonP.data.length > 0) {
            setLatestPengukuran(jsonP.data[0]);
          }
        }
      } catch (err) {
        console.error("Gagal load data orang tua:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSelectAnak = async (anak: Anak) => {
    setSelectedAnak(anak);
    try {
      const resP = await fetch(`/api/pengukuran?idAnak=${anak.id}`);
      const jsonP = await resP.json();
      if (resP.ok && jsonP.success && jsonP.data.length > 0) {
        setLatestPengukuran(jsonP.data[0]);
      } else {
        setLatestPengukuran(null);
      }
    } catch {
      setLatestPengukuran(null);
    }
  };

  const statusMeta = latestPengukuran
    ? STATUS_GIZI_MAP[latestPengukuran.statusGizi]
    : null;

  const isStunting = latestPengukuran?.statusGizi === "stunting";

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Header Salam Orang Tua */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h1 className="font-inter text-[22px] sm:text-[26px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Halo, Ayah/Bunda! 👋
          </h1>
          <p className="font-inter text-[13px] text-zinc-500 dark:text-zinc-400">
            Pantau tumbuh kembang dan nutrisi buah hati bersama SimGizi
          </p>
        </div>

        <Link
          href="/orang-tua/klaim"
          className="px-3.5 py-2 rounded-xl bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 text-[#0d472c] dark:text-emerald-300 text-[12.5px] font-medium flex items-center gap-1.5 hover:bg-[#dce9dd] dark:hover:bg-[#25362c] transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Tautkan Anak Lain</span>
        </Link>
      </div>

      {/* Switcher Tab Balita jika lebih dari 1 */}
      {anakList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {anakList.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => handleSelectAnak(a)}
              className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedAnak?.id === a.id
                  ? "bg-[#0d472c] text-white shadow-xs"
                  : "bg-white dark:bg-[#161920] border border-gray-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {a.nama}
            </button>
          ))}
        </div>
      )}

      {/* Card Ringkasan Kondisi Balita */}
      <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 text-[#0d472c] dark:text-emerald-300 flex items-center justify-center font-bold text-[18px]">
              {selectedAnak?.nama?.charAt(0) || "A"}
            </div>
            <div>
              <h2 className="font-inter text-[18px] font-bold text-zinc-900 dark:text-zinc-100">
                {selectedAnak?.nama || "Muhammad Arfan"}
              </h2>
              <span className="text-[12.5px] text-zinc-400 font-mono">
                NIK: {selectedAnak?.nik || "3201••••••••0001"}
              </span>
            </div>
          </div>

          {statusMeta && (
            <span
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold ${statusMeta.badgeFullClass}`}
            >
              {statusMeta.label}
            </span>
          )}
        </div>

        {/* 3 Metric Mini Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#1e222d] border border-gray-100 dark:border-zinc-800 text-center">
            <span className="text-[11.5px] text-zinc-400 block">Berat Badan</span>
            <span className="text-[17px] font-bold text-zinc-900 dark:text-zinc-100 font-inter">
              {latestPengukuran?.beratKg ?? 10.1} kg
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#1e222d] border border-gray-100 dark:border-zinc-800 text-center">
            <span className="text-[11.5px] text-zinc-400 block">Tinggi Badan</span>
            <span className="text-[17px] font-bold text-zinc-900 dark:text-zinc-100 font-inter">
              {latestPengukuran?.tinggiCm ?? 78.5} cm
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#1e222d] border border-gray-100 dark:border-zinc-800 text-center">
            <span className="text-[11.5px] text-zinc-400 block">Usia Saat Ini</span>
            <span className="text-[17px] font-bold text-zinc-900 dark:text-zinc-100 font-inter">
              {latestPengukuran?.usiaBulan ?? 28} Bln
            </span>
          </div>
        </div>

        {/* Kotak Edukasi Bahasa Ramah Orang Tua */}
        <div className="p-4 rounded-2xl bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 space-y-1.5">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#0d472c] dark:text-emerald-400 shrink-0" />
            <h3 className="font-inter text-[13.5px] font-bold text-[#0d472c] dark:text-emerald-300">
              Anjuran Gizi untuk Ayah & Bunda:
            </h3>
          </div>
          <p className="font-inter text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            {latestPengukuran?.rekomendasiAwam ||
              "Tinggi badan ananda saat ini memerlukan perhatian khusus. Konsultasikan ke Puskesmas dan berikan asupan protein hewani (telur, ikan, daging) setiap hari."}
          </p>
        </div>

        {/* Alert Khusus jika Stunting */}
        {isStunting && (
          <div className="p-3.5 rounded-2xl bg-[#fde8e8] dark:bg-[#3b1212] border border-rose-200/60 dark:border-rose-950/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[#a81a1a] dark:text-[#f87171] shrink-0" />
              <div>
                <h4 className="text-[13px] font-bold text-[#a81a1a] dark:text-[#f87171]">
                  Rujukan Faskes Diperlukan
                </h4>
                <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400">
                  Kader Posyandu telah mengajukan rujukan ke Puskesmas Bojongsoang.
                </p>
              </div>
            </div>
            <Link
              href="/orang-tua/notifikasi"
              className="text-[12px] font-bold text-[#a81a1a] dark:text-[#f87171] underline shrink-0"
            >
              Cek Status &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Quick Nav Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Link
          href="/orang-tua/perkembangan"
          className="p-4 rounded-[20px] bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] flex items-center justify-between hover:border-[#0d472c] transition-all shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eef3ed] dark:bg-[#1b2720] text-[#0d472c] dark:text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-inter text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                Grafik Pertumbuhan WHO
              </h4>
              <p className="text-[12px] text-zinc-400">
                Lihat posisi garis kurva berat & tinggi
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </Link>

        <Link
          href="/orang-tua/jadwal"
          className="p-4 rounded-[20px] bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] flex items-center justify-between hover:border-[#0d472c] transition-all shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-inter text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                Jadwal Penimbangan
              </h4>
              <p className="text-[12px] text-zinc-400">
                Berikutnya: 12 September 2026
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </Link>
      </div>
    </div>
  );
}
