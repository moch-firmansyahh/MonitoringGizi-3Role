import {
  Pengukuran,
  CreatePengukuranPayload,
  StatusGizi,
  TingkatRisiko,
} from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadReference, nilaiGiziAnak } from "@/lib/zscore";
import { anakRepository } from "./anak.repository";

import { dataAnak } from "../data-anak";

// In-memory dataset berbasis 30 data pengukuran balita resmi (singleton di globalThis)
const INITIAL_PENGUKURAN_SEED: Pengukuran[] = dataAnak.map((d, idx) => {
  const num = idx + 1;
  const idAnak = `d0000000-0000-0000-0000-${String(num).padStart(12, "0")}`;
  const idPengukuran = `e0000000-0000-0000-0000-${String(num).padStart(12, "0")}`;
  const clientUuid = `f0000000-0000-0000-0000-${String(num).padStart(12, "0")}`;

  const parseNum = (v?: string | number) => {
    if (typeof v === "number") return v;
    if (!v) return 0;
    const m = String(v).match(/[-+]?[0-9]*\.?[0-9]+/);
    return m ? parseFloat(m[0]) : 0;
  };

  const statusGizi: StatusGizi =
    d.statusGizi === "Stunting"
      ? "stunting"
      : d.statusGizi === "Gizi Buruk"
        ? "gizi_buruk"
        : d.statusGizi === "Gizi Kurang"
          ? "gizi_kurang"
          : "normal";

  const tingkatRisiko: TingkatRisiko =
    statusGizi === "stunting" || statusGizi === "gizi_buruk"
      ? "tinggi"
      : statusGizi === "gizi_kurang"
        ? "sedang"
        : "rendah";

  return {
    id: idPengukuran,
    clientUuid,
    idAnak,
    tanggalPeriksa: d.tanggalPeriksa || "2026-08-12",
    usiaBulan: d.usiaBulan,
    beratKg: d.beratBadan,
    tinggiCm: d.tinggiBadan,
    posisiUkur: d.usiaBulan < 24 ? "telentang" : "berdiri",
    zBbu: parseNum(d.zScoreBBU),
    zTbu: parseNum(d.zScoreTBU),
    zBbtb: parseNum(d.zScoreBBTB),
    statusGizi,
    tingkatRisiko,
    rekomendasi: d.rekomendasiAI,
    rekomendasiAwam:
      statusGizi === "stunting"
        ? `Tinggi badan ananda ${d.nama} saat ini berada di bawah kurva acuan WHO. Diperlukan evaluasi asupan protein hewani dan pemantauan Faskes.`
        : statusGizi === "gizi_buruk"
          ? `Perhatian medis intensif diperlukan untuk ananda ${d.nama}. Mohon segera bawa rujukan ini ke Puskesmas.`
          : statusGizi === "gizi_kurang"
            ? `Ananda ${d.nama} membutuhkan tambahan asupan makanan berkalori tinggi dan pemantauan berat badan bulanan.`
            : `Pertumbuhan ananda ${d.nama} sehat dan berada dalam kurva normal standar WHO. Pertahankan pola makan bergizi seimbang.`,
    sumberRekomendasi: "lokal",
    createdAt: `${d.tanggalPeriksa || "2026-08-12"}T08:00:00Z`,
  };
});

const globalForPengukuran = globalThis as unknown as {
  __localPengukuranStore?: Pengukuran[];
};

if (!globalForPengukuran.__localPengukuranStore || globalForPengukuran.__localPengukuranStore.length < 10) {
  globalForPengukuran.__localPengukuranStore = [...INITIAL_PENGUKURAN_SEED];
}

const getStore = (): Pengukuran[] => {
  if (!globalForPengukuran.__localPengukuranStore || globalForPengukuran.__localPengukuranStore.length < 10) {
    globalForPengukuran.__localPengukuranStore = [...INITIAL_PENGUKURAN_SEED];
  }
  return globalForPengukuran.__localPengukuranStore;
};

