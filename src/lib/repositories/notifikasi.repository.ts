import { Notifikasi, JenisNotifikasi } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";



function createInitialNotifSeed(): Notifikasi[] {
  const now = new Date();
  const nowIso = now.toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "n1",
      idPenerima: "c0000000-0000-0000-0000-000000000003", // Orang Tua Arfan
      jenis: "hasil_pengukuran",
      judul: "Hasil Pemeriksaan Muhammad Arfan",
      isi: "Pemeriksaan terbaru telah dicatat. Ananda dianjurkan mengonsumsi gizi berprotein hewani.",
      tautan: "/orang-tua/perkembangan",
      dibaca: false,
      createdAt: nowIso,
    },
    {
      id: "n2",
      idPenerima: "c0000000-0000-0000-0000-000000000003",
      jenis: "jadwal_pengingat",
      judul: "Pengingat Penimbangan Rutin",
      isi: "Jadwal penimbangan balita berkala Posyandu Melati 03 siap diikuti.",
      tautan: "/orang-tua/jadwal",
      dibaca: true,
      createdAt: twoHoursAgo,
    },
    {
      id: "n3",
      idPenerima: "c0000000-0000-0000-0000-000000000002", // Puskesmas
      jenis: "rujukan_baru",
      judul: "Rujukan Masuk Baru: Muhammad Arfan",
      isi: "Rujukan stunting masuk dari Posyandu Melati 03. Silakan tinjau dan tindak lanjuti.",
      tautan: "/puskesmas/rujukan",
      dibaca: false,
      createdAt: oneHourAgo,
    },
  ];
}

const globalForNotif = globalThis as unknown as {
  __localNotifikasiStore?: Notifikasi[];
  __localNotifikasiStoreVersion?: number;
};

const CURRENT_NOTIF_VERSION = 4;

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
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("notifikasi")
          .select("*")
          .eq("id_penerima", userId)
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
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

    return getNotifStore()
      .filter((n) => n.idPenerima === userId)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
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
    return newNotif;
  },
};
