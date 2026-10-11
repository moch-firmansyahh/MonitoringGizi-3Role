"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Clock, AlertTriangle, Calendar } from "lucide-react";
import { showToast } from "@/lib/custom-toast";

export default function OrangTuaNotifikasiPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/notifikasi");
        const json = await res.json();
        if (!ignore && res.ok && json.success) {
          setNotifs(json.data || []);
        }
      } catch (err) {
        console.error("Gagal load notifikasi:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 4000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  const markAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    try {
      await fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      showToast.success("Semua notifikasi ditandai telah dibaca.");
    } catch {}
  };

  const markOneRead = async (id: string) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)),
    );
    try {
      await fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h1 className="font-inter text-[22px] sm:text-[26px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            Pusat Pesan & Notifikasi
          </h1>
          <p className="font-inter text-[13px] text-zinc-500 dark:text-zinc-400">
            Pemberitahuan hasil penimbangan, pengingat, dan status rujukan
          </p>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[12px] font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
        >
          Tandai Semua Dibaca
        </button>
      </div>

      {/* List Notifikasi */}
      {isLoading ? (
        <div className="py-12 text-center text-zinc-400 text-[13.5px]">
          Memuat notifikasi...
        </div>
      ) : notifs.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-[13.5px]">
          Belum ada notifikasi baru untuk saat ini.
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => {
            const isRujukan =
              n.jenis === "rujukan_status" ||
              n.jenis === "rujukan_baru" ||
              n.jenis === "rujukan";
            const isJadwal =
              n.jenis === "jadwal_pengingat" || n.jenis === "jadwal";

            return (
              <div
                key={n.id}
                onClick={() => markOneRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  !n.dibaca
                    ? "bg-white dark:bg-[#161920] border-[#0d472c] dark:border-emerald-700/60 shadow-xs"
                    : "bg-white dark:bg-[#161920] border-gray-200/80 dark:border-zinc-800 opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isRujukan
                          ? "bg-[#fde8e8] text-[#a81a1a] dark:bg-[#3b1212] dark:text-[#f87171] border-rose-200/60 dark:border-rose-950/40"
                          : isJadwal
                          ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700"
                          : "bg-[#eef3ed] text-[#0d472c] dark:bg-[#1b2720] dark:text-emerald-300 border-[#c3dfc3] dark:border-emerald-900/60"
                      }`}
                    >
                      {isRujukan ? (
                        <AlertTriangle className="w-4 h-4 stroke-[2]" />
                      ) : isJadwal ? (
                        <Calendar className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Bell className="w-4 h-4 stroke-[2]" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-inter text-[14.5px] font-bold text-zinc-900 dark:text-zinc-100">
                        {n.judul}
                      </h3>
                      <p className="font-inter text-[13px] text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                        {n.isi}
                      </p>
                      <span className="text-[11.5px] text-zinc-400 mt-2 block">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : n.waktu || "Hari ini"}
                      </span>
                    </div>
                  </div>

                  {!n.dibaca && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0d472c] dark:bg-emerald-400 shrink-0 mt-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
