// src/lib/broker/rabbitmq.ts
// Client & Producer RabbitMQ Message Broker dengan Mekanisme Fail-Safe

import amqplib, { Channel, ChannelModel } from "amqplib";
import {
  BROKER_EXCHANGE,
  BROKER_QUEUES,
  BROKER_ROUTING_KEYS,
  BaseEventPayload,
} from "./events";
import { auditRepository } from "@/lib/repositories/audit.repository";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://simgizi:simgizi2026@localhost:5672";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isConnecting = false;
let hasReportedOffline = false;

/**
 * Membuka koneksi dan menginisialisasi topologi RabbitMQ Message Broker
 */
export async function getBrokerChannel(): Promise<Channel | null> {
  if (channel) return channel;
  if (isConnecting) return null;

  isConnecting = true;
  try {
    connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // 1. Deklarasikan Topic Exchange terpusat
    await channel.assertExchange(BROKER_EXCHANGE, "topic", { durable: true });

    // 2. Deklarasikan 3 Antrean (Queues) sesuai arsitektur sistem heterogen
    // Consumer 1: Puskesmas Triage
    await channel.assertQueue(BROKER_QUEUES.PUSKESMAS_TRIAGE, { durable: true });
    await channel.bindQueue(
      BROKER_QUEUES.PUSKESMAS_TRIAGE,
      BROKER_EXCHANGE,
      BROKER_ROUTING_KEYS.RUJUKAN_CREATED,
    );
    await channel.bindQueue(
      BROKER_QUEUES.PUSKESMAS_TRIAGE,
      BROKER_EXCHANGE,
      BROKER_ROUTING_KEYS.PENGUKURAN_CREATED,
    );

    // Consumer 2: Notifikasi Orang Tua
    await channel.assertQueue(BROKER_QUEUES.ORANGTUA_NOTIFIKASI, { durable: true });
    await channel.bindQueue(
      BROKER_QUEUES.ORANGTUA_NOTIFIKASI,
      BROKER_EXCHANGE,
      BROKER_ROUTING_KEYS.PENGUKURAN_CREATED,
    );
    await channel.bindQueue(
      BROKER_QUEUES.ORANGTUA_NOTIFIKASI,
      BROKER_EXCHANGE,
      BROKER_ROUTING_KEYS.RUJUKAN_CREATED,
    );
    await channel.bindQueue(
      BROKER_QUEUES.ORANGTUA_NOTIFIKASI,
      BROKER_EXCHANGE,
      BROKER_ROUTING_KEYS.RUJUKAN_UPDATED,
    );

    // Consumer 3: Audit & Rekap Wilayah Dinas Kesehatan
    await channel.assertQueue(BROKER_QUEUES.AUDIT_LAPORAN, { durable: true });
    await channel.bindQueue(
      BROKER_QUEUES.AUDIT_LAPORAN,
      BROKER_EXCHANGE,
      "#", // Menerima seluruh topik event
    );

    connection.on("error", (err) => {
      console.warn("[Message Broker] Koneksi RabbitMQ error:", err.message);
      channel = null;
      connection = null;
    });

    connection.on("close", () => {
      channel = null;
      connection = null;
    });

    hasReportedOffline = false;
    console.log("[Message Broker] Terhubung sukses ke RabbitMQ AMQP Broker");
    return channel;
  } catch (err: unknown) {
    if (!hasReportedOffline) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(
        `[Message Broker] RabbitMQ belum aktif (${errMsg}). Berjalan dalam mode Fail-Safe lokal.`,
      );
      hasReportedOffline = true;
    }
    channel = null;
    connection = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

/**
 * Producer: Menerbitkan pesan ke Topic Exchange Message Broker
 */
export async function publishBrokerEvent<T>(
  routingKey: string,
  data: T,
  producer: "posyandu" | "puskesmas" | "sistem" = "posyandu",
): Promise<boolean> {
  const payload: BaseEventPayload<T> = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    eventType: routingKey,
    timestamp: new Date().toISOString(),
    producer,
    data,
  };

  try {
    // Simpan ke log audit lokal terintegrasi
    auditRepository.recordEvent(payload as BaseEventPayload<unknown>).catch(() => {});

    const ch = await getBrokerChannel();
    if (!ch) {
      // Fail-Safe: Broker offline, pesan dicatat secara aman
      return false;
    }

    const messageBuffer = Buffer.from(JSON.stringify(payload));
    const published = ch.publish(BROKER_EXCHANGE, routingKey, messageBuffer, {
      persistent: true,
      contentType: "application/json",
      messageId: payload.eventId,
      timestamp: Date.now(),
    });

    return published;
  } catch (err) {
    console.warn(`[Message Broker] Gagal menerbitkan pesan ${routingKey}:`, err);
    return false;
  }
}

/**
 * Cek status kesehatan Message Broker untuk monitoring antarmuka
 */
export async function getBrokerStatus() {
  try {
    const ch = await getBrokerChannel();
    if (!ch) {
      return {
        connected: false,
        url: RABBITMQ_URL.replace(/:[^:]*@/, ":****@"),
        exchange: BROKER_EXCHANGE,
        queues: BROKER_QUEUES,
        message: "RabbitMQ Broker belum berjalan (Docker/AMQP Server offline).",
      };
    }

    // Ambil statistik jumlah antrean
    const [qPuskesmas, qOrangTua, qAudit] = await Promise.all([
      ch.checkQueue(BROKER_QUEUES.PUSKESMAS_TRIAGE),
      ch.checkQueue(BROKER_QUEUES.ORANGTUA_NOTIFIKASI),
      ch.checkQueue(BROKER_QUEUES.AUDIT_LAPORAN),
    ]);

    return {
      connected: true,
      url: RABBITMQ_URL.replace(/:[^:]*@/, ":****@"),
      exchange: BROKER_EXCHANGE,
      queues: {
        puskesmas: {
          name: BROKER_QUEUES.PUSKESMAS_TRIAGE,
          messageCount: qPuskesmas.messageCount,
          consumerCount: qPuskesmas.consumerCount,
        },
        orangtua: {
          name: BROKER_QUEUES.ORANGTUA_NOTIFIKASI,
          messageCount: qOrangTua.messageCount,
          consumerCount: qOrangTua.consumerCount,
        },
        audit: {
          name: BROKER_QUEUES.AUDIT_LAPORAN,
          messageCount: qAudit.messageCount,
          consumerCount: qAudit.consumerCount,
        },
      },
      message: "RabbitMQ Message Broker aktif & siap menyalurkan event.",
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      url: RABBITMQ_URL.replace(/:[^:]*@/, ":****@"),
      exchange: BROKER_EXCHANGE,
      queues: BROKER_QUEUES,
      message: `Koneksi gagal: ${errMsg}`,
    };
  }
}
