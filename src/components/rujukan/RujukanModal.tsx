"use client";

import React, { useState } from "react";
import { X, Send, AlertTriangle } from "lucide-react";
import { showToast } from "@/lib/custom-toast";

interface RujukanModalProps {
  isOpen: boolean;
  onClose: () => void;
  idAnak: string;
  namaAnak: string;
  idPengukuran: string;
  statusGizi: string;
  onSuccess?: () => void;
}

export const RujukanModal: React.FC<RujukanModalProps> = ({
  isOpen,
  onClose,
  idAnak,
  namaAnak,
  idPengukuran,
  statusGizi,
  onSuccess,
}) => {
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatan.trim()) {
      showToast.error("Catatan rujukan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rujukan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idAnak,
          idPengukuran,
          catatan: catatan.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json.error || "Gagal membuat rujukan");
        setIsSubmitting(false);
        return;
      }

      showToast.success(`Rujukan untuk ${namaAnak} berhasil diajukan ke Puskesmas`);
      setCatatan("");
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      showToast.error("Gagal menghubungi server saat membuat rujukan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-[24px] max-w-[540px] w-full p-6 sm:p-7 shadow-2xl relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fde8e8] dark:bg-[#3b1212] border border-rose-200/60 dark:border-rose-950/40 flex items-center justify-center text-[#a81a1a] dark:text-[#f87171]">
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100">
                Ajukan Rujukan Faskes
              </h3>
              <p className="font-inter text-[12.5px] text-zinc-500 dark:text-zinc-400">
                Rujuk balita ke Puskesmas Bojongsoang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#1e222d] border border-gray-200/70 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-inter text-[13px] text-zinc-500 dark:text-zinc-400">
                Nama Balita:
              </span>
              <span className="font-inter text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100">
                {namaAnak}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="font-inter text-[13px] text-zinc-500 dark:text-zinc-400">
                Indikasi Status Gizi:
              </span>
              <span className="font-inter text-[12px] font-semibold px-2 py-0.5 rounded-md bg-[#fde8e8] dark:bg-[#3b1212] text-[#a81a1a] dark:text-[#f87171] border border-rose-200/60 dark:border-rose-950/40">
                {statusGizi}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="catatanRujukan"
              className="block font-inter text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Catatan & Gejala Klinis Rujukan:
            </label>
            <textarea
              id="catatanRujukan"
              rows={4}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Balita mengalami stunting kronis dengan nafsu makan menurun dalam 2 bulan. Disarankan evaluasi asupan kalori dan suplemen protein hewani."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1e222d] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-[13.5px] focus:outline-none focus:border-[#0d472c] focus:ring-1 focus:ring-[#0d472c] transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-[40px] rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-inter text-[13.5px] font-medium cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-[40px] rounded-xl bg-[#0d472c] hover:bg-[#0a3923] disabled:opacity-75 text-white font-inter text-[13.5px] font-medium flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4 stroke-[2]" />
              <span>{isSubmitting ? "Mengirim..." : "Kirim Rujukan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RujukanModal;
