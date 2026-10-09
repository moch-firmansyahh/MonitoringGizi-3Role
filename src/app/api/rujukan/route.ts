import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rujukanRepository } from "@/lib/repositories/rujukan.repository";
import { createRujukanSchema } from "@/lib/validation/schemas";
import { notifikasiRepository } from "@/lib/repositories/notifikasi.repository";
import { anakRepository } from "@/lib/repositories/anak.repository";

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
    const status = searchParams.get("status") || "semua";
    const posyanduId =
      user.role === "posyandu"
        ? user.idPosyandu || undefined
        : searchParams.get("posyanduId") || undefined;
    const puskesmasId =
      user.role === "puskesmas"
        ? user.idPuskesmas || undefined
        : undefined;

    const data = await rujukanRepository.getAll({
      posyanduId,
      puskesmasId,
      status,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/rujukan error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar rujukan." },
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
        { success: false, error: "Hanya petugas Posyandu yang berwenang mengajukan rujukan balita." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createRujukanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Input tidak valid",
        },
        { status: 400 },
      );
    }

    const newRujukan = await rujukanRepository.create(
      parsed.data,
      user.id,
      user.idPosyandu || undefined,
    );

    // Kirim notifikasi otomatis ke Puskesmas
    const anak = await anakRepository.getById(parsed.data.idAnak);
    await notifikasiRepository.create({
      idPenerima: "c0000000-0000-0000-0000-000000000002", // Puskesmas
      jenis: "rujukan_baru",
      judul: `Rujukan Baru: ${anak?.nama || "Balita"}`,
      isi: `Rujukan faskes masuk dari Posyandu Melati 03. ${parsed.data.catatan.substring(0, 80)}...`,
      tautan: "/puskesmas/rujukan",
    });

    return NextResponse.json(
      {
        success: true,
        data: newRujukan,
        message: "Rujukan balita berhasil diajukan ke Puskesmas.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/rujukan error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengajukan rujukan." },
      { status: 500 },
    );
  }
}
