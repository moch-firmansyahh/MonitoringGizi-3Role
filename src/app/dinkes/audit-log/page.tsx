"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Code2,
  X,
  Server,
  Layers,
  Clock,
} from "lucide-react";

export default function DinkesAuditLogPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [brokerStatus, setBrokerStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJson, setSelectedJson] = useState<any | null>(null);

  const handleRefresh = async () => {
    try {
      const q = new URLSearchParams();
      if (filterType !== "all") q.append("eventType", filterType);
      if (searchQuery) q.append("search", searchQuery);

      const res = await fetch(`/api/dinkes/audit-log?${q.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setLogs(json.data.logs || []);
        setSummary(json.data.summary || null);
        setBrokerStatus(json.data.brokerStatus || null);
      }
    } catch (err) {
      console.error("Gagal refresh audit log:", err);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchLogs = async () => {
      try {
        const q = new URLSearchParams();
        if (filterType !== "all") q.append("eventType", filterType);
        if (searchQuery) q.append("search", searchQuery);

        const res = await fetch(`/api/dinkes/audit-log?${q.toString()}`);
        const json = await res.json();
        if (active && res.ok && json.success) {
          setLogs(json.data.logs || []);
          setSummary(json.data.summary || null);
          setBrokerStatus(json.data.brokerStatus || null);
        }
      } catch (err) {
        console.error("Gagal load audit log:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchLogs();
    const timer = setInterval(fetchLogs, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [filterType, searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen xl:h-screen xl:overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-100 font-inter transition-colors duration-200">
      <Sidebar
        currentTab="audit-log"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 xl:h-screen xl:overflow-hidden">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-5 xl:p-6 flex flex-col space-y-4 [@media(min-height:850px)]:space-y-5 w-full flex-1 xl:min-h-0 xl:overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaf5ec] dark:bg-emerald-950/40 text-[#0d472c] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Consumer 3 (Dinas Kesehatan)
                </span>
                <span className="text-[12px] text-zinc-400">Queue: simgizi.audit.laporan</span>
              </div>
              <h1 className="font-inter text-[24px] sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight mt-1">
                Audit Trail Message Broker
              </h1>
              <p className="font-inter text-[13px] sm:text-[13.5px] text-zinc-500 dark:text-zinc-400">
                Pencatatan jejak transaksi seluruh event RabbitMQ secara asinkronus dan real-time
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="h-[42px] px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#161920] hover:bg-gray-50 text-zinc-700 dark:text-zinc-300 text-[13.5px] font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Broker Status Top Card */}
          <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[11.5px]">Status RabbitMQ</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {brokerStatus?.connected ? "Aktif (Connected)" : "Mode Fail-Safe"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[11.5px]">Topic Exchange</p>
                  <p className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    simgizi.events
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[11.5px]">Total Event Audit</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {summary?.totalEvents || logs.length} Event
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[11.5px]">Consumer 3 (Dinkes)</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    1 Worker Listening
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "Semua Event" },
                { id: "pengukuran.created", label: "pengukuran.created" },
                { id: "rujukan.created", label: "rujukan.created" },
                { id: "rujukan.updated", label: "rujukan.updated" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-[12.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    filterType === f.id
                      ? "bg-[#0d472c] text-white"
                      : "bg-white dark:bg-[#161920] border border-gray-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-[260px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari event ID, anak, faskes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] pl-9 pr-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#161920] text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white dark:bg-[#161920] rounded-[20px] [@media(min-height:850px)]:rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-[#1e222d]/60 text-zinc-500 dark:text-zinc-400 font-semibold h-[46px]">
                    <th className="px-4 py-2">Waktu</th>
                    <th className="px-4 py-2">Routing Key</th>
                    <th className="px-4 py-2">Event ID</th>
                    <th className="px-4 py-2">Produser</th>
                    <th className="px-4 py-2">Ringkasan Payload Transaksi</th>
                    <th className="px-4 py-2 text-center">Status Broker</th>
                    <th className="px-4 py-2 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                        Tidak ada log event audit yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500 text-[12px]">
                          {new Date(log.timestamp).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                            {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[11.5px] font-semibold ${
                              log.eventType === "pengukuran.created"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : log.eventType === "rujukan.created"
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            }`}
                          >
                            {log.eventType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11.5px] text-zinc-400 whitespace-nowrap">
                          {log.eventId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                          {log.producer}
                        </td>
                        <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">
                          <p className="line-clamp-1 font-medium">{log.ringkasan}</p>
                          {log.namaAnak && (
                            <p className="text-[11.5px] text-zinc-400">
                              Pasien: <span className="font-semibold">{log.namaAnak}</span>
                              {log.faskes ? ` • Faskes: ${log.faskes}` : ""}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 stroke-[2.2]" />
                            Ack 200
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedJson(log)}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Payload</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* JSON Payload Viewer Modal */}
      {selectedJson && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[620px] bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-[17px] text-zinc-900 dark:text-zinc-100">
                  Detail Pesan Event AMQP (RabbitMQ)
                </h3>
                <p className="text-[12.5px] text-zinc-500 font-mono mt-0.5">
                  ID: {selectedJson.eventId} | Topic: {selectedJson.eventType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJson(null)}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="bg-zinc-900 text-zinc-100 rounded-xl p-4 font-mono text-[12px] overflow-x-auto max-h-[380px] leading-relaxed">
              <pre>{JSON.stringify(selectedJson, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedJson(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-[13px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
