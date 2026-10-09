import { anakRepository } from "./anak.repository";
import { pengukuranRepository } from "./pengukuran.repository";
import { rujukanRepository } from "./rujukan.repository";
import { Posyandu } from "@/types";

const POSYANDU_LIST: Posyandu[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    idPuskesmas: "b0000000-0000-0000-0000-000000000001",
    nama: "Posyandu Melati 03",
    alamat: "Balai Warga RW 03, Bojongsoang",
    rw: "03",
    kelurahan: "Bojongsoang",
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    idPuskesmas: "b0000000-0000-0000-0000-000000000001",
    nama: "Posyandu Mekar Sari 01",
    alamat: "Balai Warga RW 01, Lengkong",
    rw: "01",
    kelurahan: "Lengkong",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    idPuskesmas: "b0000000-0000-0000-0000-000000000001",
    nama: "Posyandu Mawar 02",
    alamat: "Balai Warga RW 02, Buahbatu",
    rw: "02",
    kelurahan: "Buahbatu",
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    idPuskesmas: "b0000000-0000-0000-0000-000000000002",
    nama: "Posyandu Teratai 01",
    alamat: "Balai Warga RW 01, Dayeuhkolot",
    rw: "01",
    kelurahan: "Dayeuhkolot",
  },
  {
    id: "a0000000-0000-0000-0000-000000000005",
    idPuskesmas: "b0000000-0000-0000-0000-000000000002",
    nama: "Posyandu Cempaka 04",
    alamat: "Balai Warga RW 04, Cangkuang Kulon",
    rw: "04",
    kelurahan: "Cangkuang Kulon",
  },
];

export const puskesmasRepository = {
  async getPosyanduBinaan(idPuskesmas?: string): Promise<Posyandu[]> {
    if (!idPuskesmas) return POSYANDU_LIST;
    return POSYANDU_LIST.filter((p) => p.idPuskesmas === idPuskesmas);
  },

  async getDashboardSummary(idPuskesmas?: string) {
    const allAnak = await anakRepository.getAll();
    const allPengukuran = await pengukuranRepository.getAll();
    const allRujukan = await rujukanRepository.getAll();

    // Map pengukuran terakhir per anak
    const latestMap = new Map();
    for (const p of allPengukuran) {
      if (!latestMap.has(p.idAnak)) {
        latestMap.set(p.idAnak, p);
      }
    }

    let total = allAnak.length;
    let normal = 0;
    let giziKurang = 0;
    let giziBuruk = 0;
    let stunting = 0;

    for (const anak of allAnak) {
      const p = latestMap.get(anak.id);
      if (!p) {
        normal++;
        continue;
      }
      if (p.statusGizi === "stunting") stunting++;
      else if (p.statusGizi === "gizi_buruk") giziBuruk++;
      else if (p.statusGizi === "gizi_kurang") giziKurang++;
      else normal++;
    }

    const rujukanAktif = allRujukan.filter(
      (r) => r.status === "diajukan" || r.status === "diterima" || r.status === "ditindaklanjuti",
    ).length;

    // Statistik per Posyandu
    const posyanduStats = POSYANDU_LIST.map((pos) => {
      const anakPos = allAnak.filter((a) => a.idPosyandu === pos.id);
      let stuntCount = 0;
      for (const a of anakPos) {
        const p = latestMap.get(a.id);
        if (p?.statusGizi === "stunting") stuntCount++;
      }
      return {
        id: pos.id,
        nama: pos.nama,
        alamat: pos.alamat,
        totalBalita: anakPos.length,
        stuntingCount: stuntCount,
        persentaseStunting:
          anakPos.length > 0
            ? Math.round((stuntCount / anakPos.length) * 100)
            : 0,
        terakhirUpdate: "12 Agustus 2026",
      };
    });

    return {
      totalBalita: total,
      normal,
      giziKurang,
      giziBuruk,
      stunting,
      totalRujukan: allRujukan.length,
      rujukanAktif,
      posyanduStats,
    };
  },

  async getBalitaBerisiko(options?: { posyanduId?: string; priority?: string }) {
    const allAnak = await anakRepository.getAll({ posyanduId: options?.posyanduId });
    const allPengukuran = await pengukuranRepository.getAll();

    const latestMap = new Map();
    for (const p of allPengukuran) {
      if (!latestMap.has(p.idAnak)) {
        latestMap.set(p.idAnak, p);
      }
    }

    const berisiko = [];
    for (const anak of allAnak) {
      const p = latestMap.get(anak.id);
      if (!p) continue;

      if (
        p.statusGizi === "stunting" ||
        p.statusGizi === "gizi_buruk" ||
        p.statusGizi === "gizi_kurang"
      ) {
        // Tentukan bobot prioritas: gizi_buruk (1), stunting (2), gizi_kurang (3)
        let priorityRank = 3;
        if (p.statusGizi === "gizi_buruk") priorityRank = 1;
        else if (p.statusGizi === "stunting") priorityRank = 2;

        berisiko.push({
          anak,
          pengukuran: p,
          priorityRank,
        });
      }
    }

    // Urutkan berdasarkan prioritas gizi terberat
    berisiko.sort((a, b) => a.priorityRank - b.priorityRank);
    return berisiko;
  },
};
