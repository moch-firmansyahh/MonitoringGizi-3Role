import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { anakRepository } from "@/lib/repositories/anak.repository";
import { pengukuranRepository } from "@/lib/repositories/pengukuran.repository";
import { rujukanRepository } from "@/lib/repositories/rujukan.repository";
import { puskesmasRepository } from "@/lib/repositories/puskesmas.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

export async function GET() {
  try {
    const user = await getCurrentUser();
    // Biarkan akses demo jika fallback
    const allAnak = await anakRepository.getAll();
    const allPengukuran = await pengukuranRepository.getAll();
    const allRujukan = await rujukanRepository.getAll();
    const posyanduList = await puskesmasRepository.getPosyanduBinaan();
    const auditSummary = await auditRepository.getSummary();
    const recentAudit = await auditRepository.getAll();

    // Map pengukuran terakhir per anak
    const latestMap = new Map();
    for (const p of allPengukuran) {
      if (!latestMap.has(p.idAnak)) {
        latestMap.set(p.idAnak, p);
      }
    }

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

    const totalBalita = allAnak.length;
    const prevalensiStunting =
      totalBalita > 0 ? Number(((stunting / totalBalita) * 100).toFixed(1)) : 0;

    // Statistik per Posyandu
    const posyanduBreakdown = posyanduList.map((pos) => {
      const anakDiPos = allAnak.filter((a) => a.idPosyandu === pos.id);
      let stuntCount = 0;
      let burukCount = 0;
      let kurangCount = 0;
      let normalCount = 0;

      for (const a of anakDiPos) {
        const p = latestMap.get(a.id);
        if (p?.statusGizi === "stunting") stuntCount++;
        else if (p?.statusGizi === "gizi_buruk") burukCount++;
        else if (p?.statusGizi === "gizi_kurang") kurangCount++;
        else normalCount++;
      }

      return {
        id: pos.id,
        nama: pos.nama,
        kelurahan: pos.kelurahan || "Kab. Bandung",
        totalBalita: anakDiPos.length,
        stuntingCount: stuntCount,
        giziBurukCount: burukCount,
        giziKurangCount: kurangCount,
        normalCount: normalCount,
        persentaseStunting:
          anakDiPos.length > 0
            ? Number(((stuntCount / anakDiPos.length) * 100).toFixed(1))
            : 0,
        statusZona: stuntCount > 2 ? "Merah" : stuntCount > 0 ? "Kuning" : "Hijau",
      };
    });

    // Rujukan SLA & Status
    const rujukanDiajukan = allRujukan.filter((r) => r.status === "diajukan").length;
    const rujukanDiterima = allRujukan.filter((r) => r.status === "diterima").length;
    const rujukanDitindaklanjuti = allRujukan.filter(
      (r) => r.status === "ditindaklanjuti",
    ).length;

    // Logistik PMT Wilayah
    const logistikPmt = {
      alokasiTotalPaket: 150,
      terdistribusi: 48,
      sisaStok: 102,
      biskuitProteinDus: 45,
      susuKhususKaleng: 28,
      vitaminASachet: 120,
    };

    return NextResponse.json({
      success: true,
      data: {
        wilayah: "Kabupaten Bandung (Wilayah Kerja Puskesmas Bojongsoang)",
        pejabat: user?.namaLengkap || "Dra. Hj. Nunung Nurhayati, M.Si",
        statistikGizi: {
          totalBalita,
          normal,
          giziKurang,
          giziBuruk,
          stunting,
          prevalensiStunting,
        },
        rujukanStatus: {
          total: allRujukan.length,
          diajukan: rujukanDiajukan,
          diterima: rujukanDiterima,
          ditindaklanjuti: rujukanDitindaklanjuti,
        },
        posyanduBreakdown,
        logistikPmt,
        auditSummary,
        recentAuditLogs: recentAudit.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("GET /api/dinkes/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat dashboard Dinas Kesehatan." },
      { status: 500 },
    );
  }
}
