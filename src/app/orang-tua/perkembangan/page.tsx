"use client";

import React, { useState, useEffect } from "react";
import GrowthChart from "@/components/charts/GrowthChart";
import { formatZScore, STATUS_GIZI_MAP } from "@/lib/constants/nutrition";
import { TrendingUp, Clock, User } from "lucide-react";
import { Anak } from "@/types";

export default function OrangTuaPerkembanganPage() {
  const [anakList, setAnakList] = useState<Anak[]>([]);
  const [selectedAnak, setSelectedAnak] = useState<Anak | null>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil daftar anak milik orang tua yang login
  useEffect(() => {
    let ignore = false;
    async function loadAnak() {
      try {
        const res = await fetch("/api/anak");
        const json = await res.json();
        if (!ignore && res.ok && json.success && Array.isArray(json.data)) {
          // Deduplikasi ketat by NIK
          const uniqueChildren: Anak[] = json.data.filter(
            (v: Anak, i: number, a: Anak[]) =>
              a.findIndex((t) => t.nik === v.nik) === i,
          );
          setAnakList(uniqueChildren);
          if (uniqueChildren.length > 0) {
            setSelectedAnak(uniqueChildren[0]);
          }
        }
      } catch (err) {
        console.error("Gagal load daftar anak:", err);
      }
    }
    loadAnak();
    return () => {
      ignore = true;
    };
  }, []);

  // 2. Ambil data kurva untuk anak yang dipilih
  useEffect(() => {
    if (!selectedAnak) return;
    let ignore = false;
    async function loadKurva() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/anak/${selectedAnak.id}/kurva`);
        const json = await res.json();
        if (!ignore && res.ok && json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Gagal load kurva:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadKurva();
    return () => {
      ignore = true;
    };
  }, [selectedAnak]);

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h1 className="font-inter text-[22px] sm:text-[26px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            Kurva Pertumbuhan Balita
          </h1>
          <p className="font-inter text-[13px] text-zinc-500 dark:text-zinc-400">
            Grafik garis pertumbuhan {selectedAnak?.nama || "Muhammad Arfan"} dibandingkan standar WHO Permenkes 2020
          </p>
        </div>

        {/* Switcher Tab Balita Orang Tua */}
        {anakList.length > 1 && (
          <div className="flex items-center gap-2">
            {anakList.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAnak(a)}
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
      </div>

      {/* Komponen Grafik Kurva WHO */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-12 text-center text-zinc-400">
          Memuat kurva pertumbuhan WHO...
        </div>
      ) : (
        <GrowthChart
          curveBBU={data?.curveBBU || []}
          curveTBU={data?.curveTBU || []}
          childPoints={data?.childPoints || []}
          namaAnak={selectedAnak?.nama || data?.anak?.nama || "Muhammad Arfan"}
        />
      )}

      {/* Tabel Riwayat Pengukuran Singkat */}
      <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
        <h2 className="font-inter text-[16px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
          <span>Catatan Penimbangan dari Posyandu</span>
        </h2>

        <div className="space-y-3">
          {(data?.childPoints || []).length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-[13px]">
              Belum ada riwayat penimbangan untuk balita ini.
            </div>
          ) : (
            (data?.childPoints || []).map((cp: any) => (
              <div
                key={cp.id}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#1e222d] border border-gray-100 dark:border-zinc-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-inter text-[13.5px] font-bold text-zinc-900 dark:text-zinc-100 block">
                    Pemeriksaan Usia {cp.usiaBulan} Bulan
                  </span>
                  <span className="text-[12px] text-zinc-400">
                    Tanggal: {cp.tanggalPeriksa} | Berat: {cp.beratKg} kg | Tinggi: {cp.tinggiCm} cm
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold ${
                    STATUS_GIZI_MAP[cp.statusGizi as keyof typeof STATUS_GIZI_MAP]?.badgeFullClass
                  }`}
                >
                  {STATUS_GIZI_MAP[cp.statusGizi as keyof typeof STATUS_GIZI_MAP]?.label}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
