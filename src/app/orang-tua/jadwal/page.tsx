"use client";

import React from "react";
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";

export default function OrangTuaJadwalPage() {
  const jadwalList = [
    {
      id: "j1",
      tanggal: "12 September 2026",
      jenis: "Penimbangan & Pengukuran Rutin Bulanan",
      lokasi: "Posyandu Melati 03, Balai RW 03",
      keterangan: "Pemberian PMT telur & evaluasi tumbuh kembang bulanan.",
      status: "Akan Datang",
      isNext: true,
    },
    {
      id: "j2",
      tanggal: "20 Agustus 2026",
      jenis: "Konsultasi Rujukan Poli Gizi Puskesmas",
      lokasi: "Puskesmas Bojongsoang (Poli KIA / Gizi)",
      keterangan: "Pemeriksaan lanjutan stunting kronis bersama dr. Syahla.",
      status: "Akan Datang",
      isNext: false,
    },
    {
      id: "j3",
      tanggal: "12 Agustus 2026",
      jenis: "Penimbangan Posyandu",
      lokasi: "Posyandu Melati 03",
      keterangan: "Pemeriksaan selesai. Data telah tercatat di SimGizi.",
      status: "Selesai",
      isNext: false,
    },
  ];

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Header */}
      <div>
        <h1 className="font-inter text-[22px] sm:text-[26px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Jadwal Posyandu & Faskes
        </h1>
        <p className="font-inter text-[13px] text-zinc-500 dark:text-zinc-400">
          Daftar jadwal penimbangan rutin dan kunjungan kontrol buah hati Anda
        </p>
      </div>

      {/* List Jadwal */}
      <div className="space-y-3.5">
        {jadwalList.map((j) => (
          <div
            key={j.id}
            className={`p-5 rounded-[22px] border transition-all ${
              j.isNext
                ? "bg-white dark:bg-[#161920] border-[#0d472c] dark:border-emerald-700/60 shadow-xs"
                : "bg-white dark:bg-[#161920] border-[#e6e8eb] dark:border-[#262a34] shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
                <span className="font-inter text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                  {j.tanggal}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  j.status === "Selesai"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700"
                    : j.isNext
                    ? "bg-[#eef3ed] dark:bg-[#1b2720] text-[#0d472c] dark:text-emerald-300 border-[#c3dfc3] dark:border-emerald-900/60"
                    : "bg-zinc-50 dark:bg-[#1e222d] text-zinc-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700"
                }`}
              >
                {j.status}
              </span>
            </div>

            <h3 className="font-inter text-[15.5px] font-bold text-zinc-900 dark:text-zinc-100 mt-2.5">
              {j.jenis}
            </h3>

            <div className="flex items-center gap-1.5 text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{j.lokasi}</span>
            </div>

            <p className="mt-2 text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1e222d] border border-gray-100 dark:border-zinc-800">
              {j.keterangan}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
