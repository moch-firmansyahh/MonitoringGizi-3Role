# SimGizi — Sistem Informasi Gizi Anak & Deteksi Dini Stunting (Multi-Role)

<p align="center">
  <strong>Platform Terpadu Pemantauan Status Gizi Balita Berbasis Standar WHO Permenkes 2020, Rekomendasi AI Gemini, dan Kolaborasi 3 Role: Posyandu, Puskesmas, & Orang Tua</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-5.0.3-6E9F18?style=for-the-badge&logo=vitest" alt="Vitest" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google" alt="Gemini API" />
  <img src="https://img.shields.io/badge/Supabase-Ready_Postgres-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Standar-WHO_Permenkes_2020-0d472c?style=for-the-badge" alt="WHO Permenkes 2020" />
</p>

---

## 1. Ringkasan Eksekutif

**SimGizi Multi-Role** adalah ekosistem digital kesehatan masyarakat yang menghubungkan tiga pilar penanganan stunting dan malnutrisi pada balita (0–59 bulan):
1. **Posyandu**: Garda terdepan pencatatan antropometri bulanan, deteksi dini Z-score, dan pengajuan rujukan faskes darurat.
2. **Puskesmas**: Fasilitas pelayanan kesehatan tingkat pertama yang mengawasi seluruh Posyandu binaan, triage balita berisiko tinggi (Gizi Buruk & Stunting), verifikasi rujukan, dan pelaporan wilayah agregat.
3. **Orang Tua**: Portal seluler _mobile-first_ bagi ayah/ibu untuk memantau grafik tumbuh kembang anak (Kurva Standar WHO), memahami edukasi nutrisi berbasis bahasa awam, dan memantau status rujukan secara transparan.

---

## 2. Kredensial Akses Pengguna Sistem (6 Akun Resmi)

> 🔑 **Kata Sandi (Password) Seluruh Akun**: `simgizi2026`  
> 📖 *Rincian master data NIK balita, faskes, dan alur pengujian dapat dilihat di [PANDUAN_AKUN_DAN_DATA_CRUD.md](PANDUAN_AKUN_DAN_DATA_CRUD.md)*.

| No | Peran (Role) | Username | Kata Sandi | Nama Pengguna / Afiliasi | Akses Utama |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Kader Posyandu 1** | `kelompok2` | `simgizi2026` | Bidan Sri Wahyuni, S.Tr.Keb (Posyandu Melati 03) | `/` (Dashboard Posyandu), `/pencatatan-anak`, `/rekap-data-gizi`, `/rujukan` |
| **2** | **Kader Posyandu 2** | `posyandu_mekarsari01` | `simgizi2026` | Kader Siti Nurhaliza, A.Md.Keb (Posyandu Mekar Sari 01) | `/` (Dashboard Posyandu), `/pencatatan-anak`, `/rekap-data-gizi`, `/rujukan` |
| **3** | **Petugas Puskesmas 1** | `puskesmas_bojongsoang` | `simgizi2026` | Dr. Hj. Syahla Mutiara Latifah, M.Kes (Puskesmas Bojongsoang) | `/puskesmas` (Dashboard Wilayah), Balita Berisiko, Inbox Rujukan, Laporan |
| **4** | **Petugas Puskesmas 2** | `puskesmas_dayeuhkolot` | `simgizi2026` | Dr. Ahmad Fauzi, Sp.A (Puskesmas Dayeuhkolot) | `/puskesmas` (Dashboard Wilayah), Balita Berisiko, Inbox Rujukan, Laporan |
| **5** | **Orang Tua 1** | `orangtua_arfan` | `simgizi2026` | Rahmat Hidayat (Wali Muhammad Arfan) | `/orang-tua` (Beranda Edukasi, Kurva WHO, Jadwal, Klaim Balita) |
| **6** | **Orang Tua 2** | `orangtua_aisyah` | `simgizi2026` | Hendra Wijaya (Wali Aisyah Putri Humaira) | `/orang-tua` (Beranda Edukasi, Kurva WHO, Jadwal, Klaim Balita) |

---

## 3. Fitur Utama & Inovasi Peran

### 🏛️ A. Modul Posyandu (Garda Depan)
- **Zero-Scroll Executive Dashboard**: 4 kartu ringkasan kesehatan, diagram batang distribusi status gizi, dan daftar _Stunting Alerts_.
- **Kalkulator Z-Score Deterministik**: Perhitungan instan multi-indeks (BB/U, TB/U atau PB/U, BB/TB atau BB/PB) berbasis 730 baris baku Permenkes RI No. 2/2020 dengan _Exact Rational Banker's Rounding_.
- **Formulir Cerdas & Offline Queue**: Input antropometri dengan validasi biologis ketat. Saat sinyal terputus, data otomatis disimpan ke antrean lokal (IndexedDB) dan disinkronisasi ketika koneksi kembali online.
- **Workflow Rujukan Faskes**: Pengajuan rujukan balita dengan indikasi klinis langsung ke Puskesmas pengampu beserta riwayat Z-Score dan nomor rujukan berstandar resmi.

