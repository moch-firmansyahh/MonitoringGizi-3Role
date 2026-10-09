import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rujukanRepository } from "@/lib/repositories/rujukan.repository";
import { updateRujukanStatusSchema } from "@/lib/validation/schemas";
import { notifikasiRepository } from "@/lib/repositories/notifikasi.repository";

export async function PATCH(
  request: NextRequest,
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

    if (user.role !== "puskesmas") {
      return NextResponse.json(
        { success: false, error: "Hanya petugas Puskesmas yang berwenang menindaklanjuti status rujukan." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateRujukanStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Input tidak valid",
        },
        { status: 400 },
      );
    }

    const { status, catatan, alasanPenolakan, catatanTindakan } = parsed.data;

    if (status === "ditolak" && !alasanPenolakan?.trim()) {
      return NextResponse.json(
        { success: false, error: "Alasan penolakan rujukan wajib diisi." },
        { status: 400 },
      );
    }

    const note =
      status === "ditolak"
        ? alasanPenolakan
        : catatanTindakan || catatan || undefined;

    const updated = await rujukanRepository.updateStatus(
      id,
      status,
      note,
      user.id,
      user.namaLengkap,
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Data rujukan tidak ditemukan." },
        { status: 404 },
      );
    }

    // Buat notifikasi riwayat status untuk Orang Tua & Posyandu
    await notifikasiRepository.create({
      idPenerima: "c0000000-0000-0000-0000-000000000003", // Orang Tua
      jenis: "rujukan_status",
      judul: `Status Rujukan Balita: ${status.toUpperCase()}`,
      isi: `Puskesmas telah memperbarui status rujukan anak menjadi ${status}. ${note ? `Catatan: ${note}` : ""}`,
      tautan: "/orang-tua/notifikasi",
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status rujukan berhasil diperbarui menjadi ${status}.`,
    });
  } catch (error) {
    console.error("PATCH /api/rujukan/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status rujukan." },
      { status: 500 },
    );
  }
}
