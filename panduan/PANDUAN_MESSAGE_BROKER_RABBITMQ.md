# Panduan Arsitektur & Operasional Message Broker (RabbitMQ) — SimGizi

Dokumen ini menjelaskan arsitektur terdistribusi berbasis **Message Broker (RabbitMQ)** pada aplikasi **SimGizi**, mencakup setup Docker, topologi antrean, menjalankan worker consumer, hingga pengujian alur event lintas aktor (Posyandu, Puskesmas, dan Orang Tua).

---

## 1. Arsitektur Terdistribusi SimGizi

Sistem SimGizi mengadopsi pola **Event-Driven Architecture (EDA)** menggunakan RabbitMQ untuk memisahkan proses transaksi input posyandu dengan layanan hilir secara asynchronous (non-blocking).

![Diagram Arsitektur Message Broker RabbitMQ SimGizi](./diagram-message-broker.png)

```
   [ POSYANDU ]              [ PUSKESMAS ]
 (Input Pengukuran /       (Update Status
   Pengajuan Rujukan)          Rujukan)
          │                        │
          ▼                        ▼
 ┌────────────────────────────────────────────────────────┐
 │                   API GATEWAY / PRODUCER               │
 │        publishBrokerEvent(routingKey, data, role)      │
 └──────────────────────────┬─────────────────────────────┘
                            │ (AMQP 5672)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           TOPIC EXCHANGE: "simgizi.events"             │
 └─────────────┬───────────────────┬───────────────────┬──┘
               │                   │                   │
  Routing:     │ Routing:          │ Routing:          │ Routing:
  rujukan.*    │ pengukuran.*      │ *.created         │ # (Wildcard)
  pengukuran.* │ rujukan.*         │ *.updated         │
               ▼                   ▼                   ▼
    ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
    │  QUEUE 1:            ││  QUEUE 2:            ││  QUEUE 3:            │
    │  simgizi.puskesmas.  ││  simgizi.orangtua.   ││  simgizi.audit.      │
    │  triage              ││  notifikasi          ││  laporan             │
    └──────────┬───────────┘└──────────┬───────────┘└──────────┬───────────┘
               │                       │                       │
               ▼                       ▼                       ▼
    ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
    │  CONSUMER 1:         ││  CONSUMER 2:         ││  CONSUMER 3:         │
    │  Puskesmas Triage    ││  Notifikasi Ortu     ││  Audit & Dinkes Log  │
    │  - Filter risiko     ││  - Notif tumbuh-     ││  - Audit trail       │
    │  - Triage rujukan    ││    kembang & rujukan ││  - Laporan wilayah   │
    └──────────────────────┘└──────────────────────┘└──────────────────────┘
```

---

## 2. Topologi RabbitMQ

| Komponen | Nama / Nilai | Keterangan |
| :--- | :--- | :--- |
| **Exchange** | `simgizi.events` | Tipe `topic`, durable, menangani routing berbasis pola |
| **Queue 1** | `simgizi.puskesmas.triage` | Antrean triase medis balita berisiko & rujukan baru |
| **Queue 2** | `simgizi.orangtua.notifikasi` | Antrean notifikasi perkembangan anak & status rujukan |
| **Queue 3** | `simgizi.audit.laporan` | Antrean pencatatan jejak audit (binding key `#`) |

### Routing Keys:
- `pengukuran.created` $\rightarrow$ Diterbitkan saat kader Posyandu mencatat penimbangan baru.
- `rujukan.created` $\rightarrow$ Diterbitkan saat Posyandu mengajukan rujukan balita ke Puskesmas.
- `rujukan.updated` $\rightarrow$ Diterbitkan saat dokter Puskesmas mengubah status rujukan (diterima, ditolak, tindakan).

---

## 3. Langkah Menjalankan RabbitMQ via Docker

### Prasyarat
- Docker Desktop sudah terpasang dan dalam status **Running**.

### A. Menyalakan Container RabbitMQ
Jalankan perintah berikut di terminal root proyek:

```bash
docker compose up -d
```

Output yang diharapkan:
```
✔ Network simgizi_default         Created
✔ Container simgizi-rabbitmq      Started
```

