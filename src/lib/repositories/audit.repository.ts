import { AuditLogItem } from "@/types";
import { BaseEventPayload, PengukuranEventData, RujukanEventData } from "@/lib/broker/events";

function createInitialAuditLogs(): AuditLogItem[] {
  const now = new Date();
  const m15 = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  const m25 = new Date(now.getTime() - 25 * 60 * 1000).toISOString();
  const m45 = new Date(now.getTime() - 45 * 60 * 1000).toISOString();
  const h1 = new Date(now.getTime() - 90 * 60 * 1000).toISOString();
  const h2 = new Date(now.getTime() - 150 * 60 * 1000).toISOString();
  const h4 = new Date(now.getTime() - 240 * 60 * 1000).toISOString();

  return [
    {
      id: "aud-001",
      eventId: `evt_${Date.now()}_arf01`,
      eventType: "rujukan.created",
      routingKey: "rujukan.created",
      timestamp: m15,
      producer: "posyandu",
      ringkasan: "Pengajuan rujukan stunting ananda Muhammad Arfan ke Poli KIA Puskesmas Bojongsoang",
      namaAnak: "Muhammad Arfan",
      faskes: "Posyandu Melati 03",
      status: "diajukan",
      data: {
        idAnak: "d0000000-0000-0000-0000-000000000001",
        namaAnak: "Muhammad Arfan",
        zTbu: -3.61,
        statusGizi: "stunting",
      },
    },
    {
      id: "aud-002",
      eventId: `evt_${Date.now() - 10000}_arf02`,
      eventType: "pengukuran.created",
      routingKey: "pengukuran.created",
      timestamp: m25,
      producer: "posyandu",
      ringkasan: "Pencatatan penimbangan balita Muhammad Arfan (BB: 10.1 kg, TB: 78.5 cm, Status: Stunting)",
      namaAnak: "Muhammad Arfan",
      faskes: "Posyandu Melati 03",
      status: "stunting",
      data: {
        idAnak: "d0000000-0000-0000-0000-000000000001",
        namaAnak: "Muhammad Arfan",
        beratKg: 10.1,
        tinggiCm: 78.5,
        zTbu: -3.61,
      },
    },
    {
      id: "aud-003",
      eventId: `evt_${Date.now() - 20000}_daf01`,
      eventType: "rujukan.created",
      routingKey: "rujukan.created",
      timestamp: m45,
      producer: "posyandu",
      ringkasan: "Pengajuan rujukan balita gizi buruk ananda Dafa Ibrahim ke Poli KIA Puskesmas Bojongsoang",
      namaAnak: "Dafa Ibrahim",
      faskes: "Posyandu Melati 03",
      status: "diajukan",
      data: {
        namaAnak: "Dafa Ibrahim",
        statusGizi: "gizi_buruk",
      },
    },
    {
      id: "aud-004",
      eventId: `evt_${Date.now() - 30000}_asy01`,
      eventType: "rujukan.updated",
      routingKey: "rujukan.updated",
      timestamp: h1,
      producer: "puskesmas",
      ringkasan: "Dokter Puskesmas Bojongsoang menerima dan menindaklanjuti rujukan ananda Aisyah Putri Humaira",
      namaAnak: "Aisyah Putri Humaira",
      faskes: "Puskesmas Bojongsoang",
      status: "ditindaklanjuti",
      data: {
        namaAnak: "Aisyah Putri Humaira",
        status: "ditindaklanjuti",
        dokter: "Dr. Hj. Syahla Mutiara Latifah, M.Kes",
      },
    },
    {
      id: "aud-005",
      eventId: `evt_${Date.now() - 40000}_asy02`,
      eventType: "rujukan.created",
      routingKey: "rujukan.created",
      timestamp: h2,
      producer: "posyandu",
      ringkasan: "Pengajuan tiket rujukan stunting ananda Aisyah Putri Humaira dari Posyandu Mekar Sari 01",
      namaAnak: "Aisyah Putri Humaira",
      faskes: "Posyandu Mekar Sari 01",
      status: "diajukan",
      data: {
        namaAnak: "Aisyah Putri Humaira",
        statusGizi: "stunting",
      },
    },
    {
      id: "aud-006",
      eventId: `evt_${Date.now() - 50000}_knz01`,
      eventType: "pengukuran.created",
      routingKey: "pengukuran.created",
      timestamp: h4,
      producer: "posyandu",
      ringkasan: "Pencatatan penimbangan balita Kenzo Rafasya (BB: 11.2 kg, TB: 85.0 cm, Gizi Kurang)",
      namaAnak: "Kenzo Rafasya",
      faskes: "Posyandu Melati 03",
      status: "gizi_kurang",
      data: {
        namaAnak: "Kenzo Rafasya",
        statusGizi: "gizi_kurang",
      },
    },
  ];
}

