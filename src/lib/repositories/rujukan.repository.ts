import { Rujukan, CreateRujukanPayload, StatusRujukan, RujukanRiwayat } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

let localRujukanStore: Rujukan[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    idPengukuran: "e0000000-0000-0000-0000-000000000001",
    idAnak: "d0000000-0000-0000-0000-000000000001",
    idPosyandu: "a0000000-0000-0000-0000-000000000001",
    idPuskesmas: "b0000000-0000-0000-0000-000000000001",
    status: "diajukan",
    catatan:
      "Anak mengalami stunting kronis dengan TB/U -3.10 SD, nafsu makan menurun dalam 2 bulan terakhir. Mohon penanganan lanjutan ahli gizi faskes.",
    dibuatOleh: "c0000000-0000-0000-0000-000000000001",
    createdAt: "2026-08-12T09:00:00Z",
    riwayat: [
      {
        id: "r1",
        idRujukan: "10000000-0000-0000-0000-000000000001",
        dariStatus: null,
        keStatus: "diajukan",
        oleh: "c0000000-0000-0000-0000-000000000001",
        namaPelaku: "Bidan Sri Wahyuni, S.Tr.Keb",
        catatan: "Pengajuan rujukan awal dari Posyandu Melati 03",
        waktu: "2026-08-12T09:00:00Z",
      },
    ],
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    idPengukuran: "e0000000-0000-0000-0000-000000000005",
    idAnak: "d0000000-0000-0000-0000-000000000005",
    idPosyandu: "a0000000-0000-0000-0000-000000000001",
    idPuskesmas: "b0000000-0000-0000-0000-000000000001",
    status: "diterima",
    catatan:
      "Indikasi Gizi Buruk Severely Wasted (-3.20 SD). Diterima oleh Puskesmas untuk evaluasi formula F-75/F-100.",
    dibuatOleh: "c0000000-0000-0000-0000-000000000001",
    createdAt: "2026-08-05T09:00:00Z",
    riwayat: [
      {
        id: "r2",
        idRujukan: "10000000-0000-0000-0000-000000000002",
        dariStatus: null,
        keStatus: "diajukan",
        oleh: "c0000000-0000-0000-0000-000000000001",
        namaPelaku: "Bidan Sri Wahyuni, S.Tr.Keb",
        catatan: "Pengajuan rujukan gizi buruk dari Posyandu Melati 03",
        waktu: "2026-08-05T09:00:00Z",
      },
      {
        id: "r3",
        idRujukan: "10000000-0000-0000-0000-000000000002",
        dariStatus: "diajukan",
        keStatus: "diterima",
        oleh: "c0000000-0000-0000-0000-000000000002",
        namaPelaku: "Dr. Hj. Syahla Mutiara Latifah, M.Kes",
        catatan: "Rujukan diterima untuk konsultasi poli gizi balita",
        waktu: "2026-08-05T10:30:00Z",
      },
    ],
  },
];

export const rujukanRepository = {
  async getAll(options?: {
    posyanduId?: string;
    puskesmasId?: string;
    status?: StatusRujukan | string;
  }): Promise<Rujukan[]> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        let q = supabase
          .from("rujukan")
          .select("*, anak(*), pengukuran(*), posyandu(*), puskesmas(*), rujukan_riwayat(*)");

        if (options?.posyanduId) q = q.eq("id_posyandu", options.posyanduId);
        if (options?.puskesmasId) q = q.eq("id_puskesmas", options.puskesmasId);
        if (options?.status && options.status !== "semua") {
          q = q.eq("status", options.status);
        }

        const { data, error } = await q.order("created_at", { ascending: false });
        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            idPengukuran: item.id_pengukuran,
            idAnak: item.id_anak,
            idPosyandu: item.id_posyandu,
            idPuskesmas: item.id_puskesmas,
            status: item.status,
            catatan: item.catatan,
            alasanPenolakan: item.alasan_penolakan,
            catatanTindakan: item.catatan_tindakan,
            dibuatOleh: item.dibuat_oleh,
            diperbaruiOleh: item.diperbarui_oleh,
            anak: item.anak,
            pengukuran: item.pengukuran,
            posyandu: item.posyandu,
            puskesmas: item.puskesmas,
            createdAt: item.created_at,
            riwayat: (item.rujukan_riwayat || []).map((r: any) => ({
              id: r.id,
              idRujukan: r.id_rujukan,
              dariStatus: r.dari_status,
              keStatus: r.ke_status,
              oleh: r.oleh,
              catatan: r.catatan,
              waktu: r.waktu,
            })),
          }));
        }
      } catch (err) {
        console.warn("Gagal getAll rujukan dari Supabase:", err);
      }
    }

    let result = [...localRujukanStore];
    if (options?.posyanduId) {
      result = result.filter((r) => r.idPosyandu === options.posyanduId);
    }
    if (options?.puskesmasId) {
      result = result.filter((r) => r.idPuskesmas === options.puskesmasId);
    }
    if (options?.status && options.status !== "semua") {
      result = result.filter((r) => r.status === options.status);
    }
    return result;
  },

  async create(data: CreateRujukanPayload, userId: string, idPosyandu?: string): Promise<Rujukan> {
    const newRujukan: Rujukan = {
      id: crypto.randomUUID(),
      idPengukuran: data.idPengukuran,
      idAnak: data.idAnak,
      idPosyandu: idPosyandu || "a0000000-0000-0000-0000-000000000001",
      idPuskesmas: "b0000000-0000-0000-0000-000000000001",
      status: "diajukan",
      catatan: data.catatan,
      dibuatOleh: userId,
      createdAt: new Date().toISOString(),
      riwayat: [
        {
          id: crypto.randomUUID(),
          idRujukan: "",
          dariStatus: null,
          keStatus: "diajukan",
          oleh: userId,
          namaPelaku: "Kader Posyandu",
          catatan: "Pengajuan rujukan faskes",
          waktu: new Date().toISOString(),
        },
      ],
    };
    newRujukan.riwayat![0].idRujukan = newRujukan.id;

    localRujukanStore.unshift(newRujukan);
    return newRujukan;
  },

  async updateStatus(
    id: string,
    newStatus: StatusRujukan,
    note?: string,
    userId?: string,
    namaPelaku?: string,
  ): Promise<Rujukan | null> {
    const item = localRujukanStore.find((r) => r.id === id);
    if (!item) return null;

    const prevStatus = item.status;
    item.status = newStatus;
    item.diperbaruiOleh = userId || null;
    if (note) {
      if (newStatus === "ditolak") item.alasanPenolakan = note;
      else item.catatanTindakan = note;
    }

    const riwayatItem: RujukanRiwayat = {
      id: crypto.randomUUID(),
      idRujukan: id,
      dariStatus: prevStatus,
      keStatus: newStatus,
      oleh: userId || null,
      namaPelaku: namaPelaku || "Petugas Faskes",
      catatan: note || `Status diubah menjadi ${newStatus}`,
      waktu: new Date().toISOString(),
    };

    if (!item.riwayat) item.riwayat = [];
    item.riwayat.push(riwayatItem);

    return item;
  },
};
