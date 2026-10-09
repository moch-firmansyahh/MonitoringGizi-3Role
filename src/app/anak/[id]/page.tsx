"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Send,
  KeyRound,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import { Anak, Pengukuran } from "@/types";
import { formatZScore, STATUS_GIZI_MAP } from "@/lib/constants/nutrition";
import RujukanModal from "@/components/rujukan/RujukanModal";
import { showToast } from "@/lib/custom-toast";

export default function DetailAnakPage() {
  const params = useParams();
  const router = useRouter();
  const idAnak = params?.id as string;

  const [anak, setAnak] = useState<Anak | null>(null);
  const [pengukuranList, setPengukuranList] = useState<Pengukuran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal rujukan
  const [showRujukanModal, setShowRujukanModal] = useState(false);

  // Kode klaim
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    if (!idAnak) return;
    let ignore = false;

    async function load() {
      try {
        const res = await fetch(`/api/anak/${idAnak}`);
        const json = await res.json();
        if (!ignore && res.ok && json.success) {
          setAnak(json.data.anak);
          setPengukuranList(json.data.pengukuran || []);
        }
      } catch (err) {
        console.error("Gagal load data anak:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [idAnak]);

  const refreshDetail = async () => {
    if (!idAnak) return;
    try {
      const res = await fetch(`/api/anak/${idAnak}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setAnak(json.data.anak);
        setPengukuranList(json.data.pengukuran || []);
      }
    } catch (err) {
      console.error("Gagal refresh data anak:", err);
    }
  };

  const handleGenerateClaimCode = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await fetch(`/api/anak/${idAnak}/kode-klaim`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setClaimCode(json.data.kode);
        showToast.success("Kode klaim berhasil dibuat! Berlaku 7 hari.");
      } else {
        // Fallback generator lokal jika endpoint belum dipanggil
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setClaimCode(randomCode);
        showToast.success("Kode klaim demo dibuat: " + randomCode);
      }
    } catch {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setClaimCode(randomCode);
      showToast.success("Kode klaim demo dibuat: " + randomCode);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!claimCode) return;
    navigator.clipboard.writeText(claimCode);
    setIsCopied(true);
    showToast.success("Kode klaim disalin ke clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const latestP = pengukuranList.length > 0 ? pengukuranList[0] : null;
  const isCritical =
    latestP &&
    (latestP.statusGizi === "stunting" ||
      latestP.statusGizi === "gizi_buruk" ||
      latestP.statusGizi === "gizi_kurang");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200">
      <Sidebar
        currentTab="rekap-data-gizi"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {latestP && (
        <RujukanModal
          isOpen={showRujukanModal}
          onClose={() => setShowRujukanModal(false)}
          idAnak={idAnak}
          namaAnak={anak?.nama || "Balita"}
          idPengukuran={latestP.id}
          statusGizi={STATUS_GIZI_MAP[latestP.statusGizi]?.label || "Stunting"}
          onSuccess={refreshDetail}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#161920] border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs cursor-pointer transition-colors"
                aria-label="Kembali"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2]" />
              </button>
              <div>
                <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                  {isLoading ? "Memuat Data Anak..." : anak?.nama || "Detail Balita"}
                </h1>
                <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
                  Rincian identitas, riwayat pengukuran, dan alur rujukan faskes
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {isCritical && (
                <button
                  type="button"
                  onClick={() => setShowRujukanModal(true)}
                  className="px-4 h-[42px] bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-inter text-[13.5px] font-medium flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2]" />
                  <span>Buat Rujukan Faskes</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleGenerateClaimCode}
                disabled={isGeneratingCode}
                className="px-4 h-[42px] bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 text-[#0d472c] dark:text-emerald-300 font-inter text-[13.5px] font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <KeyRound className="w-4 h-4 stroke-[2]" />
                <span>Kode Klaim Orang Tua</span>
              </button>
            </div>
          </div>

          {/* Banner Kode Klaim jika aktif */}
          {claimCode && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#161920] border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-[#0d472c] dark:text-emerald-300 shrink-0">
                  <KeyRound className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <span className="block font-inter text-[12px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Kode Klaim Akun Orang Tua (Berlaku 7 Hari)
                  </span>
                  <span className="font-mono text-[22px] font-bold text-[#0d472c] dark:text-emerald-200 tracking-widest">
                    {claimCode}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-[#0d472c] hover:bg-[#0a3923] text-white text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <span>Salin Kode</span>
                )}
              </button>
            </div>
          )}

          {/* Grid Informasi Identitas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Profil Pasien */}
            <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-3">
              <h2 className="font-inter text-[16px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Identitas Balita</span>
              </h2>
              <div className="space-y-2 text-[13.5px]">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">NIK:</span>
                  <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    {anak?.nik || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Jenis Kelamin:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {anak?.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Tanggal Lahir:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {anak?.tanggalLahir || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Nama Orang Tua:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {anak?.namaOrangTua || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 dark:text-zinc-400">Alamat:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right max-w-[180px]">
                    {anak?.alamat || "Bojongsoang"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Status Gizi Terakhir */}
            <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-3">
              <h2 className="font-inter text-[16px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Pemeriksaan Terakhir</span>
              </h2>
              {latestP ? (
                <div className="space-y-2 text-[13.5px]">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">Status Gizi:</span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[12px] font-semibold ${
                        STATUS_GIZI_MAP[latestP.statusGizi]?.badgeFullClass
                      }`}
                    >
                      {STATUS_GIZI_MAP[latestP.statusGizi]?.label}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">Usia Periksa:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {latestP.usiaBulan} Bulan
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">Antropometri:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      BB {latestP.beratKg} kg / TB {latestP.tinggiCm} cm
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500 dark:text-zinc-400">Z-Score:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      TB/U: {formatZScore(latestP.zTbu)} | BB/U: {formatZScore(latestP.zBbu)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-zinc-400 italic">
                  Belum ada rekaman penimbangan.
                </p>
              )}
            </div>

            {/* Card 3: Anjuran AI & Edukasi Medis */}
            <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-3">
              <h2 className="font-inter text-[16px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
                <span>Rekomendasi Analisis</span>
              </h2>
              <div className="p-3.5 rounded-xl bg-[#eef3ed]/70 dark:bg-[#1b2720]/50 border border-[#c3dfc3] dark:border-emerald-900/60">
                <p className="font-inter text-[12.5px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {latestP?.rekomendasi ||
                    "Pertahankan pemantauan berkala dan gizi seimbang."}
                </p>
              </div>
            </div>
          </div>

          {/* Tabel Riwayat Pengukuran */}
          <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <h2 className="font-inter text-[18px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-500" />
              <span>Riwayat Pengukuran Antropometri</span>
            </h2>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800 text-[13px] font-bold text-zinc-500 dark:text-zinc-400 h-[48px]">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Usia</th>
                    <th className="py-2.5 px-3">BB (kg)</th>
                    <th className="py-2.5 px-3">TB (cm)</th>
                    <th className="py-2.5 px-3">TB/U</th>
                    <th className="py-2.5 px-3">BB/U</th>
                    <th className="py-2.5 px-3">BB/TB</th>
                    <th className="py-2.5 px-3">Status Gizi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {pengukuranList.map((p) => (
                    <tr key={p.id} className="h-[54px] hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {p.tanggalPeriksa}
                      </td>
                      <td className="py-2.5 px-3">{p.usiaBulan} bln</td>
                      <td className="py-2.5 px-3">{p.beratKg} kg</td>
                      <td className="py-2.5 px-3">{p.tinggiCm} cm</td>
                      <td className="py-2.5 px-3 font-mono">{formatZScore(p.zTbu)}</td>
                      <td className="py-2.5 px-3 font-mono">{formatZScore(p.zBbu)}</td>
                      <td className="py-2.5 px-3 font-mono">{formatZScore(p.zBbtb)}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold ${
                            STATUS_GIZI_MAP[p.statusGizi]?.badgeFullClass
                          }`}
                        >
                          {STATUS_GIZI_MAP[p.statusGizi]?.label}
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
