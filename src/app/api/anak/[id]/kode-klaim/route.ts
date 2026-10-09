import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

// In-memory store untuk kode klaim
export const localKodeKlaimStore = new Map<
  string,
  { idAnak: string; kode: string; expiresAt: number; used: boolean }
>();

export async function POST(
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

    if (user.role !== "posyandu") {
      return NextResponse.json(
        { success: false, error: "Hanya kader Posyandu yang berwenang membuat kode klaim." },
        { status: 403 },
      );
    }

    const { id } = await params;
    // Buat kode klaim acak 8 karakter huruf & angka
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let kode = "";
    for (let i = 0; i < 8; i++) {
      kode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 hari
    localKodeKlaimStore.set(kode, {
      idAnak: id,
      kode,
      expiresAt,
      used: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        idAnak: id,
        kode,
        kedaluwarsaPada: new Date(expiresAt).toISOString(),
      },
      message: "Kode klaim anak berhasil dibuat. Berlaku selama 7 hari.",
    });
  } catch (error) {
    console.error("POST /api/anak/[id]/kode-klaim error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat kode klaim anak." },
      { status: 500 },
    );
  }
}
