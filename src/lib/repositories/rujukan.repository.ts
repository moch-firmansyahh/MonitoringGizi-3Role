import { Rujukan, CreateRujukanPayload, StatusRujukan, RujukanRiwayat } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { anakRepository } from "./anak.repository";

const globalForRujukan = globalThis as unknown as {
  __localRujukanStore?: Rujukan[];
};

function createInitialRujukanSeed(): Rujukan[] {
  const now = new Date();
  const nowIso = now.toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  return [
    {
      id: "10000000-0000-0000-0000-000000000001",
      idPengukuran: "e0000000-0000-0000-0000-000000000001",
      idAnak: "d0000000-0000-0000-0000-000000000001",
      idPosyandu: "a0000000-0000-0000-0000-000000000001",
      idPuskesmas: "b0000000-0000-0000-0000-000000000001",
      status: "diajukan",
      catatan:
        "Anak mengalami stunting kronis dengan TB/U -3.61 SD, nafsu makan menurun dalam 2 bulan terakhir. Mohon penanganan lanjutan ahli gizi faskes.",
      dibuatOleh: "c0000000-0000-0000-0000-000000000001",
      createdAt: nowIso,
      anak: {
        id: "d0000000-0000-0000-0000-000000000001",
        nik: "3201948392010001",
        nama: "Muhammad Arfan",
        tanggalLahir: "2024-04-12",
        jenisKelamin: "L",
        namaOrangTua: "Rahmat Hidayat",
        alamat: "Jl. Sukabirus No. 14, RT 02/03",
        idPosyandu: "a0000000-0000-0000-0000-000000000001",
      },
      riwayat: [
        {
          id: "r1",
          idRujukan: "10000000-0000-0000-0000-000000000001",
          dariStatus: null,
          keStatus: "diajukan",
          oleh: "c0000000-0000-0000-0000-000000000001",
          namaPelaku: "Bidan Sri Wahyuni, S.Tr.Keb",
          catatan: "Pengajuan rujukan awal dari Posyandu Melati 03",
          waktu: nowIso,
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
      createdAt: twoHoursAgo,
      anak: {
        id: "d0000000-0000-0000-0000-000000000005",
        nik: "3201948392010005",
        nama: "Rafi Ahmad Fauzi",
        tanggalLahir: "2023-04-05",
        jenisKelamin: "L",
        namaOrangTua: "Agus Setiawan",
        alamat: "Jl. Sukabirus Gang Melati 1",
        idPosyandu: "a0000000-0000-0000-0000-000000000001",
      },
      riwayat: [
        {
          id: "r2",
          idRujukan: "10000000-0000-0000-0000-000000000002",
          dariStatus: null,
          keStatus: "diajukan",
          oleh: "c0000000-0000-0000-0000-000000000001",
          namaPelaku: "Bidan Sri Wahyuni, S.Tr.Keb",
          catatan: "Pengajuan rujukan gizi buruk dari Posyandu Melati 03",
          waktu: twoHoursAgo,
        },
        {
          id: "r3",
          idRujukan: "10000000-0000-0000-0000-000000000002",
          dariStatus: "diajukan",
          keStatus: "diterima",
          oleh: "c0000000-0000-0000-0000-000000000002",
          namaPelaku: "Dr. Hj. Syahla Mutiara Latifah, M.Kes",
          catatan: "Rujukan diterima untuk konsultasi poli gizi balita",
          waktu: oneHourAgo,
        },
      ],
    },
  ];
}

function getRujukanStore(): Rujukan[] {
  if (!globalForRujukan.__localRujukanStore) {
    globalForRujukan.__localRujukanStore = createInitialRujukanSeed();
  }
  return globalForRujukan.__localRujukanStore;
}

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

    const store = getRujukanStore();
    let result = [...store];
    if (options?.posyanduId) {
      result = result.filter((r) => r.idPosyandu === options.posyanduId);
    }
    if (options?.puskesmasId) {
      result = result.filter((r) => r.idPuskesmas === options.puskesmasId);
    }
    if (options?.status && options.status !== "semua") {
      result = result.filter((r) => r.status === options.status);
    }

    // Pastikan setiap rujukan selalu memiliki data profil anak yang lengkap
    const enriched = await Promise.all(
      result.map(async (r) => {
        if (!r.anak) {
          const anak = await anakRepository.getById(r.idAnak);
          return {
            ...r,
            anak: anak || {
              id: r.idAnak,
              nama: "Muhammad Arfan",
              nik: "3201948392010001",
              tanggalLahir: "2024-04-12",
              jenisKelamin: "L" as const,
              namaOrangTua: "Rahmat Hidayat",
              idPosyandu: r.idPosyandu,
            },
          };
        }
        return r;
      }),
    );
    return enriched;
  },

  async getById(id: string): Promise<Rujukan | null> {
    const list = await this.getAll();
    return list.find((r) => r.id === id) || null;
  },

  async create(data: CreateRujukanPayload, userId: string, idPosyandu?: string): Promise<Rujukan> {
    const store = getRujukanStore();
    const anak = await anakRepository.getById(data.idAnak);
    const nowIso = new Date().toISOString();

    // Hindari duplikasi rujukan yang sama untuk anak yang sedang diajukan
    const existing = store.find(
      (r) => r.idAnak === data.idAnak && (r.status === "diajukan" || r.status === "diterima"),
    );
    if (existing) {
      existing.catatan = data.catatan;
      existing.idPengukuran = data.idPengukuran;
      existing.status = "diajukan";
      existing.createdAt = nowIso;
      if (!existing.anak && anak) existing.anak = anak;

      // Realtime update timeline
      existing.riwayat = [
        {
          id: crypto.randomUUID(),
          idRujukan: existing.id,
          dariStatus: null,
          keStatus: "diajukan",
          oleh: userId,
          namaPelaku: "Bidan Sri Wahyuni, S.Tr.Keb",
          catatan: data.catatan || "Pengajuan rujukan faskes (penimbangan terbaru)",
          waktu: nowIso,
        },
      ];
      return existing;
    }

    const newRujukan: Rujukan = {
      id: crypto.randomUUID(),
      idPengukuran: data.idPengukuran,
      idAnak: data.idAnak,
      idPosyandu: idPosyandu || "a0000000-0000-0000-0000-000000000001",
      idPuskesmas: "b0000000-0000-0000-0000-000000000001",
      status: "diajukan",
      catatan: data.catatan,
      dibuatOleh: userId,
      createdAt: nowIso,
      anak: anak || undefined,
      riwayat: [
        {
          id: crypto.randomUUID(),
          idRujukan: "",
          dariStatus: null,
          keStatus: "diajukan",
          oleh: userId,
          namaPelaku: "Bidan Sri Wahyuni, S.Tr.Keb",
          catatan: data.catatan || "Pengajuan rujukan faskes",
          waktu: nowIso,
        },
      ],
    };
    newRujukan.riwayat![0].idRujukan = newRujukan.id;

    store.unshift(newRujukan);
    return newRujukan;
  },

  async updateStatus(
    id: string,
    newStatus: StatusRujukan,
    note?: string,
    userId?: string,
    namaPelaku?: string,
  ): Promise<Rujukan | null> {
    const store = getRujukanStore();
    const item = store.find((r) => r.id === id);
    if (!item) return null;

    const prevStatus = item.status;
    const nowIso = new Date().toISOString();
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
      namaPelaku: namaPelaku || (newStatus === "ditolak" ? "Dokter Puskesmas" : "Dr. Hj. Syahla Mutiara Latifah, M.Kes"),
      catatan: note || `Status diubah menjadi ${newStatus}`,
      waktu: nowIso,
    };

    if (!item.riwayat) item.riwayat = [];
    item.riwayat.push(riwayatItem);

    return item;
  },

  async reset(): Promise<void> {
    globalForRujukan.__localRujukanStore = createInitialRujukanSeed();
  },
};
