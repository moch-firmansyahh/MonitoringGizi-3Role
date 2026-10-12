import { Notifikasi, JenisNotifikasi } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function createInitialNotifSeed(): Notifikasi[] {
  const now = new Date();
  const m15 = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  const h1 = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const h2 = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "n1",
      idPenerima: "c0000000-0000-0000-0000-000000000003", // Orang Tua Arfan
      jenis: "hasil_pengukuran",
      judul: "Hasil Pemeriksaan Muhammad Arfan",
      isi: "Pemeriksaan terbaru telah dicatat (BB: 10.1 kg, TB: 78.5 cm, Status: Stunting). Ananda dianjurkan mengonsumsi gizi berprotein hewani dan mematuhi rujukan faskes.",
      tautan: "/orang-tua/perkembangan",
      dibaca: false,
      createdAt: m15,
    },
    {
      id: "n2",
      idPenerima: "c0000000-0000-0000-0000-000000000003",
      jenis: "jadwal_pengingat",
      judul: "Pengingat Penimbangan Rutin",
      isi: "Jadwal penimbangan balita berkala Posyandu Melati 03 siap diikuti.",
      tautan: "/orang-tua/jadwal",
      dibaca: true,
      createdAt: h2,
    },
    {
      id: "n3",
      idPenerima: "c0000000-0000-0000-0000-000000000002", // Puskesmas
      jenis: "rujukan_baru",
      judul: "Rujukan Masuk Baru: Muhammad Arfan",
      isi: "Rujukan stunting masuk dari Posyandu Melati 03. Silakan tinjau dan tindak lanjuti.",
      tautan: "/puskesmas/rujukan",
      dibaca: false,
      createdAt: h1,
    },
  ];
}

const globalForNotif = globalThis as unknown as {
  __localNotifikasiStore?: Notifikasi[];
  __localNotifikasiStoreVersion?: number;
};

const CURRENT_NOTIF_VERSION = 6;

const getNotifStore = (): Notifikasi[] => {
  if (
    !globalForNotif.__localNotifikasiStore ||
    globalForNotif.__localNotifikasiStore.length === 0 ||
    globalForNotif.__localNotifikasiStoreVersion !== CURRENT_NOTIF_VERSION
  ) {
    globalForNotif.__localNotifikasiStore = createInitialNotifSeed();
    globalForNotif.__localNotifikasiStoreVersion = CURRENT_NOTIF_VERSION;
  }
  return globalForNotif.__localNotifikasiStore;
};

export const notifikasiRepository = {
  async getByUserId(userId: string): Promise<Notifikasi[]> {
    const inMemory = getNotifStore().filter((n) => n.idPenerima === userId);
    const combinedMap = new Map<string, Notifikasi>();

    for (const item of inMemory) {
      combinedMap.set(item.id, item);
    }

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("notifikasi")
          .select("*")
          .eq("id_penerima", userId)
          .order("created_at", { ascending: false });
        if (!error && data) {
          for (const raw of data) {
            let isi = raw.isi;
            let createdAt = raw.created_at;
            // Jika ada teks template lama Agustus 2026, ubah menjadi teks dinamis real-time
            if (isi?.includes("12 Agustus 2026")) {
              isi = isi.replace("pada 12 Agustus 2026", "terkini");
              createdAt = new Date(Date.now() - 15 * 60 * 1000).toISOString();
            }
            if (!combinedMap.has(raw.id)) {
              combinedMap.set(raw.id, {
                id: raw.id,
                idPenerima: raw.id_penerima,
                jenis: raw.jenis,
                judul: raw.judul,
                isi: isi,
                tautan: raw.tautan,
                dibaca: raw.dibaca,
                createdAt: createdAt,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Gagal get notifikasi dari Supabase:", err);
      }
    }

    return Array.from(combinedMap.values()).sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1,
    );
  },

  async markAsRead(id: string): Promise<boolean> {
    const item = getNotifStore().find((n) => n.id === id);
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

  async markAllAsRead(userId: string): Promise<boolean> {
    for (const n of getNotifStore()) {
      if (n.idPenerima === userId) n.dibaca = true;
    }

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("notifikasi")
          .update({ dibaca: true })
          .eq("id_penerima", userId);
      } catch (err) {
        console.warn("Gagal mark all read di Supabase:", err);
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

    getNotifStore().unshift(newNotif);

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("notifikasi").insert({
          id: newNotif.id,
          id_penerima: newNotif.idPenerima,
          jenis: newNotif.jenis,
          judul: newNotif.judul,
          isi: newNotif.isi,
          tautan: newNotif.tautan,
          dibaca: false,
          created_at: newNotif.createdAt,
        });
      } catch {}
    }

    return newNotif;
  },

  async reset(): Promise<void> {
    globalForNotif.__localNotifikasiStore = createInitialNotifSeed();
  },
};
