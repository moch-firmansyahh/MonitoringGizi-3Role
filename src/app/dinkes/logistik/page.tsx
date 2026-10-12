"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import { Package, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";

export default function DinkesLogistikPage() {
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

  const logistik = data?.logistikPmt || {
    alokasiTotalPaket: 150,
    terdistribusi: 48,
    sisaStok: 102,
    biskuitProteinDus: 45,
    susuKhususKaleng: 28,
    vitaminASachet: 120,
  };

  const DAFTAR_DISTRIBUSI = [
    {
      id: "dst-001",
      tanggal: "12 Agustus 2026",
      penerima: "Muhammad Arfan (28 bln)",
      posyandu: "Posyandu Melati 03",
      puskesmas: "Puskesmas Bojongsoang",
      paket: "Paket PMT Pemulihan Protein Hewani (Biskuit + Fe)",
      status: "Terkirim",
      keterangan: "Resep tindakan Poli KIA Puskesmas Bojongsoang",
    },
    {
      id: "dst-002",
      tanggal: "11 Agustus 2026",
      penerima: "Aisyah Putri Humaira (14 bln)",
      posyandu: "Posyandu Mekar Sari 01",
      puskesmas: "Puskesmas Bojongsoang",
      paket: "PMT Telur & Biskuit Balita Kurang Gizi",
      status: "Terkirim",
      keterangan: "Pemberian berkala tahap 1",
    },
    {
      id: "dst-003",
      tanggal: "10 Agustus 2026",
      penerima: "Kenzo Rafasya (32 bln)",
      posyandu: "Posyandu Melati 03",
      puskesmas: "Puskesmas Bojongsoang",
      paket: "Suplementasi Gizi Mikro & Vitamin A",
      status: "Terkirim",
      keterangan: "Intervensi balita gizi kurang",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen xl:h-screen xl:overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200">
      <Sidebar
        currentTab="logistik"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 xl:h-screen xl:overflow-hidden">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1 xl:min-h-0 xl:overflow-y-auto">
          {/* Header */}
          <div>
            <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              Distribusi Logistik PMT Wilayah
            </h1>
            <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
              Monitoring penyaluran Pemberian Makanan Tambahan pemulihan stunting &amp; gizi buruk
            </p>
          </div>

          {/* Metric Cards Logistik */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <span className="text-[12.5px] text-zinc-500">Total Kuota Alokasi</span>
              <p className="text-[26px] font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {logistik.alokasiTotalPaket} <span className="text-[13px] font-normal text-zinc-400">paket</span>
              </p>
              <p className="text-[11.5px] text-zinc-400 mt-1">Anggaran BOK Gizi APBD 2026</p>
            </div>

            <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <span className="text-[12.5px] text-zinc-500">Paket Terdistribusi</span>
              <p className="text-[26px] font-bold text-emerald-600 mt-1">
                {logistik.terdistribusi} <span className="text-[13px] font-normal text-zinc-400">paket</span>
              </p>
              <p className="text-[11.5px] text-emerald-600 font-medium mt-1">
                32% dari total alokasi tersalurkan
              </p>
            </div>

            <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <span className="text-[12.5px] text-zinc-500">Sisa Stok Gudang Faskes</span>
              <p className="text-[26px] font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {logistik.sisaStok} <span className="text-[13px] font-normal text-zinc-400">paket</span>
              </p>
              <p className="text-[11.5px] text-zinc-400 mt-1">Siap untuk kasus rujukan baru</p>
            </div>
          </div>

          {/* Tabel Penyaluran Terbaru */}
          <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <h2 className="font-inter text-[18px] font-bold text-zinc-900 dark:text-zinc-100">
              Riwayat Penyaluran Paket PMT Terkini
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 text-zinc-400 font-medium pb-2">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Balita Penerima</th>
                    <th className="py-2.5 px-3">Posyandu / Faskes</th>
                    <th className="py-2.5 px-3">Rincian Paket PMT</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {DAFTAR_DISTRIBUSI.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3 text-zinc-500 whitespace-nowrap">{item.tanggal}</td>
                      <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.penerima}
                      </td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                        {item.posyandu}
                      </td>
                      <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200">{item.paket}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
