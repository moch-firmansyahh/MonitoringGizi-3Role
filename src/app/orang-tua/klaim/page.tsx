"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { showToast } from "@/lib/custom-toast";

export default function OrangTuaKlaimPage() {
  const router = useRouter();
  const [kodeKlaim, setKodeKlaim] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeKlaim.trim()) {
      setErrorMsg("Kode klaim wajib diisi");
      return;
    }
    if (!tanggalLahir) {
      setErrorMsg("Tanggal lahir balita wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orang-tua/klaim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kodeKlaim: kodeKlaim.trim().toUpperCase(),
          tanggalLahir,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "Gagal menautkan anak. Periksa kembali kode dan tanggal lahir.");
        setIsSubmitting(false);
        return;
      }

      showToast.success(`Berhasil menautkan balita: ${json.data.nama}`);
      router.push("/orang-tua");
    } catch {
      setErrorMsg("Gagal menghubungi server. Silakan coba kembali.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Header */}
      <div>
        <h1 className="font-inter text-[22px] sm:text-[26px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Tautkan Akun ke Buah Hati
        </h1>
        <p className="font-inter text-[13px] text-zinc-500 dark:text-zinc-400">
          Masukkan 8 digit kode klaim yang diberikan oleh kader Posyandu untuk menghubungkan profil anak
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="kodeKlaimInput"
              className="block font-inter text-[13.5px] font-medium text-zinc-800 dark:text-zinc-200 mb-1.5"
            >
              Kode Klaim 8-Karakter:
            </label>
            <div className="relative flex items-center">
              <input
                id="kodeKlaimInput"
                type="text"
                maxLength={10}
                value={kodeKlaim}
                onChange={(e) => {
                  setKodeKlaim(e.target.value.toUpperCase());
                  setErrorMsg(null);
                }}
                placeholder="Contoh: KLAIM123 atau kode 8 karakter"
                className="w-full h-[48px] px-4 font-mono text-[16px] tracking-widest uppercase rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1e222d] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0d472c] transition-all"
              />
              <KeyRound className="absolute right-4 w-5 h-5 text-zinc-400 pointer-events-none" />
            </div>
            <span className="text-[12px] text-zinc-400 mt-1 block">
              Dapatkan kode ini dari kader Posyandu saat sesi penimbangan balita.
            </span>
          </div>

          <div>
            <label
              htmlFor="tanggalLahirInput"
              className="block font-inter text-[13.5px] font-medium text-zinc-800 dark:text-zinc-200 mb-1.5"
            >
              Tanggal Lahir Balita (Verifikasi Identitas):
            </label>
            <input
              id="tanggalLahirInput"
              type="date"
              value={tanggalLahir}
              onChange={(e) => {
                setTanggalLahir(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full h-[48px] px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1e222d] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0d472c] transition-all"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#fde8e8] dark:bg-[#3b1212] border border-rose-200/60 dark:border-rose-950/40 text-[13px] text-[#a81a1a] dark:text-[#f87171] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[48px] rounded-xl bg-[#0d472c] hover:bg-[#0a3923] text-white font-inter text-[14.5px] font-medium transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Memverifikasi..." : "Tautkan Buah Hati"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
