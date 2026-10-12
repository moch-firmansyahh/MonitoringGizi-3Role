import { NextResponse } from "next/server";
import { dataAnak } from "@/lib/data-anak";
import { auditRepository } from "@/lib/repositories/audit.repository";
import { rujukanRepository } from "@/lib/repositories/rujukan.repository";

export async function GET() {
  try {
    // 1. Reset Store In-Memory Global
    const globalAny = globalThis as any;
    if (globalAny.__localAnakStore) {
      delete globalAny.__localAnakStore;
    }
    if (globalAny.__localPengukuranStore) {
      delete globalAny.__localPengukuranStore;
    }
    if (globalAny.__localRujukanStore) {
      delete globalAny.__localRujukanStore;
    }

    // 2. Reset Repositories
    await auditRepository.reset();
    await rujukanRepository.reset();

    return NextResponse.json({
      success: true,
      message: "Data master pengujian berhasil di-reset ke kondisi awal baku (30 balita, 15 orang tua, 3 posyandu).",
      totalBalita: dataAnak.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mereset data: " + String(error) },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
