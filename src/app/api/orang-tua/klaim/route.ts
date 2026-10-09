import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { klaimAnakSchema } from "@/lib/validation/schemas";
import { anakRepository } from "@/lib/repositories/anak.repository";
import { localKodeKlaimStore } from "../../anak/[id]/kode-klaim/route";

// In-memory relasi anak-orangtua
export const localAnakOrangTuaStore = new Map<string, string[]>([
  ["c0000000-0000-0000-0000-000000000003", ["d0000000-0000-0000-0000-000000000001"]],
]);

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Sesi tidak valid." },
        { status: 401 },
      );
    }

    if (user.role !== "orang_tua") {
      return NextResponse.json(
        { success: false, error: "Hanya akun Orang Tua yang dapat menautkan profil anak." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = klaimAnakSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Input tidak valid",
        },
        { status: 400 },
      );
    }

    const cleanCode = parsed.data.kodeKlaim.trim().toUpperCase();
    const claim = localKodeKlaimStore.get(cleanCode);

    // Verifikasi kode klaim (termasuk demo code bypass untuk testing: KLAIM123)
    let idAnakToClaim = claim?.idAnak;

    if (!idAnakToClaim) {
      if (cleanCode === "KLAIM123") {
        idAnakToClaim = "d0000000-0000-0000-0000-000000000002"; // Aisyah Putri Humaira
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Kode klaim tidak valid atau sudah kedaluwarsa.",
          },
          { status: 404 },
        );
      }
    }

    // Verifikasi tanggal lahir anak
    const anak = await anakRepository.getById(idAnakToClaim);
    if (!anak) {
      return NextResponse.json(
        { success: false, error: "Data balita tidak ditemukan." },
        { status: 404 },
      );
    }

    if (anak.tanggalLahir !== parsed.data.tanggalLahir) {
      return NextResponse.json(
        {
          success: false,
          error: "Tanggal lahir balita tidak sesuai dengan rekam medis faskes.",
        },
        { status: 400 },
      );
    }

    // Tautkan anak ke akun orang tua
    const existingChildren = localAnakOrangTuaStore.get(user.id) || [];
    if (!existingChildren.includes(anak.id)) {
      existingChildren.push(anak.id);
      localAnakOrangTuaStore.set(user.id, existingChildren);
    }

    if (claim) {
      claim.used = true;
    }

    return NextResponse.json({
      success: true,
      data: anak,
      message: `Berhasil menautkan ananda ${anak.nama} ke akun Anda.`,
    });
  } catch (error) {
    console.error("POST /api/orang-tua/klaim error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses klaim penautan anak." },
      { status: 500 },
    );
  }
}
