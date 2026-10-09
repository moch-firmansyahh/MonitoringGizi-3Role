"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import { Send, Clock, User, Calendar, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Rujukan } from "@/types";
import RujukanTimeline from "@/components/rujukan/RujukanTimeline";

export default function RujukanPosyanduPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rujukanList, setRujukanList] = useState<Rujukan[]>([]);
  const [selectedRujukan, setSelectedRujukan] = useState<Rujukan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/rujukan");
        const json = await res.json();
        if (!ignore && res.ok && json.success) {
          setRujukanList(json.data || []);
        }
      } catch (err) {
        console.error("Gagal load rujukan:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selesai":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11.5px] font-semibold bg-[#eaf5ec] dark:bg-emerald-950/40 text-[#0d472c] dark:text-[#6ee7b7] border border-emerald-200/60 dark:border-emerald-800/40">
            Selesai
          </span>
        );
      case "ditolak":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11.5px] font-semibold bg-[#fde8e8] dark:bg-[#3b1212] text-[#a81a1a] dark:text-[#f87171] border border-rose-200/60 dark:border-rose-950/40">
            Ditolak
          </span>
        );
      case "ditindaklanjuti":
      case "diterima":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11.5px] font-semibold bg-[#eef3ed] dark:bg-[#1b2720] text-[#0d472c] dark:text-emerald-300 border border-[#c3dfc3] dark:border-emerald-900/60">
            Diproses Faskes
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11.5px] font-semibold bg-[#fef6dc] dark:bg-[#332b00] text-[#b45309] dark:text-[#fde047] border border-amber-200/60 dark:border-amber-900/40">
            Diajukan
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200">
      <Sidebar
        currentTab="rujukan"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Rujukan Faskes Posyandu
              </h1>
              <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
                Pemantauan status rujukan balita berisiko ke Puskesmas Bojongsoang
              </p>
            </div>
          </div>

          {/* Main Grid: Daftar Rujukan & Detail Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
            {/* Kolom Kiri: List Rujukan */}
            <div className="lg:col-span-2 bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
              <h2 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
                <span>Daftar Rujukan Terkirim</span>
              </h2>

              {isLoading ? (
                <div className="py-12 text-center text-zinc-400 text-[13.5px]">
                  Memuat data rujukan...
                </div>
              ) : rujukanList.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-[13.5px]">
                  Belum ada rujukan yang diajukan oleh Posyandu ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {rujukanList.map((r) => {
                    const isSelected = selectedRujukan?.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRujukan(r)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#0d472c] dark:border-emerald-700 bg-[#eaf5ec]/30 dark:bg-[#1b2720]/30 shadow-xs"
                            : "border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-[#1e222d] hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 text-[#0d472c] dark:text-emerald-300 flex items-center justify-center font-bold text-[12.5px]">
                              {r.anak?.nama?.charAt(0) || "B"}
                            </div>
                            <div>
                              <h3 className="font-inter text-[14.5px] font-bold text-zinc-900 dark:text-zinc-100">
                                {r.anak?.nama || "Balita"}
                              </h3>
                              <span className="text-[12px] text-zinc-400">
                                Ditujukan ke: Puskesmas Bojongsoang
                              </span>
                            </div>
                          </div>
                          {getStatusBadge(r.status)}
                        </div>

                        <p className="mt-2.5 text-[13px] text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                          {r.catatan}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-[11.5px] text-zinc-400">
                          <span>
                            Dibuat:{" "}
                            {new Date(r.createdAt || "").toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="font-medium text-[#0d472c] dark:text-emerald-400">
                            Lihat Timeline &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Timeline Riwayat Rujukan Terpilih */}
            <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
              <h2 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Riwayat & Tindak Lanjut</span>
              </h2>

              {selectedRujukan ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#1e222d] border border-gray-200/70 dark:border-zinc-800 space-y-1">
                    <span className="text-[11.5px] text-zinc-400 uppercase font-semibold">
                      Pasien Balita
                    </span>
                    <h4 className="font-inter text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedRujukan.anak?.nama}
                    </h4>
                    <p className="text-[12px] text-zinc-500">
                      Orang Tua: {selectedRujukan.anak?.namaOrangTua}
                    </p>
                  </div>

                  <div className="pt-2">
                    <h5 className="font-inter text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                      Alur Perubahan Status:
                    </h5>
                    <RujukanTimeline riwayat={selectedRujukan.riwayat || []} />
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-zinc-400 text-[13px] italic">
                  Pilih salah satu rujukan di sisi kiri untuk melihat alur tindak lanjut Puskesmas.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
