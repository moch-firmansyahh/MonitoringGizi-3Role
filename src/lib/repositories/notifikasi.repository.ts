import { Notifikasi, JenisNotifikasi } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

let localNotifikasiStore: Notifikasi[] = [
  {
    id: "n1",
    idPenerima: "c0000000-0000-0000-0000-000000000003", // Orang Tua Arfan
    jenis: "hasil_pengukuran",
    judul: "Hasil Pemeriksaan Muhammad Arfan",
    isi: "Pemeriksaan terbaru pada 12 Agustus 2026 telah dicatat. Ananda dianjurkan mengonsumsi gizi berprotein tinggi.",
    tautan: "/orang-tua/perkembangan",
    dibaca: false,
    createdAt: "2026-08-12T10:00:00Z",
  },
  {
    id: "n2",
    idPenerima: "c0000000-0000-0000-0000-000000000003",
    jenis: "jadwal_pengingat",
    judul: "Pengingat Penimbangan Rutin",
    isi: "Jadwal penimbangan balita berikutnya di Posyandu Melati 03 pada 12 September 2026.",
    tautan: "/orang-tua/jadwal",
    dibaca: true,
    createdAt: "2026-08-10T08:00:00Z",
  },
  {
    id: "n3",
    idPenerima: "c0000000-0000-0000-0000-000000000002", // Puskesmas
    jenis: "rujukan_baru",
    judul: "Rujukan Masuk Baru: Muhammad Arfan",
    isi: "Rujukan stunting masuk dari Posyandu Melati 03. Silakan tinjau dan tindak lanjuti.",
    tautan: "/puskesmas/rujukan",
    dibaca: false,
    createdAt: "2026-08-12T09:15:00Z",
  },
];

export const notifikasiRepository = {
  async getByUserId(userId: string): Promise<Notifikasi[]> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("notifikasi")
          .select("*")
          .eq("id_penerima", userId)
          .order("created_at", { ascending: false });
        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            idPenerima: item.id_penerima,
            jenis: item.jenis,
            judul: item.judul,
            isi: item.isi,
            tautan: item.tautan,
            dibaca: item.dibaca,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn("Gagal get notifikasi dari Supabase:", err);
      }
    }

    return localNotifikasiStore
      .filter((n) => n.idPenerima === userId)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  },

  async markAsRead(id: string): Promise<boolean> {
    const item = localNotifikasiStore.find((n) => n.id === id);
    if (item) item.dibaca = true;

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("notifikasi").update({ dibaca: true }).eq("id", id);
      } catch (err) {
        console.warn("Gagal update notifikasi di Supabase:", err);
      }
    }
    return true;
  },

  async create(data: {
    idPenerima: string;
    jenis: JenisNotifikasi;
    judul: string;
    isi: string;
    tautan?: string;
  }): Promise<Notifikasi> {
    const newNotif: Notifikasi = {
      id: crypto.randomUUID(),
      idPenerima: data.idPenerima,
      jenis: data.jenis,
      judul: data.judul,
      isi: data.isi,
      tautan: data.tautan || null,
      dibaca: false,
      createdAt: new Date().toISOString(),
    };

    localNotifikasiStore.unshift(newNotif);
    return newNotif;
  },
};