### 🏥 B. Modul Puskesmas (Triage & Manajemen Wilayah)
- **Dashboard Wilayah Agregat**: Agregasi data seluruh Posyandu binaan dalam cakupan faskes (prevalensi stunting, gizi kurang, gizi buruk, dan normal).
- **Pemantauan Posyandu Binaan**: Metrik kepatuhan penimbangan dan rasio balita berisiko per Posyandu.
- **Triage Balita Berisiko Prioritas Tinggi**: Daftar balita prioritas tinggi yang disortir otomatis: `Gizi Buruk -> Stunting -> Gizi Kurang`.
- **Inbox & Aksi Rujukan Faskes**: Menerima, meninjau, menjadwalkan tindakan medis, meresepkan intervensi gizi/PMT pemulihan, hingga rujukan lanjutan ke Rumah Sakit.
- **Pelaporan Wilayah & Ekspor PDF**: Cetak dokumen resmi ringkasan gizi faskes untuk pelaporan ke Dinas Kesehatan.

### 📱 C. Modul Orang Tua (Mobile-First Child Health Portal)
- **Bottom Navigation Seluler**: Antarmuka responsif ramah jempol untuk smartphone orang tua.
- **Kurva Pertumbuhan Standar WHO (Recharts)**: Grafik visual kurva standar WHO (garis median, -2 SD, +2 SD, -3 SD, +3 SD) yang diplot dengan titik pertumbuhan riil balita dari waktu ke waktu.
- **Edukasi Klinis Bahasa Awam**: Menerjemahkan istilah medis teknis (seperti Z-Score SD) menjadi pesan yang menenangkan dan instruksi nutrisi praktis sehari-hari.
- **Sistem Klaim Balita Aman (Claim Code)**: Orang tua menautkan profil balita secara aman menggunakan Kode Klaim acak 8-karakter (diterbitkan Posyandu/Puskesmas dengan masa berlaku 7 hari) dan verifikasi tanggal lahir balita.
- **Peringatan Rujukan & Jadwal Penimbangan**: Notifikasi real-time jika anak memerlukan penimbangan ulang atau tindakan medis lanjutan di faskes.

---

## 4. Keamanan Data & Standar Klinis

1. **Next.js 16 Route Guard (`src/proxy.ts`)**:
   - Memeriksa sesi cookie (`simgizi_session` & `simgizi_role`) di edge middleware/proxy.
   - Mengisolasi hak akses antar role (mencegah Posyandu mengakses rute Puskesmas atau Orang Tua mengakses rekap internal Posyandu).
2. **Perlindungan Privasi Anak (Masking NIK & PII)**:
   - NIK balita disamarkan (`3204************`) pada tampilan publik dan portal orang tua lain.
   - Nama lengkap dan identitas pribadi tidak pernah dikirimkan ke pihak ketiga.
3. **Hardened Gemini AI Clinical Engine**:
   - PII balita di-strip sebelum dikirim ke Google Gemini API (menggunakan placeholder anonim `{nama}`).
   - Header autentikasi via `x-goog-api-key`.
   - Rate limiting 20 request/menit per faskes.
   - Dual-Layer Fail-Safe: Jika API eksternal gagal/timeout/key kosong, modul analisis deterministik lokal tetap menghasilkan saran nutrisi valid berdasar status Z-score.
4. **Validasi Skema Zod Ketat (`src/lib/validation/schemas.ts`)**:
   - Seluruh payload API (Auth, Balita, Pengukuran Antropometri, Rujukan, Klaim) divalidasi ketat sebelum diproses oleh database/repository.

---

## 5. Basis Data & Desain Skema (Supabase Ready)

Skema database PostgreSQL yang lengkap tersedia di [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) dan data seed di [`supabase/seed.sql`](supabase/seed.sql):
- **12 Tabel Utama**: `puskesmas`, `posyandu`, `users`, `anak`, `orang_tua_anak`, `pengukuran`, `kurva_who_reference`, `rujukan`, `tindakan_rujukan`, `jadwal_posyandu`, `notifikasi`, `audit_logs`.
- **Row-Level Security (RLS)**: Enkapsulasi hak baca/tulis per role dan per unit binaan faskes.
- **Dual-Mode Repository Pattern**: Menggunakan abstraksi repository di `src/lib/repositories/`. Jika variabel lingkungan Supabase aktif, data disimpan ke PostgreSQL dengan RLS; jika berjalan secara lokal tanpa Supabase, repository otomatis menggunakan in-memory seed dataset terstruktur tanpa crash.

---

## 6. Struktur Direktori Proyek

