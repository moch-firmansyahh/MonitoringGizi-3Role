"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  CheckCircle,
  XCircle,
  ArrowRight,
  Filter,
  Clock,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { Rujukan, StatusRujukan } from "@/types";
import { showToast } from "@/lib/custom-toast";
import RujukanTimeline from "@/components/rujukan/RujukanTimeline";

export default function PuskesmasRujukanPage() {
  const [rujukanList, setRujukanList] = useState<Rujukan[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [selectedRujukan, setSelectedRujukan] = useState<Rujukan | null>(null);
  const [actionRujukan, setActionRujukan] = useState<Rujukan | null>(null);
  const [actionType, setActionType] = useState<StatusRujukan | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const url =
          filterStatus === "semua"
            ? "/api/rujukan"
            : `/api/rujukan?status=${filterStatus}`;
        const res = await fetch(url);
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
  }, [filterStatus]);

  const refreshRujukan = async () => {
    try {
      const url =
        filterStatus === "semua"
          ? "/api/rujukan"
          : `/api/rujukan?status=${filterStatus}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setRujukanList(json.data || []);
      }
    } catch (err) {
      console.error("Gagal refresh rujukan:", err);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionRujukan || !actionType) return;

    if (actionType === "ditolak" && !actionNote.trim()) {
      showToast.error("Alasan penolakan rujukan wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rujukan/${actionRujukan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          alasanPenolakan: actionType === "ditolak" ? actionNote.trim() : undefined,
          catatanTindakan: actionType !== "ditolak" ? actionNote.trim() : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json.error || "Gagal memperbarui status rujukan");
        setIsSubmitting(false);
        return;
      }

      showToast.success(`Status rujukan berhasil diubah menjadi ${actionType}`);
      setActionRujukan(null);
      setActionType(null);
      setActionNote("");
      refreshRujukan();
    } catch {
      showToast.error("Gagal menghubungi server saat memperbarui rujukan");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        return (
          <span className="px-2.5 py-1 rounded-md text-[11.5px] font-semibold bg-[#eef3ed] dark:bg-[#1b2720] text-[#0d472c] dark:text-emerald-300 border border-[#c3dfc3] dark:border-emerald-900/60">
            Ditindaklanjuti
          </span>
        );
      case "diterima":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11.5px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            Diterima
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
    <div className="flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            Inbox Rujukan Faskes
          </h1>
          <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
            Terima, tolak, dan tindak lanjuti kasus gizi balita rujukan dari Posyandu binaan
          </p>
        </div>

        {/* Filter Status Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-[42px] px-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option value="semua">Semua Status</option>
            <option value="diajukan">Diajukan (Perlu Respons)</option>
            <option value="diterima">Diterima</option>
            <option value="ditindaklanjuti">Ditindaklanjuti</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Daftar Rujukan & Timeline Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Kolom Kiri: List Rujukan Masuk */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
          <h2 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
            <span>Rujukan Masuk ({rujukanList.length})</span>
          </h2>

          {isLoading ? (
            <div className="py-12 text-center text-zinc-400">
              Memuat data rujukan...
            </div>
          ) : rujukanList.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-[13.5px]">
              Tidak ada rujukan dengan status terpilih.
            </div>
          ) : (
            <div className="space-y-3">
              {rujukanList.map((r) => {
                const isSelected = selectedRujukan?.id === r.id;
                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-[#0d472c] dark:border-emerald-700 bg-[#eaf5ec]/30 dark:bg-[#1b2720]/30"
                        : "border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-[#1e222d]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#eef3ed] dark:bg-[#1b2720] border border-[#c3dfc3] dark:border-emerald-900/60 text-[#0d472c] dark:text-emerald-300 flex items-center justify-center font-bold text-[13px]">
                          {r.anak?.nama?.charAt(0) || "B"}
                        </div>
                        <div>
                          <h3 className="font-inter text-[14.5px] font-bold text-zinc-900 dark:text-zinc-100">
                            {r.anak?.nama || "Balita"}
                          </h3>
                          <span className="text-[12px] text-zinc-400">
                            Dari: Posyandu Melati 03
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(r.status)}
                    </div>

                    <p className="mt-2 text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {r.catatan}
                    </p>

                    {r.alasanPenolakan && (
                      <div className="mt-2 p-2.5 rounded-lg bg-[#fde8e8]/70 dark:bg-[#3b1212]/40 border border-rose-200/60 dark:border-rose-950/40 text-[#a81a1a] dark:text-[#f87171] text-[12px]">
                        <strong>Alasan Penolakan:</strong> {r.alasanPenolakan}
                      </div>
                    )}

                    {r.catatanTindakan && (
                      <div className="mt-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[12px]">
                        <strong>Hasil Tindakan Faskes:</strong> {r.catatanTindakan}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRujukan(r)}
                        className="text-[12.5px] font-semibold text-[#0d472c] dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Lihat Riwayat &rarr;
                      </button>

                      {/* Tombol Aksi Puskesmas */}
                      <div className="flex items-center gap-1.5">
                        {r.status === "diajukan" && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActionRujukan(r);
                                setActionType("diterima");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#0d472c] hover:bg-[#0a3923] text-white text-[12px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" /> Terima
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionRujukan(r);
                                setActionType("ditolak");
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 text-[#a81a1a] dark:text-[#f87171] hover:bg-rose-100 dark:hover:bg-rose-950/60 text-[12px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </>
                        )}

                        {r.status === "diterima" && (
                          <button
                            type="button"
                            onClick={() => {
                              setActionRujukan(r);
                              setActionType("ditindaklanjuti");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#0d472c] hover:bg-[#0a3923] text-white text-[12px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" /> Tindak Lanjut
                          </button>
                        )}

                        {r.status === "ditindaklanjuti" && (
                          <button
                            type="button"
                            onClick={() => {
                              setActionRujukan(r);
                              setActionType("selesai");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#0d472c] hover:bg-[#0a3923] text-white text-[12px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Selesaikan
                          </button>
                        )}
                      </div>
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
            <Clock className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />
            <span>Audit Trail Riwayat Status</span>
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
                  Status Saat Ini: <strong>{selectedRujukan.status}</strong>
                </p>
              </div>

              <div className="pt-2">
                <RujukanTimeline riwayat={selectedRujukan.riwayat || []} />
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-400 text-[13px] italic">
              Klik salah satu rujukan untuk melihat audit trail riwayat tindakan faskes.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tindakan Rujukan */}
      {actionRujukan && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-[24px] max-w-[500px] w-full p-6 shadow-2xl relative select-none">
            <h3 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100">
              Konfirmasi Tindakan: {actionType.toUpperCase()}
            </h3>
            <p className="font-inter text-[13px] text-zinc-500 mt-1">
              Pasien: {actionRujukan.anak?.nama}
            </p>

            <form onSubmit={handleActionSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="actionNotes"
                  className="block font-inter text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  {actionType === "ditolak"
                    ? "Alasan Penolakan (Wajib Diisi):"
                    : "Catatan Evaluasi / Rekomendasi Medis Puskesmas:"}
                </label>
                <textarea
                  id="actionNotes"
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    actionType === "ditolak"
                      ? "Contoh: Balita telah terdaftar pada program intervensi gizi faskes rujukan lain."
                      : "Contoh: Diberikan PMT formula F-100 dan jadwal kunjungan evaluasi poli gizi balita."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1e222d] text-[13.5px] focus:outline-none focus:border-[#0d472c] focus:ring-1 focus:ring-[#0d472c] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionRujukan(null);
                    setActionType(null);
                  }}
                  className="px-4 h-[40px] rounded-xl border border-gray-200 dark:border-zinc-700 text-[13.5px] font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 h-[40px] rounded-xl bg-[#0d472c] hover:bg-[#0a3923] text-white text-[13.5px] font-medium cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Tindakan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