const globalForAudit = globalThis as unknown as {
  __localAuditStore?: AuditLogItem[];
  __localAuditStoreVersion?: number;
};

const CURRENT_AUDIT_VERSION = 2;

const getAuditStore = (): AuditLogItem[] => {
  if (
    !globalForAudit.__localAuditStore ||
    globalForAudit.__localAuditStoreVersion !== CURRENT_AUDIT_VERSION
  ) {
    globalForAudit.__localAuditStore = createInitialAuditLogs();
    globalForAudit.__localAuditStoreVersion = CURRENT_AUDIT_VERSION;
  }
  return globalForAudit.__localAuditStore;
};

export const auditRepository = {
  async getAll(filter?: { eventType?: string; search?: string }): Promise<AuditLogItem[]> {
    let list = [...getAuditStore()];

    if (filter?.eventType && filter.eventType !== "all") {
      list = list.filter((i) => i.eventType === filter.eventType);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.ringkasan.toLowerCase().includes(q) ||
          i.eventId.toLowerCase().includes(q) ||
          (i.namaAnak && i.namaAnak.toLowerCase().includes(q)) ||
          (i.faskes && i.faskes.toLowerCase().includes(q)),
      );
    }

    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },

  async recordEvent(payload: BaseEventPayload<unknown>): Promise<AuditLogItem> {
    const store = getAuditStore();

    let ringkasan = `Event ${payload.eventType} diterima dari ${payload.producer}`;
    let namaAnak: string | undefined;
    let faskes: string | undefined;
    let status: string | undefined;

    const dataObj = (payload.data || {}) as Record<string, unknown>;

    if (payload.eventType === "pengukuran.created") {
      const p = dataObj as unknown as PengukuranEventData;
      namaAnak = p.namaAnak;
      faskes = p.namaPosyandu || "Posyandu Melati 03";
      status = p.statusGizi;
      ringkasan = `Penimbangan ${p.namaAnak || "Balita"} (BB: ${p.beratKg} kg, TB: ${p.tinggiCm} cm, Status: ${p.statusGizi || "-"})`;
    } else if (payload.eventType === "rujukan.created") {
      const r = dataObj as unknown as RujukanEventData;
      namaAnak = r.namaAnak;
      faskes = r.namaPosyandu || "Posyandu";
      status = r.status || "diajukan";
      ringkasan = `Pengajuan tiket rujukan ${namaAnak || "Pasien"} ke ${r.namaPuskesmas || "Puskesmas"}`;
    } else if (payload.eventType === "rujukan.updated") {
      const r = dataObj as unknown as RujukanEventData;
      namaAnak = r.namaAnak;
      faskes = r.namaPuskesmas || "Puskesmas Bojongsoang";
      status = r.status || "ditindaklanjuti";
      ringkasan = `Pembaruan status rujukan ${namaAnak || "Pasien"} menjadi ${status.toUpperCase()}${r.catatanTindakan ? ` (Tindakan: ${r.catatanTindakan.substring(0, 40)}...)` : ""}`;
    }

    const item: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: payload.eventId,
      eventType: payload.eventType,
      routingKey: payload.eventType,
      timestamp: payload.timestamp || new Date().toISOString(),
      producer: payload.producer,
      ringkasan,
      namaAnak,
      faskes,
      status,
      data: dataObj,
    };

    store.unshift(item);
    return item;
  },

  async getSummary() {
    const list = getAuditStore();
    const total = list.length;
    const pengukuranCount = list.filter((l) => l.eventType === "pengukuran.created").length;
    const rujukanCreatedCount = list.filter((l) => l.eventType === "rujukan.created").length;
    const rujukanUpdatedCount = list.filter((l) => l.eventType === "rujukan.updated").length;

    return {
      totalEvents: total,
      pengukuranCount,
      rujukanCreatedCount,
      rujukanUpdatedCount,
      lastEvent: list[0] || null,
    };
  },

  async reset(): Promise<void> {
    globalForAudit.__localAuditStore = createInitialAuditLogs();
  },
};
