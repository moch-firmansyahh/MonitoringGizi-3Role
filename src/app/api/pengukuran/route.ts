import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { pengukuranRepository } from "@/lib/repositories/pengukuran.repository";
import { createPengukuranSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Sesi tidak valid." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const idAnak = searchParams.get("idAnak");

    let data;
    if (idAnak) {
      data = await pengukuranRepository.getByAnakId(idAnak);
    } else {
      data = await pengukuranRepository.getAll();
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/pengukuran error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil riwayat pengukuran." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Sesi tidak valid." },
        { status: 401 },
      );
    }

    if (user.role !== "posyandu") {
      return NextResponse.json(
        { success: false, error: "Hanya petugas Posyandu yang berwenang mencatat hasil pengukuran." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createPengukuranSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Input tidak valid",
        },
        { status: 400 },
      );
    }

    const result = await pengukuranRepository.create(parsed.data, user.id);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "Hasil pengukuran balita berhasil dianalisis & disimpan.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/pengukuran error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan data pengukuran." },
      { status: 500 },
    );
  }
}
