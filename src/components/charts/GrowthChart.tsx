"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface GrowthChartProps {
  curveBBU: any[];
  curveTBU: any[];
  childPoints: any[];
  namaAnak?: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  curveBBU,
  curveTBU,
  childPoints,
  namaAnak = "Balita",
}) => {
  const [activeTab, setActiveTab] = useState<"TBU" | "BBU">("TBU");

  // Gabungkan data kurva referensi dengan titik pengukuran anak
  const isTBU = activeTab === "TBU";
  const refCurve = isTBU ? curveTBU : curveBBU;

  // Map titik anak berdasarkan usiaBulan
  const childMap = new Map();
  for (const cp of childPoints) {
    childMap.set(cp.usiaBulan, isTBU ? cp.tinggiCm : cp.beratKg);
  }

  // Sample data per 2 bulan untuk performa rendering yang mulus
  const chartData = refCurve
    .filter((row) => row.usiaBulan % 2 === 0 || childMap.has(row.usiaBulan))
    .map((row) => {
      const childVal = childMap.get(row.usiaBulan) || null;
      return {
        usia: row.usiaBulan,
        sd3neg: row.sd3neg,
        sd2neg: row.sd2neg,
        median: row.median,
        sd2pos: row.sd2pos,
        sd3pos: row.sd3pos,
        nilaiAnak: childVal,
      };
    });

  return (
    <div className="w-full bg-white dark:bg-[#161920] rounded-[24px] border border-[#e6e8eb] dark:border-[#262a34] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
      {/* Tab Switcher & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="font-inter text-[17px] font-bold text-zinc-900 dark:text-zinc-100">
            Kurva Standar Pertumbuhan WHO Permenkes 2020
          </h2>
          <p className="font-inter text-[12.5px] text-zinc-500 dark:text-zinc-400">
            Titik pengukuran riil {namaAnak} dibandingkan pita batas deviasi standar WHO
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("TBU")}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
              activeTab === "TBU"
                ? "bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Tinggi Badan (TB/U)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("BBU")}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
              activeTab === "BBU"
                ? "bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Berat Badan (BB/U)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[320px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="usia"
              tickLine={false}
              tick={{ fontSize: 11, fill: "#888888" }}
              unit=" bln"
            />
            <YAxis
              tickLine={false}
              tick={{ fontSize: 11, fill: "#888888" }}
              unit={isTBU ? " cm" : " kg"}
              domain={isTBU ? [45, 125] : [2, 28]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pData = payload[0]?.payload;
                  return (
                    <div className="p-3 bg-white dark:bg-[#1e222d] border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg text-[12px] space-y-1">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        Usia: {label} Bulan
                      </p>
                      {pData?.nilaiAnak && (
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          {namaAnak}: {pData.nilaiAnak} {isTBU ? "cm" : "kg"}
                        </p>
                      )}
                      <p className="text-zinc-500">Median (0 SD): {pData?.median} {isTBU ? "cm" : "kg"}</p>
                      <p className="text-amber-500">-2 SD: {pData?.sd2neg} {isTBU ? "cm" : "kg"}</p>
                      <p className="text-rose-500">-3 SD: {pData?.sd3neg} {isTBU ? "cm" : "kg"}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconSize={10}
              formatter={(value) => (
                <span className="text-[11.5px] font-medium text-zinc-600 dark:text-zinc-400">
                  {value}
                </span>
              )}
            />

            {/* Standard WHO Reference Lines - Clean Clinical Palette */}
            <Line
              type="monotone"
              dataKey="sd3pos"
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              name="+3 SD"
            />
            <Line
              type="monotone"
              dataKey="sd2pos"
              stroke="#cbd5e1"
              strokeWidth={1.2}
              dot={false}
              name="+2 SD"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke="#0d472c"
              strokeWidth={2}
              dot={false}
              name="Median WHO (Standar)"
            />
            <Line
              type="monotone"
              dataKey="sd2neg"
              stroke="#d97706"
              strokeWidth={1.5}
              dot={false}
              name="-2 SD (Garis Batas)"
            />
            <Line
              type="monotone"
              dataKey="sd3neg"
              stroke="#dc2626"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="-3 SD (Batas Kritis)"
            />

            {/* Child's Actual Data Line & Dots */}
            <Line
              type="linear"
              dataKey="nilaiAnak"
              stroke="#0d472c"
              strokeWidth={2.5}
              dot={{
                r: 4.5,
                fill: "#0d472c",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              activeDot={{ r: 6 }}
              connectNulls
              name={`Data Riil: ${namaAnak}`}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GrowthChart;