```text
SimGizi/
├── .agents/
│   └── AGENTS.md                  # Single Source of Truth: Aturan Desain & Layout Terkunci
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # 12 Tabel DDL, Enums, RLS Policies & Triggers
│   └── seed.sql                   # Seed Data Faskes, Demo Users, Balita & Pengukuran
├── tests/
│   ├── auth.test.ts               # Unit test kredensial demo & isolasi rute role
│   ├── validation.test.ts         # Unit test validasi skema Zod
│   └── zscore.test.ts             # Unit test engine kalkulasi Z-score WHO Permenkes 2020
├── src/
│   ├── app/
│   │   ├── anak/[id]/             # Detail anak & form pengajuan rujukan (Posyandu)
│   │   ├── api/
│   │   │   ├── anak/              # API balita & generator kode klaim
│   │   │   ├── auth/              # API login, logout, me session
│   │   │   ├── export-pdf/        # Generator PDF resmi rekap gizi
│   │   │   ├── orang-tua/klaim/   # API klaim anak oleh orang tua
│   │   │   ├── pengukuran/        # API pencatatan antropometri & kalkulasi Z-score
│   │   │   ├── puskesmas/         # API agregasi dashboard wilayah faskes
│   │   │   ├── rekomendasi-ai/    # AI Gemini API (sanitasi PII + fail-safe)
│   │   │   └── rujukan/           # API pembuatan & update status rujukan
│   │   ├── login/                 # Halaman Autentikasi dengan Quick-Switch 3 Role
│   │   ├── orang-tua/             # Portal Mobile-First Orang Tua (Beranda, Kurva, Jadwal)
│   │   ├── pencatatan-anak/       # Formulir Antropometri Balita (dengan Offline Sync)
│   │   ├── puskesmas/             # Portal Puskesmas (Wilayah, Binaan, Triage, Rujukan)
│   │   ├── rekap-data-gizi/       # Rekapitulasi Data Balita Posyandu
│   │   ├── riwayat-pemeriksaan/   # Log Pemeriksaan Berkala Posyandu
│   │   ├── rujukan/               # Monitoring Rujukan Faskes Posyandu
│   │   ├── layout.tsx             # Root Layout & Global Provider
│   │   └── page.tsx               # Dashboard Utama Posyandu
│   ├── components/
│   │   ├── charts/                # GrowthChart (Recharts) & NutritionChart
│   │   ├── forms/                 # LoginForm, CustomDatePicker, CustomSelect
│   │   ├── layouts/               # Sidebar Desktop, MobileNavOrangTua, Topbar (Offline sync)
│   │   └── rujukan/               # RujukanModal & RujukanTimeline
│   ├── lib/
│   │   ├── auth/                  # Session management & user profile resolver
│   │   ├── constants/             # Token nutrisi, navigasi 3 role, route prefixes
│   │   ├── data/                  # zscore-reference.json (730 baris data resmi baku)
│   │   ├── offline/               # IndexedDB queue untuk penyimpanan offline
│   │   ├── repositories/          # Abstraksi data repository (Supabase & in-memory)
│   │   ├── supabase/              # Client, Server, & Admin Supabase SDK
│   │   ├── validation/            # Skema validasi Zod
│   │   └── zscore.ts              # Engine Z-score WHO Permenkes 2020 & Banker's Rounding
│   ├── types/                     # Single source of truth TypeScript domain interfaces
│   └── proxy.ts                   # Next.js 16 Route Guard & Role Isolation Proxy
├── vitest.config.mts              # Konfigurasi suite testing Vitest
├── package.json                   # Dependensi & script eksekusi proyek
└── README.md
```

---

## 7. Panduan Instalasi & Menjalankan

### 1. Kloning Repository

```bash
git clone https://github.com/moch-firmansyahh/MonitoringGizi-3Role.git
cd MonitoringGizi-3Role
```

### 2. Konfigurasi Environment Variables

Salin `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi konfigurasi (opsional jika menggunakan mode demo lokal):

```env
# Gemini API Key untuk rekomendasi nutrisi klinis
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Supabase Credentials (jika menghubungkan database PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> [!NOTE]
> Jika `GEMINI_API_KEY` atau Supabase belum dikonfigurasi, sistem tetap beroperasi **100% normal dan fungsional** menggunakan modul *Local Deterministic Fail-Safe Engine* dan *In-Memory Seed Data Repository*.

### 3. Instalasi Dependensi

```bash
npm install
```

### 4. Menjalankan Pengujian Otomatis (Unit Testing)

```bash
npm test
```

Suite pengujian Vitest mencakup verifikasi kalkulasi Z-Score WHO Permenkes 2020, pembulatan *Round-Half-To-Even*, validasi skema Zod, dan isolasi navigasi 3 role.

### 5. Menjalankan Server Pengembangan (Development)

```bash
npm run dev
```

Akses aplikasi pada peramban web di `http://localhost:3000`.

### 6. Build Produksi

```bash
npm run build
npm run start
```

---

## 8. Standar & Afiliasi Medis

Dikembangkan sebagai platform sistem informasi kesehatan masyarakat terpadu untuk percepatan pemantauan gizi balita. Standar kalkulasi gizi mengacu pada **Kementerian Kesehatan Republik Indonesia (Permenkes No. 2 Tahun 2020)**.