### B. Membuka Dashboard Web Management UI
Buka browser dan akses alamat:
- **URL**: [http://localhost:15672](http://localhost:15672)
- **Username**: `simgizi`
- **Password**: `simgizi2026`

Di halaman dashboard, Anda dapat melihat visualisasi trafik pesan, daftar Exchange (`simgizi.events`), dan 3 antrean yang aktif secara real-time.

---

## 4. Menjalankan Consumer Worker

SimGizi menyediakan worker daemon mandiri untuk memproses pesan dari ketiga antrean secara terus-menerus:

```bash
npm run worker
```

Log di terminal akan menampilkan:
```
======================================================
  SIMGIZI MESSAGE BROKER WORKER DAEMON (RABBITMQ)     
======================================================
[Message Broker] Terhubung sukses ke RabbitMQ AMQP Broker
[Consumer 1] Siap mendengarkan antrean: simgizi.puskesmas.triage
[Consumer 2] Siap mendengarkan antrean: simgizi.orangtua.notifikasi
[Consumer 3] Siap mendengarkan antrean: simgizi.audit.laporan
✔ Seluruh 3 Consumer Message Broker SimGizi telah aktif!
Menunggu pesan baru... (Tekan Ctrl+C untuk berhenti)
```

---

## 5. Fitur Keandalan (Fail-Safe & Graceful Degradation)

Aplikasi SimGizi dirancang dengan arsitektur **Enterprise High Availability**:
1. **Non-Blocking Operation**:
   Jika container Docker RabbitMQ belum dinyalakan atau sedang maintenance, operasi simpan data di aplikasi web SimGizi **TIDAK AKAN CRASH** dan **TIDAK AKAN ERROR 500**.
2. **Local Fallback**:
   Sistem tetap mencatat transaksi ke database lokal dan memberikan respon sukses ke pengguna secara instan, sembari mencatat pesan peringatan di konsol server.
3. **Auto-Reconnect**:
   Ketika Docker RabbitMQ dinyalakan kembali, koneksi akan otomatis terhubung kembali saat ada event berikutnya tanpa perlu restart Next.js server.

---

## 6. Monitoring Kesehatan Message Broker

Status Message Broker dapat dimonitor secara langsung melalui API endpoint:

- **Method**: `GET`
- **Endpoint**: `/api/broker/status`
- **Contoh Response Saat Aktif**:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "url": "amqp://simgizi:****@localhost:5672",
    "exchange": "simgizi.events",
    "queues": {
      "puskesmas": {
        "name": "simgizi.puskesmas.triage",
        "messageCount": 0,
        "consumerCount": 1
      },
      "orangtua": {
        "name": "simgizi.orangtua.notifikasi",
        "messageCount": 0,
        "consumerCount": 1
      },
      "audit": {
        "name": "simgizi.audit.laporan",
        "messageCount": 0,
        "consumerCount": 1
      }
    },
    "message": "RabbitMQ Message Broker aktif & siap menyalurkan event."
  }
}
```

---

## 7. Pengujian Cepat via Skrip CLI (`npm run test:broker`) ⚡

SimGizi menyediakan skrip simulasi otomatis untuk menerbitkan 3 event nyata ke Topic Exchange:

```bash
npm run test:broker
```

Perintah ini akan langsung mengirimkan:
1. `pengukuran.created` (Data balita terindikasi stunting dari Posyandu).
2. `rujukan.created` (Pengajuan tiket rujukan medis darurat Posyandu ke Puskesmas).
3. `rujukan.updated` (Konfirmasi penanganan intervensi medis oleh Puskesmas).

Buka terminal tempat `npm run worker` berjalan untuk melihat ketiga Consumer memproses event secara *real-time*!

---

## 8. Skenario Pengujian Alur Terdistribusi via Web UI (Browser)

Berikut alur demo pengujian lengkap untuk juri / presentasi:

1. **Nyalakan Docker & Worker**:
   - Terminal 1: `docker compose up -d`
   - Terminal 2: `npm run worker`
   - Terminal 3: `npm run dev` (sudah berjalan di port 3000)

2. **Simulasi Pengukuran Baru**:
   - Login sebagai **Kader Posyandu** (`kelompok2` / `simgizi2026`).
   - Masuk ke menu **Pencatatan Data Anak** (`/pencatatan-anak`), masukkan data penimbangan anak berisiko stunting.
   - Klik **Simpan**.
   - **Hasil**:
     - Event `pengukuran.created` diterbitkan ke RabbitMQ.
     - Terminal `npm run worker` menampilkan log **Consumer 1 (Puskesmas)** memberi peringatan dini dan **Consumer 2 (Orang Tua)** mengirim rangkuman tumbuh kembang.

3. **Simulasi Pengajuan Rujukan**:
   - Di daftar riwayat / anak berisiko, klik **Rujuk ke Faskes**.
   - **Hasil**:
     - Event `rujukan.created` diterbitkan.
     - **Consumer 1 (Puskesmas)** menerima tiket triase baru.

4. **Simulasi Tindak Lanjut Puskesmas**:
   - Buka browser incognito, login sebagai **Dokter Puskesmas** (`puskesmas_bojongsoang` / `simgizi2026`).
   - Masuk ke tab **Rujukan** (`/puskesmas/rujukan`), klik **Terima & Periksa** atau **Tindak Lanjuti**.
   - **Hasil**:
     - Event `rujukan.updated` diterbitkan.
     - **Consumer 2 (Orang Tua)** dan **Consumer 3 (Audit)** langsung menerima pembaruan data status penanganan balita.
