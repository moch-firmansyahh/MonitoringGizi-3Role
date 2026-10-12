// src/lib/broker/consumer.ts
// 3 Consumer / Subscriber RabbitMQ sesuai arsitektur sistem heterogen

import { Channel, ConsumeMessage } from "amqplib";
import { getBrokerChannel } from "./rabbitmq";
import {
  BROKER_QUEUES,
  BaseEventPayload,
  PengukuranEventData,
  RujukanEventData,
} from "./events";
import { auditRepository } from "@/lib/repositories/audit.repository";
import { notifikasiRepository } from "@/lib/repositories/notifikasi.repository";

/**
 * Consumer 1: Puskesmas Triage Service
 * Menerima rujukan dan kasus balita berisiko tinggi untuk antrean poli KIA / gizi
 */
async function startConsumerPuskesmas(channel: Channel) {
  await channel.consume(
    BROKER_QUEUES.PUSKESMAS_TRIAGE,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const payload: BaseEventPayload<PengukuranEventData | RujukanEventData> =
          JSON.parse(msg.content.toString());

        console.log(
          `\x1b[36m[Consumer 1 - Puskesmas Triage]\x1b[0m Menerima event \x1b[33m${payload.eventType}\x1b[0m (ID: ${payload.eventId}):`,
        );

        if (payload.eventType === "rujukan.created") {
          const rujukan = payload.data as RujukanEventData;
          console.log(
            `  -> [Triage Medis] Pasien: ${rujukan.namaAnak} (${rujukan.nikAnak}) | Status: ${rujukan.status} | Asal: ${rujukan.namaPosyandu || "Posyandu"}`,
          );
        } else if (payload.eventType === "pengukuran.created") {
          const ukur = payload.data as PengukuranEventData;
          if (ukur.isStuntingOrWasted) {
            console.log(
              `  -> [Peringatan Dini Epidemiologi] Kasus ${ukur.statusGizi.toUpperCase()}: ${ukur.namaAnak} (TB/U: ${ukur.zTbu} SD)`,
            );
          }
        }

        channel.ack(msg);
      } catch (err) {
        console.error("[Consumer 1 - Puskesmas] Gagal memproses pesan:", err);
        channel.nack(msg, false, false); // Buang jika malformed JSON
      }
    },
  );
  console.log(`[Consumer 1] Siap mendengarkan antrean: ${BROKER_QUEUES.PUSKESMAS_TRIAGE}`);
}

/**
 * Consumer 2: Layanan Notifikasi Orang Tua
 * Menyalurkan pesan ramah ke dashboard ayah/bunda mengenai pertumbuhan & rujukan
 */
async function startConsumerOrangTua(channel: Channel) {
  await channel.consume(
    BROKER_QUEUES.ORANGTUA_NOTIFIKASI,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const payload: BaseEventPayload<PengukuranEventData | RujukanEventData> =
          JSON.parse(msg.content.toString());

        console.log(
          `\x1b[35m[Consumer 2 - Notifikasi Orang Tua]\x1b[0m Menerima event \x1b[33m${payload.eventType}\x1b[0m:`,
        );

        if (payload.eventType === "pengukuran.created") {
          const ukur = payload.data as PengukuranEventData;
          console.log(
            `  -> [Pesan Orang Tua] Notifikasi pertumbuhan dikirim untuk ${ukur.namaAnak}: BB ${ukur.beratKg} kg, TB ${ukur.tinggiCm} cm (${ukur.statusGizi})`,
          );
          await notifikasiRepository.create({
            idPenerima: "c0000000-0000-0000-0000-000000000003",
            jenis: "hasil_pengukuran",
            judul: `Hasil Pemeriksaan ${ukur.namaAnak}`,
            isi: `Pemeriksaan penimbangan baru berhasil dicatat: BB ${ukur.beratKg} kg, TB ${ukur.tinggiCm} cm (Status: ${ukur.statusGizi.toUpperCase()}). Ananda dianjurkan mengonsumsi gizi seimbang.`,
            tautan: "/orang-tua/perkembangan",
          }).catch(() => {});
        } else if (
          payload.eventType === "rujukan.created" ||
          payload.eventType === "rujukan.updated"
        ) {
          const rujukan = payload.data as RujukanEventData;
          console.log(
            `  -> [Pesan Orang Tua] Status rujukan ${rujukan.namaAnak} diperbarui menjadi: ${rujukan.status.toUpperCase()}`,
          );
          const isDitindaklanjuti = rujukan.status === "ditindaklanjuti";
          await notifikasiRepository.create({
            idPenerima: "c0000000-0000-0000-0000-000000000003",
            jenis: "rujukan_status",
            judul: isDitindaklanjuti
              ? `Rujukan Ditindaklanjuti Dokter Puskesmas: ${rujukan.namaAnak}`
              : `Status Rujukan ${rujukan.namaAnak}: ${rujukan.status.toUpperCase()}`,
            isi:
              rujukan.catatanTindakan ||
              rujukan.catatan ||
              `Status rujukan balita telah diperbarui menjadi ${rujukan.status.toUpperCase()}.`,
            tautan: "/orang-tua/notifikasi",
          }).catch(() => {});
        }

        channel.ack(msg);
      } catch (err) {
        console.error("[Consumer 2 - Orang Tua] Gagal memproses notifikasi:", err);
        channel.nack(msg, false, false);
      }
    },
  );
  console.log(`[Consumer 2] Siap mendengarkan antrean: ${BROKER_QUEUES.ORANGTUA_NOTIFIKASI}`);
}

/**
 * Consumer 3: Audit Trail & Rekapitulasi Wilayah Dinas Kesehatan
 * Mencatat seluruh lalu lintas data untuk laporan resmi epidemiologi
 */
async function startConsumerAudit(channel: Channel) {
  await channel.consume(
    BROKER_QUEUES.AUDIT_LAPORAN,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const payload: BaseEventPayload = JSON.parse(msg.content.toString());

        console.log(
          `\x1b[32m[Consumer 3 - Audit Dinkes]\x1b[0m [${payload.timestamp}] Event: ${payload.eventType} | Producer: ${payload.producer}`,
        );

        auditRepository.recordEvent(payload).catch(() => {});

        channel.ack(msg);
      } catch (err) {
        console.error("[Consumer 3 - Audit] Gagal mencatat log:", err);
        channel.nack(msg, false, false);
      }
    },
  );
  console.log(`[Consumer 3] Siap mendengarkan antrean: ${BROKER_QUEUES.AUDIT_LAPORAN}`);
}

/**
 * Menjalankan ketiga Consumer RabbitMQ secara paralel
 */
export async function startAllConsumers(): Promise<boolean> {
  const channel = await getBrokerChannel();
  if (!channel) {
    console.warn("[Message Broker] Consumer tidak dapat dimulai karena RabbitMQ belum terhubung.");
    return false;
  }

  // Set prefetch agar adil membagi beban pesan
  await channel.prefetch(10);

  await Promise.all([
    startConsumerPuskesmas(channel),
    startConsumerOrangTua(channel),
    startConsumerAudit(channel),
  ]);

  console.log("\x1b[32m✔ Seluruh 3 Consumer Message Broker SimGizi telah aktif!\x1b[0m");
  return true;
}
