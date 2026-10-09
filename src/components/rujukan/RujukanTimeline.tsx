"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { RujukanRiwayat } from "@/types";

interface RujukanTimelineProps {
  riwayat: RujukanRiwayat[];
}

export const RujukanTimeline: React.FC<RujukanTimelineProps> = ({ riwayat }) => {
  if (!riwayat || riwayat.length === 0) {
    return (
      <p className="text-[13px] text-zinc-400 italic">
        Belum ada riwayat perubahan status.
      </p>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "selesai":
        return <CheckCircle2 className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />;
      case "ditolak":
        return <XCircle className="w-4 h-4 text-[#a81a1a] dark:text-[#f87171]" />;
      case "ditindaklanjuti":
        return <ArrowRight className="w-4 h-4 text-[#0d472c] dark:text-emerald-400" />;
      case "diterima":
        return <ArrowRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />;
      default:
        return <Clock className="w-4 h-4 text-[#b45309] dark:text-[#fde047]" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-4 border-l border-gray-200 dark:border-zinc-800">
      {riwayat.map((r) => (
        <div key={r.id} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-white dark:bg-[#161920] border border-gray-200 dark:border-zinc-700 flex items-center justify-center shadow-xs">
            {getStatusIcon(r.keStatus)}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-inter text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                {r.keStatus}
              </span>
              <span className="text-[11.5px] text-zinc-400">
                {new Date(r.waktu).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {r.namaPelaku && (
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Oleh: {r.namaPelaku}
              </span>
            )}

            {r.catatan && (
              <p className="text-[12.5px] text-zinc-700 dark:text-zinc-300 mt-1 p-2 rounded-lg bg-zinc-50 dark:bg-[#1e222d] border border-gray-100 dark:border-zinc-800 leading-normal">
                {r.catatan}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RujukanTimeline;
