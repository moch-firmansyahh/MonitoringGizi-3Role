import { Anak, CreateAnakPayload, AnakRecord, Pengukuran } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatZScore, mapDbStatusToDisplay } from "@/lib/constants/nutrition";

import { dataAnak } from "../data-anak";

// In-memory dataset berbasis seluruh 30 data balita resmi
const INITIAL_ANAK_SEED: Anak[] = dataAnak.map((d, idx) => {
  const num = idx + 1;
  const id = `d0000000-0000-0000-0000-${String(num).padStart(12, "0")}`;
  const posyanduId =
    num <= 10
      ? "a0000000-0000-0000-0000-000000000001"
      : num <= 20
      ? "a0000000-0000-0000-0000-000000000002"
      : "a0000000-0000-0000-0000-000000000003";

  const periksaDate = new Date(d.tanggalPeriksa || "2026-08-12");
  periksaDate.setMonth(periksaDate.getMonth() - d.usiaBulan);
  const tglLahir = periksaDate.toISOString().split("T")[0];

  return {
    id,
    nik: d.nik,
    nama: d.nama,
    tanggalLahir: tglLahir,
    jenisKelamin: d.jenisKelamin,
    namaOrangTua: d.namaOrangTua,
    alamat:
      num <= 10
        ? "Jl. Sukabirus No. 14, RT 02/03"
        : num <= 20
        ? "Jl. Sukabirus No. 25, RT 01/03"
        : "Komp. Melati Indah B-10",
    idPosyandu: posyanduId,
    createdAt: `${d.tanggalPeriksa || "2026-08-12"}T08:00:00Z`,
  };
});

const globalForAnak = globalThis as unknown as {
  __localAnakStore?: Anak[];
  __localAnakStoreVersion?: number;
};

const CURRENT_ANAK_STORE_VERSION = 2;

const getAnakStore = (): Anak[] => {
  if (
    !globalForAnak.__localAnakStore ||
    globalForAnak.__localAnakStoreVersion !== CURRENT_ANAK_STORE_VERSION
  ) {
    globalForAnak.__localAnakStore = [...INITIAL_ANAK_SEED];
    globalForAnak.__localAnakStoreVersion = CURRENT_ANAK_STORE_VERSION;
  }
  // Deduplikasi ketat by NIK
  const seenNiks = new Set<string>();
  const uniqueList: Anak[] = [];
  for (const a of globalForAnak.__localAnakStore) {
    if (!seenNiks.has(a.nik)) {
      seenNiks.add(a.nik);
      uniqueList.push(a);
    }
  }
  globalForAnak.__localAnakStore = uniqueList;
  return globalForAnak.__localAnakStore;
};

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

    let result = [...getAnakStore()];
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
    const store = getAnakStore();
    return (
      store.find(
        (a) =>
          a.id === id ||
          a.nik === id ||
          (id.length <= 4 && a.id.endsWith(id.padStart(12, "0"))),
      ) || null
    );
  },

  async getByNik(nik: string): Promise<Anak | null> {
    const store = getAnakStore();
    return store.find((a) => a.nik === nik) || null;
  },

  async create(data: CreateAnakPayload, createdByUserId?: string): Promise<Anak> {
    const store = getAnakStore();
    // 1. Validasi deduplikasi: Jika NIK sudah terdaftar, jangan buat data baru!
    const existing = store.find((a) => a.nik === data.nik);
    if (existing) {
      if (data.nama) existing.nama = data.nama;
      if (data.namaOrangTua) existing.namaOrangTua = data.namaOrangTua;
      if (data.alamat) existing.alamat = data.alamat;
      return existing;
    }

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

    store.unshift(newAnak);
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
    globalForAnak.__localAnakStore = getAnakStore().filter((a) => a.id !== id);
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