export const pengukuranRepository = {
  async getByAnakId(idAnak: string): Promise<Pengukuran[]> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("pengukuran")
          .select("*")
          .eq("id_anak", idAnak)
          .is("deleted_at", null)
          .order("tanggal_periksa", { ascending: false });

        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            clientUuid: item.client_uuid,
            idAnak: item.id_anak,
            tanggalPeriksa: item.tanggal_periksa,
            usiaBulan: item.usia_bulan,
            beratKg: Number(item.berat_kg),
            tinggiCm: Number(item.tinggi_cm),
            posisiUkur: item.posisi_ukur,
            zBbu: Number(item.z_bbu),
            zTbu: Number(item.z_tbu),
            zBbtb: Number(item.z_bbtb),
            statusGizi: item.status_gizi,
            tingkatRisiko: item.tingkat_risiko,
            rekomendasi: item.rekomendasi,
            rekomendasiAwam: item.rekomendasi_awam,
            sumberRekomendasi: item.sumber_rekomendasi,
            dibuatOleh: item.dibuat_oleh,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn("Gagal getByAnakId dari Supabase:", err);
      }
    }

    const matchingIds = new Set<string>([idAnak]);
    const anak = await anakRepository.getById(idAnak);
    if (anak) {
      matchingIds.add(anak.id);
      matchingIds.add(anak.nik);
    }

    return getStore()
      .filter((p) => matchingIds.has(p.idAnak))
      .sort((a, b) => (a.tanggalPeriksa > b.tanggalPeriksa ? -1 : 1));
  },

  async getLatestByAnakId(idAnak: string): Promise<Pengukuran | null> {
    const list = await this.getByAnakId(idAnak);
    return list.length > 0 ? list[0] : null;
  },

  async getAll(): Promise<Pengukuran[]> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("pengukuran")
          .select("*, anak(*)")
          .is("deleted_at", null)
          .order("tanggal_periksa", { ascending: false });

        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            clientUuid: item.client_uuid,
            idAnak: item.id_anak,
            tanggalPeriksa: item.tanggal_periksa,
            usiaBulan: item.usia_bulan,
            beratKg: Number(item.berat_kg),
            tinggiCm: Number(item.tinggi_cm),
            posisiUkur: item.posisi_ukur,
            zBbu: Number(item.z_bbu),
            zTbu: Number(item.z_tbu),
            zBbtb: Number(item.z_bbtb),
            statusGizi: item.status_gizi,
            tingkatRisiko: item.tingkat_risiko,
            rekomendasi: item.rekomendasi,
            rekomendasiAwam: item.rekomendasi_awam,
            sumberRekomendasi: item.sumber_rekomendasi,
            dibuatOleh: item.dibuat_oleh,
            anak: item.anak,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn("Gagal getAll pengukuran dari Supabase:", err);
      }
    }

    return [...getStore()];
  },

  /**
   * Menghitung ulang Z-Score secara otoritatif di server lalu menyimpan data pengukuran.
   * Idempotent berdasarkan client_uuid.
   */
  async create(
    payload: CreatePengukuranPayload,
    createdByUserId?: string,
  ): Promise<Pengukuran> {
    const clientUuid = payload.clientUuid || crypto.randomUUID();

    // Normalisasi ID anak jika merujuk ke Arfan / Aisyah
    let normalizedIdAnak = payload.idAnak;
    if (
      normalizedIdAnak === "1" ||
      normalizedIdAnak === "3201948392010001" ||
      normalizedIdAnak.toLowerCase().includes("arfan")
    ) {
      normalizedIdAnak = "d0000000-0000-0000-0000-000000000001";
    } else if (
      normalizedIdAnak === "2" ||
      normalizedIdAnak === "3201948392010002" ||
      normalizedIdAnak.toLowerCase().includes("aisyah")
    ) {
      normalizedIdAnak = "d0000000-0000-0000-0000-000000000002";
    }

    const store = getStore();

    // Cek idempotensi: jika client_uuid sudah ada, return record yang ada
    const existing = store.find((p) => p.clientUuid === clientUuid);
    if (existing) {
      return existing;
    }

    // Ambil data anak untuk jenis kelamin
    const anak = await anakRepository.getById(normalizedIdAnak);
    const jkDomain = anak?.jenisKelamin === "P" ? "perempuan" : "laki-laki";
    const ref = loadReference();
    const calculated = nilaiGiziAnak(
      ref,
      payload.usiaBulan,
      jkDomain,
      payload.beratKg,
      payload.tinggiCm,
    );

    const pos =
      payload.posisiUkur || (payload.usiaBulan < 24 ? "telentang" : "berdiri");
    const idxTb = pos === "telentang" ? "PB/U" : "TB/U";
    const idxBbTb = pos === "telentang" ? "BB/PB" : "BB/TB";

    const zBbu = calculated["BB/U"].z_score;
    const zTbu = calculated[idxTb].z_score;
    const zBbtb = calculated[idxBbTb].z_score;

    // Prioritas Status Gizi (LOCKED)
    let statusGizi: StatusGizi = "normal";
    const stTbu = calculated[idxTb].status.toLowerCase();
    const stBbtb = calculated[idxBbTb].status.toLowerCase();
    const stBbu = calculated["BB/U"].status.toLowerCase();

    if (stTbu.includes("stunted")) {
      statusGizi = "stunting";
    } else if (stBbtb.includes("gizi buruk") || stBbtb.includes("severely wasted")) {
      statusGizi = "gizi_buruk";
    } else if (stBbtb.includes("gizi kurang") || stBbtb.includes("wasted")) {
      statusGizi = "gizi_kurang";
    } else if (stBbu.includes("kurang") || stBbu.includes("underweight")) {
      statusGizi = "gizi_kurang";
    }

    let tingkatRisiko: TingkatRisiko = "rendah";
    if (statusGizi === "stunting" || statusGizi === "gizi_buruk") {
      tingkatRisiko = "tinggi";
    } else if (statusGizi === "gizi_kurang") {
      tingkatRisiko = "sedang";
    }

    const defaultRekomendasi =
      payload.rekomendasi ||
      `[ANALISIS MEDIS KEMENKES RI & WHO] Pasien ${anak?.nama || "Balita"} (${payload.usiaBulan} Bulan) berstatus ${statusGizi.toUpperCase()} dengan Z-Score BB/TB ${zBbtb.toFixed(2)} SD.`;

    const defaultAwam =
      payload.rekomendasiAwam ||
      (statusGizi === "stunting"
        ? "Pertumbuhan tinggi badan ananda berada di bawah acuan standar usia. Konsultasikan ke Puskesmas untuk evaluasi lebih lanjut."
        : statusGizi === "normal"
        ? "Pertumbuhan ananda sehat dan berada dalam batas normal acuan standar WHO. Pertahankan pola makan bergizi seimbang."
        : "Berat badan ananda berada di bawah standar. Perlu tambahan asupan gizi berkalori dan berprotein tinggi.");

    const newPengukuran: Pengukuran = {
      id: crypto.randomUUID(),
      clientUuid,
      idAnak: normalizedIdAnak,
      tanggalPeriksa: payload.tanggalPeriksa,
      usiaBulan: payload.usiaBulan,
      beratKg: payload.beratKg,
      tinggiCm: payload.tinggiCm,
      posisiUkur: pos,
      zBbu,
      zTbu,
      zBbtb,
      statusGizi,
      tingkatRisiko,
      rekomendasi: defaultRekomendasi,
      rekomendasiAwam: defaultAwam,
      sumberRekomendasi: payload.sumberRekomendasi || "lokal",
      dibuatOleh: createdByUserId || null,
      anak: anak || undefined,
      createdAt: new Date().toISOString(),
    };

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("pengukuran").insert({
          id: newPengukuran.id,
          client_uuid: newPengukuran.clientUuid,
          id_anak: newPengukuran.idAnak,
          tanggal_periksa: newPengukuran.tanggalPeriksa,
          usia_bulan: newPengukuran.usiaBulan,
          berat_kg: newPengukuran.beratKg,
          tinggi_cm: newPengukuran.tinggiCm,
          posisi_ukur: newPengukuran.posisiUkur,
          z_bbu: newPengukuran.zBbu,
          z_tbu: newPengukuran.zTbu,
          z_bbtb: newPengukuran.zBbtb,
          status_gizi: newPengukuran.statusGizi,
          tingkat_risiko: newPengukuran.tingkatRisiko,
          rekomendasi: newPengukuran.rekomendasi,
          rekomendasi_awam: newPengukuran.rekomendasiAwam,
          sumber_rekomendasi: newPengukuran.sumberRekomendasi,
          dibuat_oleh: newPengukuran.dibuatOleh,
        });
        if (error) console.error("Error insert pengukuran ke Supabase:", error);
      } catch (err) {
        console.warn("Gagal insert pengukuran ke Supabase:", err);
      }
    }

    store.unshift(newPengukuran);
    return newPengukuran;
  },
};
