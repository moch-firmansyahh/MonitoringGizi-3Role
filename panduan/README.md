# 📘 Pusat Panduan & Dokumentasi Resmi — SimGizi

Folder ini memuat panduan operasional, diagram arsitektur, dan alur pengujian resmi untuk sistem **SimGizi**.

---

## 🖼️ Diagram Arsitektur Message Broker (RabbitMQ)

![Diagram Arsitektur Message Broker RabbitMQ SimGizi](./diagram-message-broker.png)

---

## 📑 Daftar Dokumen Panduan

| No | Dokumen | Tautan | Deskripsi & Kegunaan |
| :---: | :--- | :--- | :--- |
| **1** | **Panduan Pengujian End-to-End** | [`testing.md`](./testing.md) | Panduan alur pengujian lengkap 1 jalur (Kader Posyandu $\rightarrow$ Dokter Puskesmas $\rightarrow$ Orang Tua Balita) beserta master data 30 balita & integrasi Message Broker. |
| **2** | **Panduan Message Broker RabbitMQ** | [`PANDUAN_MESSAGE_BROKER_RABBITMQ.md`](./PANDUAN_MESSAGE_BROKER_RABBITMQ.md) | Arsitektur detail RabbitMQ, topologi topic exchange `simgizi.events`, 3 queues, fail-safe degradation, dan perintah verifikasi teknis. |

---

## 🔑 Kredensial Akun Pengujian

> **Kata Sandi (Password) Seluruh Akun**: `simgizi2026`

| Peran | Akun Login | Faskes / Profil | URL Akses |
| :--- | :--- | :--- | :--- |
| **Kader Posyandu** | `kelompok2` | Posyandu Melati 03 | [http://localhost:3000/](http://localhost:3000/) |
| **Dokter Puskesmas** | `puskesmas_bojongsoang` | Puskesmas Bojongsoang | [http://localhost:3000/puskesmas](http://localhost:3000/puskesmas) |
| **Orang Tua Balita** | `orangtua_arfan` | Rahmat Hidayat (Ayah Arfan & Hanif) | [http://localhost:3000/orang-tua](http://localhost:3000/orang-tua) |
| **Dinas Kesehatan** | `dinkes_bandung` | Dinkes Kab. Bandung (Surveilans & Audit) | [http://localhost:3000/dinkes](http://localhost:3000/dinkes) |

---

## ⚡ Perintah Cepat Pengujian

```bash
# 1. Jalankan Container Docker RabbitMQ
docker compose up -d

# 2. Jalankan Worker Daemon (Terminal Khusus)
npm run worker

# 3. Jalankan Pengujian Otomatis Event Broker
npm run test:broker

# 4. Jalankan Unit Test Vitest
npm test

# 5. Jalankan Web Server Aplikasi
npm run dev
```
