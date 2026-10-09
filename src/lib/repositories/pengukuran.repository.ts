import {
  Pengukuran,
  CreatePengukuranPayload,
  StatusGizi,
  TingkatRisiko,
} from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadReference, nilaiGiziAnak } from "@/lib/zscore";
import { anakRepository } from "./anak.repository";

// In-memory dataset berbasis seed awal
let localPengukuranStore: Pengukuran[] = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    clientUuid: "f0000000-0000-0000-0000-000000000001",
    idAnak: "d0000000-0000-0000-0000-000000000001",
    tanggalPeriksa: "2026-08-12",
    usiaBulan: 28,
    beratKg: 10.1,
    tinggiCm: 78.5,
    posisiUkur: "berdiri",
    zBbu: -2.8,
    zTbu: -3.1,
    zBbtb: -1.5,
    statusGizi: "stunting",
    tingkatRisiko: "tinggi",
    rekomendasi:
      "[ANALISIS MEDIS KEMENKES RI & WHO] Pasien Muhammad Arfan (28 Bulan) terindikasi status Stunting dengan Z-Score TB/U -3.10 SD. Disarankan evaluasi asupan kalori & rujukan medis ke Faskes.",
    rekomendasiAwam:
      "Tinggi badan ananda Muhammad Arfan saat ini berada di bawah kurva standar usia 28 bulan. Diperlukan pemeriksaan lanjutan dan pemenuhan protein hewani harian bersama tim medis Puskesmas.",
    sumberRekomendasi: "lokal",
    createdAt: "2026-08-12T08:00:00Z",
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    clientUuid: "f0000000-0000-0000-0000-000000000002",
    idAnak: "d0000000-0000-0000-0000-000000000002",
    tanggalPeriksa: "2026-08-11",
    usiaBulan: 14,
    beratKg: 8.1,
    tinggiCm: 71.2,
    posisiUkur: "telentang",
    zBbu: -2.1,
    zTbu: -2.4,
    zBbtb: -1.2,
    statusGizi: "stunting",
    tingkatRisiko: "sedang",
    rekomendasi:
      "[ANALISIS MEDIS KEMENKES RI & WHO] Pasien Aisyah Putri Humaira (14 Bulan) terindikasi status Stunting Moderate. Diberikan PMT protein hewani (2 telur/hari).",
    rekomendasiAwam:
      "Pertumbuhan tinggi ananda Aisyah perlu perhatian khusus. Berikan asupan protein hewani secara teratur (misalnya 2 butir telur sehari) dan pantau kembali bulan depan.",
    sumberRekomendasi: "lokal",
    createdAt: "2026-08-11T09:00:00Z",
  },
  {
    id: "e0000000-0000-0000-0000-000000000003",
    clientUuid: "f0000000-0000-0000-0000-000000000003",
    idAnak: "d0000000-0000-0000-0000-000000000003",
    tanggalPeriksa: "2026-08-10",
    usiaBulan: 32,
    beratKg: 11.2,
    tinggiCm: 84.1,
    posisiUkur: "berdiri",
    zBbu: -2.3,
    zTbu: -2.6,
    zBbtb: -1.3,
    statusGizi: "stunting",
    tingkatRisiko: "sedang",
    rekomendasi:
      "[ANALISIS MEDIS KEMENKES RI & WHO] Terindikasi Stunting Ringan-Sedang. Evaluasi MP-ASI & sanitasi air minum rumah tangga.",
    rekomendasiAwam:
      "Ananda Kenzo membutuhkan tambahan gizi berimbang dan pastikan kebersihan air minum keluarga tetap terjaga.",
    sumberRekomendasi: "lokal",
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "e0000000-0000-0000-0000-000000000004",
    clientUuid: "f0000000-0000-0000-0000-000000000004",
    idAnak: "d0000000-0000-0000-0000-000000000004",
    tanggalPeriksa: "2026-08-08",
    usiaBulan: 24,
    beratKg: 11.8,
    tinggiCm: 86.5,
    posisiUkur: "berdiri",
    zBbu: 0.1,
    zTbu: 0.2,
    zBbtb: -0.1,
    statusGizi: "normal",
    tingkatRisiko: "rendah",
    rekomendasi:
      "[ANALISIS MEDIS KEMENKES RI & WHO] Pertumbuhan optimal sesuai kurva WHO. Pertahankan stimulasi tumbuh kembang aktif.",
    rekomendasiAwam:
      "Selamat! Pertumbuhan ananda Zahra sangat baik dan berada pada kurva normal sehat. Pertahankan pola makan bergizi seimbang.",
    sumberRekomendasi: "lokal",
    createdAt: "2026-08-08T08:30:00Z",
  },
  {
    id: "e0000000-0000-0000-0000-000000000005",
    clientUuid: "f0000000-0000-0000-0000-000000000005",
    idAnak: "d0000000-0000-0000-0000-000000000005",
    tanggalPeriksa: "2026-08-05",
    usiaBulan: 40,
    beratKg: 11.5,
    tinggiCm: 93.0,
    posisiUkur: "berdiri",
    zBbu: -2.9,
    zTbu: -1.8,
    zBbtb: -3.2,
    statusGizi: "gizi_buruk",
    tingkatRisiko: "tinggi",
    rekomendasi:
      "[ANALISIS MEDIS KEMENKES RI & WHO] Terindikasi Gizi Buruk (Severely Wasted). Wajib rujukan segera ke Puskesmas untuk Tatalaksana Gizi Buruk.",
    rekomendasiAwam:
      "Perhatian medis segera diperlukan untuk ananda Rafi. Mohon segera bawa rujukan ini ke Puskesmas untuk penanganan dokter spesialis gizi.",
    sumberRekomendasi: "lokal",
    createdAt: "2026-08-05T07:45:00Z",
  },
];

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

    return localPengukuranStore
      .filter((p) => p.idAnak === idAnak)
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

    return [...localPengukuranStore];
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

    // Cek idempotensi: jika client_uuid sudah ada, return record yang ada
    const existing = localPengukuranStore.find((p) => p.clientUuid === clientUuid);
    if (existing) {
      return existing;
    }

    // Ambil data anak untuk jenis kelamin
    const anak = await anakRepository.getById(payload.idAnak);
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
      idAnak: payload.idAnak,
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

    localPengukuranStore.unshift(newPengukuran);
    return newPengukuran;
  },
};
