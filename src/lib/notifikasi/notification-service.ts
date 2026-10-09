import { JenisNotifikasi, Notifikasi } from "@/types";
import { notifikasiRepository } from "@/lib/repositories/notifikasi.repository";

export interface SendNotificationPayload {
  idPenerima: string;
  jenis: JenisNotifikasi;
  judul: string;
  isi: string;
  tautan?: string;
}

/**
 * Service pembuat notifikasi terpusat di server
 */
export const notificationService = {
  async dispatch(payload: SendNotificationPayload): Promise<Notifikasi> {
    return await notifikasiRepository.create({
      idPenerima: payload.idPenerima,
      jenis: payload.jenis,
      judul: payload.judul,
      isi: payload.isi,
      tautan: payload.tautan,
    });
  },

  async notifyHasilPengukuran(
    idOrangTua: string,
    namaAnak: string,
    statusGizi: string,
    tanggal: string,
  ): Promise<Notifikasi> {
    return this.dispatch({
      idPenerima: idOrangTua,
      jenis: "hasil_pengukuran",
      judul: `Hasil Penimbangan: ${namaAnak}`,
      isi: `Pemeriksaan ${namaAnak} pada ${tanggal} telah dicatat dengan status ${statusGizi}. Buka untuk melihat grafik pertumbuhan.`,
      tautan: "/orang-tua/perkembangan",
    });
  },

  async notifyRujukanBaru(
    idPuskesmasProfile: string,
    namaAnak: string,
    namaPosyandu: string,
    alasan: string,
  ): Promise<Notifikasi> {
    return this.dispatch({
      idPenerima: idPuskesmasProfile,
      jenis: "rujukan_baru",
      judul: `Rujukan Masuk Baru dari ${namaPosyandu}`,
      isi: `Balita ${namaAnak} dirujuk ke faskes: ${alasan.substring(0, 100)}...`,
      tautan: "/puskesmas/rujukan",
    });
  },

  async notifyStatusRujukan(
    idOrangTua: string,
    namaAnak: string,
    statusBaru: string,
    catatan?: string,
  ): Promise<Notifikasi> {
    return this.dispatch({
      idPenerima: idOrangTua,
      jenis: "rujukan_status",
      judul: `Update Status Rujukan: ${namaAnak}`,
      isi: `Rujukan ${namaAnak} telah diperbarui statusnya menjadi ${statusBaru.toUpperCase()}.${
        catatan ? ` Catatan faskes: ${catatan}` : ""
      }`,
      tautan: "/orang-tua/notifikasi",
    });
  },
};
