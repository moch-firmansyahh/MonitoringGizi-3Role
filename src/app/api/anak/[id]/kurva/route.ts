import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { anakRepository } from "@/lib/repositories/anak.repository";
import { pengukuranRepository } from "@/lib/repositories/pengukuran.repository";
import zscoreData from "@/lib/data/zscore-reference.json";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Sesi tidak valid." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const anak = await anakRepository.getById(id);
    if (!anak) {
      return NextResponse.json(
        { success: false, error: "Data anak tidak ditemukan." },
        { status: 404 },
      );
    }

    const pengukuran = await pengukuranRepository.getByAnakId(id);

    // Ambil tabel referensi baku WHO sesuai jenis kelamin
    const jkKey = anak.jenisKelamin === "P" ? "perempuan" : "laki-laki";
    const ref = (zscoreData as any)[jkKey];

    // 1. Kurva Standar BB/U (0 - 60 Bulan)
    const bbuTable = ref["BB/U"] || [];
    const curveBBU = bbuTable.map((row: any) => ({
      usiaBulan: row.x,
      sd3neg: row.sd3neg,
      sd2neg: row.sd2neg,
      median: row.median,
      sd2pos: row.sd2pos,
      sd3pos: row.sd3pos,
    }));

    // 2. Kurva Standar TB/U atau PB/U (0 - 60 Bulan)
    const tbuTable = ref["TB/U"] || ref["PB/U"] || [];
    const curveTBU = tbuTable.map((row: any) => ({
      usiaBulan: row.x,
      sd3neg: row.sd3neg,
      sd2neg: row.sd2neg,
      median: row.median,
      sd2pos: row.sd2pos,
      sd3pos: row.sd3pos,
    }));

    // 3. Titik Pengukuran Riil Pasien Anak
    const childPoints = pengukuran.map((p) => ({
      id: p.id,
      tanggalPeriksa: p.tanggalPeriksa,
      usiaBulan: p.usiaBulan,
      beratKg: p.beratKg,
      tinggiCm: p.tinggiCm,
      zBbu: p.zBbu,
      zTbu: p.zTbu,
      zBbtb: p.zBbtb,
      statusGizi: p.statusGizi,
    }));

    return NextResponse.json({
      success: true,
      data: {
        anak: {
          id: anak.id,
          nama: anak.nama,
          jenisKelamin: anak.jenisKelamin,
        },
        curveBBU,
        curveTBU,
        childPoints,
      },
    });
  } catch (error) {
    console.error("GET /api/anak/[id]/kurva error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat kurva pertumbuhan WHO." },
      { status: 500 },
    );
  }
}
