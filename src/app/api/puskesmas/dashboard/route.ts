import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { puskesmasRepository } from "@/lib/repositories/puskesmas.repository";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Sesi tidak valid." },
        { status: 401 },
      );
    }

    if (user.role !== "puskesmas") {
      return NextResponse.json(
        { success: false, error: "Hanya petugas Puskesmas yang berwenang mengakses data ini." },
        { status: 403 },
      );
    }

    const data = await puskesmasRepository.getDashboardSummary(
      user.idPuskesmas || undefined,
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/puskesmas/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat ringkasan data wilayah Puskesmas." },
      { status: 500 },
    );
  }
}
