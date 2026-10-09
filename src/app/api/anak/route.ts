import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { anakRepository } from "@/lib/repositories/anak.repository";
import { createAnakSchema } from "@/lib/validation/schemas";
import { maskNIK } from "@/lib/constants/nutrition";

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
    const search = searchParams.get("search") || undefined;
    const posyanduId =
      user.role === "posyandu"
        ? user.idPosyandu || undefined
        : searchParams.get("posyanduId") || undefined;

    const data = await anakRepository.getAll({ posyanduId, search });

    // Jika role orang_tua, masking NIK
    const sanitized = data.map((item) => ({
      ...item,
      nik: user.role === "orang_tua" ? maskNIK(item.nik) : item.nik,
    }));

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    console.error("GET /api/anak error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data balita." },
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
        { success: false, error: "Hanya petugas Posyandu yang berwenang menambah data anak." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createAnakSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Input tidak valid",
        },
        { status: 400 },
      );
    }

    const newAnak = await anakRepository.create(
      {
        ...parsed.data,
        idPosyandu: user.idPosyandu || parsed.data.idPosyandu,
      },
      user.id,
    );

    return NextResponse.json(
      {
        success: true,
        data: newAnak,
        message: "Data anak berhasil ditambahkan.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/anak error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan data anak." },
      { status: 500 },
    );
  }
}
