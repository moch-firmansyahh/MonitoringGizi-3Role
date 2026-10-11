import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rujukanRepository } from "@/lib/repositories/rujukan.repository";
import { updateRujukanStatusSchema } from "@/lib/validation/schemas";
import { notifikasiRepository } from "@/lib/repositories/notifikasi.repository";
import { anakRepository } from "@/lib/repositories/anak.repository";
import { publishBrokerEvent } from "@/lib/broker/rabbitmq";
import { BROKER_ROUTING_KEYS } from "@/lib/broker/events";

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
    const judulNotif =
      status === "ditindaklanjuti"
        ? "Rujukan Ditindaklanjuti Dokter Puskesmas"
        : status === "diterima"
        ? "Rujukan Diterima Dokter Puskesmas"
        : `Status Rujukan Balita: ${status.toUpperCase()}`;

    const isiNotif =
      status === "ditindaklanjuti"
        ? `Pemeriksaan poli KIA Puskesmas Bojongsoang selesai. Resep & Tindakan: ${note || "Diberikan paket PMT pemulihan biskuit protein dan edukasi gizi."}`
        : status === "diterima"
        ? `Rujukan pasien balita telah diterima oleh dokter Puskesmas Bojongsoang. ${note ? `Catatan: ${note}` : ""}`
        : `Puskesmas telah memperbarui status rujukan anak menjadi ${status}. ${note ? `Catatan: ${note}` : ""}`;

    await notifikasiRepository.create({
      idPenerima: "c0000000-0000-0000-0000-000000000003", // Orang Tua Arfan
      jenis: "rujukan_status",
      judul: judulNotif,
      isi: isiNotif,
      tautan: "/orang-tua/notifikasi",
    });

    // Producer: Terbitkan event rujukan.updated ke RabbitMQ Message Broker
    anakRepository
      .getById(updated.idAnak)
      .then((anak) => {
        publishBrokerEvent(
          BROKER_ROUTING_KEYS.RUJUKAN_UPDATED,
          {
            idRujukan: updated.id,
            idAnak: updated.idAnak,
            namaAnak: anak?.nama || "Balita",
            nikAnak: anak?.nik || "",
            idPengukuran: updated.idPengukuran,
            status: updated.status,
            catatan: updated.catatan,
            alasanPenolakan: status === "ditolak" ? note : undefined,
            catatanTindakan: status !== "ditolak" ? note : undefined,
            idPosyandu: updated.idPosyandu,
            idPuskesmas: user.idPuskesmas || "b0000000-0000-0000-0000-000000000001",
            namaPuskesmas: user.namaLengkap,
            diperbaruiOleh: user.namaLengkap,
          },
          "puskesmas",
        ).catch((err) =>
          console.warn("[Message Broker] Publish rujukan update error:", err),
        );
      })
      .catch((err) => console.warn("[Message Broker] Get anak error:", err));

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
