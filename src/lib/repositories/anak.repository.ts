import { Anak, CreateAnakPayload, AnakRecord, Pengukuran } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatZScore, mapDbStatusToDisplay } from "@/lib/constants/nutrition";

// In-memory fallback dataset berbasis seed data resmi
let localAnakStore: Anak[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    nik: "3201948392010001",
    nama: "Muhammad Arfan",
    tanggalLahir: "2024-04-12",
    jenisKelamin: "L",
    namaOrangTua: "Rahmat Hidayat",
    alamat: "Jl. Sukabirus No. 14, RT 02/03",
    idPosyandu: "a0000000-0000-0000-0000-000000000001",
    createdAt: "2026-08-12T08:00:00Z",
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    nik: "3201948392010002",
    nama: "Aisyah Putri Humaira",
    tanggalLahir: "2025-06-11",
    jenisKelamin: "P",
    namaOrangTua: "Hendra Wijaya",
    alamat: "Jl. Sukabirus No. 25, RT 01/03",
    idPosyandu: "a0000000-0000-0000-0000-000000000001",
    createdAt: "2026-08-11T09:00:00Z",
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    nik: "3201948392010003",
    nama: "Kenzo Rafasya",
    tanggalLahir: "2023-12-10",
    jenisKelamin: "L",
    namaOrangTua: "Ferry Irawan",
    alamat: "Komp. Melati Indah B-10",
    idPosyandu: "a0000000-0000-0000-0000-000000000001",
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    nik: "3201948392010004",
    nama: "Zahra Bilqis",
    tanggalLahir: "2024-08-08",
    jenisKelamin: "P",
    namaOrangTua: "Dedi Supardi",
    alamat: "Jl. Bojongsoang Kulon No. 8",
    idPosyandu: "a0000000-0000-0000-0000-000000000001",
    createdAt: "2026-08-08T08:30:00Z",
  },
  {
    id: "d0000000-0000-0000-0000-000000000005",
    nik: "3201948392010005",
    nama: "Rafi Ahmad Fauzi",
    tanggalLahir: "2023-04-05",
    jenisKelamin: "L",
    namaOrangTua: "Agus Setiawan",
    alamat: "Jl. Sukabirus Gang Melati 1",
    idPosyandu: "a0000000-0000-0000-0000-000000000001",
    createdAt: "2026-08-05T07:45:00Z",
  },
];

export const anakRepository = {
  async getAll(options?: { posyanduId?: string; search?: string }): Promise<Anak[]> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from("anak").select("*, posyandu(*)").is("deleted_at", null);
        if (options?.posyanduId) {
          query = query.eq("id_posyandu", options.posyanduId);
        }
        if (options?.search) {
          query = query.or(`nama.ilike.%${options.search}%,nik.ilike.%${options.search}%`);
        }
        const { data, error } = await query.order("created_at", { ascending: false });
        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            nik: item.nik,
            nama: item.nama,
            tanggalLahir: item.tanggal_lahir,
            jenisKelamin: item.jenis_kelamin,
            namaOrangTua: item.nama_orang_tua,
            alamat: item.alamat,
            idPosyandu: item.id_posyandu,
            dibuatOleh: item.dibuat_oleh,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
        }
      } catch (err) {
        console.warn("Gagal membaca anak dari Supabase, menggunakan store lokal:", err);
      }
    }

    let result = [...localAnakStore];
    if (options?.posyanduId) {
      result = result.filter((a) => a.idPosyandu === options.posyanduId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (a) => a.nama.toLowerCase().includes(q) || a.nik.includes(q),
      );
    }
    return result;
  },

  async getById(id: string): Promise<Anak | null> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("anak")
          .select("*, posyandu(*)")
          .eq("id", id)
          .is("deleted_at", null)
          .single();
        if (!error && data) {
          return {
            id: data.id,
            nik: data.nik,
            nama: data.nama,
            tanggalLahir: data.tanggal_lahir,
            jenisKelamin: data.jenis_kelamin,
            namaOrangTua: data.nama_orang_tua,
            alamat: data.alamat,
            idPosyandu: data.id_posyandu,
            dibuatOleh: data.dibuat_oleh,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn("Gagal getById dari Supabase:", err);
      }
    }
    return localAnakStore.find((a) => a.id === id) || null;
  },

  async create(data: CreateAnakPayload, createdByUserId?: string): Promise<Anak> {
    const newAnak: Anak = {
      id: crypto.randomUUID(),
      nik: data.nik,
      nama: data.nama,
      tanggalLahir: data.tanggalLahir,
      jenisKelamin: data.jenisKelamin,
      namaOrangTua: data.namaOrangTua,
      alamat: data.alamat || null,
      idPosyandu: data.idPosyandu || "a0000000-0000-0000-0000-000000000001",
      dibuatOleh: createdByUserId || null,
      createdAt: new Date().toISOString(),
    };

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("anak").insert({
          id: newAnak.id,
          nik: newAnak.nik,
          nama: newAnak.nama,
          tanggal_lahir: newAnak.tanggalLahir,
          jenis_kelamin: newAnak.jenisKelamin,
          nama_orang_tua: newAnak.namaOrangTua,
          alamat: newAnak.alamat,
          id_posyandu: newAnak.idPosyandu,
          dibuat_oleh: newAnak.dibuatOleh,
        });
        if (error) console.error("Error insert anak ke Supabase:", error);
      } catch (err) {
        console.warn("Gagal insert anak ke Supabase:", err);
      }
    }

    localAnakStore.unshift(newAnak);
    return newAnak;
  },

  async delete(id: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("anak")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);
      } catch (err) {
        console.warn("Gagal soft delete anak di Supabase:", err);
      }
    }
    localAnakStore = localAnakStore.filter((a) => a.id !== id);
    return true;
  },

  /**
   * Adapter pengubah entitas domain Anak + Pengukuran menjadi AnakRecord
   * yang kompatibel dengan UI Posyandu yang sudah ada.
   */
  toAnakRecord(anak: Anak, p?: Pengukuran | null): AnakRecord {
    return {
      id: anak.id,
      nama: anak.nama,
      nik: anak.nik,
      usiaBulan: p?.usiaBulan ?? 0,
      jenisKelamin: anak.jenisKelamin,
      namaOrangTua: anak.namaOrangTua,
      beratBadan: p?.beratKg ?? 0,
      tinggiBadan: p?.tinggiCm ?? 0,
      zScoreTBU: formatZScore(p?.zTbu),
      zScoreBBU: formatZScore(p?.zBbu),
      zScoreBBTB: formatZScore(p?.zBbtb),
      statusGizi: mapDbStatusToDisplay(p?.statusGizi || "normal"),
      rekomendasiAI: p?.rekomendasi || "Belum ada catatan rekomendasi pemeriksaan.",
      rekomendasiAwam: p?.rekomendasiAwam || undefined,
      tanggalPeriksa: p?.tanggalPeriksa || new Date().toISOString().split("T")[0],
      idPengukuran: p?.id,
    };
  },
};
