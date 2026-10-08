# SimGizi — Sistem Informasi Gizi Anak & Deteksi Dini Stunting

<p align="center">
  <strong>Platform Pemantauan Status Antropometri & Deteksi Dini Stunting Balita Berbasis Standar WHO dan Rekomendasi AI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google" alt="Gemini API" />
  <img src="https://img.shields.io/badge/Standar-WHO_Permenkes_2020-0d472c?style=for-the-badge" alt="WHO Permenkes 2020" />
</p>

---

## 1. Deskripsi Proyek

**SimGizi (Sistem Informasi Gizi Anak dan Deteksi Dini Stunting)** merupakan aplikasi berbasis web kesehatan berbasis kecerdasan buatan (AI) yang dikembangkan untuk mempermudah tenaga kesehatan, kader Posyandu, dan pengelola program gizi masyarakat dalam melakukan pemantauan tumbuh kembang balita usia 0–59 bulan.

SimGizi mentransformasi pencatatan manual buku KMS konvensional menjadi ekosistem digital cerdas melalui:

1. **Otomatisasi Kalkulasi Z-Score Deterministik** berdasar 730 baris data baku Permenkes RI No. 2 Tahun 2020 dengan algoritma _Exact Rational Banker's Rounding_ berakurasi 100%.
2. **Sistem Rekomendasi Klinis Terpersonalisasi** menggunakan Google Gemini AI dengan _Dual-Layer Fail-Safe_ lokal.
3. **Single-Screen Zero-Scroll Layout** yang teroptimasi secara adaptif untuk layar monitor desktop maupun laptop.
4. **Pelaporan Digital Instan (Export PDF)** siap cetak untuk diserahkan ke Puskesmas atau Dinas Kesehatan.

---

## 2. Fitur Utama & Inovasi

### 📊 A. Dashboard Eksekutif & Peringatan Dini

- **4 Kartu Metrik Ringkasan Kesehatan**: Total Balita, Gizi Normal, Gizi Kurang/Buruk, dan Terindikasi Stunting.
- **Grafik Distribusi Interaktif**: Visualisasi perbandingan proporsi status gizi anak secara _real-time_.
- **Panel Stunting Alerts**: Deteksi dini darurat yang langsung menyorot balita berisiko tinggi agar segera mendapat intervensi medis.

### 🩺 B. Kalkulator Z-Score Otomatis (Standar WHO / Permenkes No. 2/2020)

- Menghitung 3 multi-indeks antropometri: **BB/U** (Berat Badan menurut Umur), **TB/U atau PB/U** (Tinggi/Panjang Badan menurut Umur), dan **BB/TB atau BB/PB** (Berat Badan menurut Tinggi/Panjang Badan).
- Menggunakan algoritma pembulatan **Exact Rational Banker's Rounding** berbasis BigInt yang identik 100% dengan Python 3 `round(val, 2)` (teruji 99.13% pada 39.425 dataset independen).

### 🤖 C. Rekomendasi Klinis AI (Google Gemini 2.5 Flash & Fail-Safe)

- Rekomendasi nutrisi makro/mikro, panduan Pemberian Makanan Tambahan (PMT), stimulasi perkembangan, dan jadwal rujukan.
- **Dual-Layer Fail-Safe Guarantee**: Jika API key belum terpasang atau kuota habis, sistem otomatis menyusun analisis lokal berbasis Z-score resmi sehingga data balita 100% selalu tersimpan aman.

### 📝 D. Pencatatan Antropometri & Multi-Error Toast

- Formulir entri data balita dengan validasi NIK 16 digit, usia 0–59 bulan, batas biologis berat (0–60 kg), dan tinggi badan (45–110/120 cm).
- Notifikasi bertumpuk (_Stacked Toasts_) yang mampu menampilkan hingga 4 pesan kesalahan input secara elegan.

### 📑 E. Rekapitulasi Data Gizi & Ekspor Laporan PDF

- Tabel data balita terintegrasi dengan filter pencarian nama/NIK, filter dropdown status gizi, filter kalender (`CustomDatePicker`), serta modal Detail dan Hapus.
- Ekspor laporan rekapitulasi gizi resmi berstandar Dinas Kesehatan ke dalam format PDF siap cetak.

### 🕒 F. Riwayat Pemeriksaan Longitudinal

- Log kronologis seluruh sesi penimbangan dan pengukuran balita dari waktu ke waktu untuk mendeteksi _growth faltering_ sedini mungkin.

---

## 3. Tech Stack & Arsitektur

| Layer           | Teknologi                   | Peran & Keunggulan                                                                    |
| :-------------- | :-------------------------- | :------------------------------------------------------------------------------------ |
| **Framework**   | **Next.js 16 (App Router)** | Server & Client Components, Route Handlers, Turbopack, dan Middleware Proxy.          |
| **UI Library**  | **React 19**                | Deklaratif UI dengan performa render tinggi dan _type-safe_.                          |
| **Bahasa**      | **TypeScript 5/6**          | _Strict type-safety_ mutlak di seluruh komponen dan model data.                       |
| **Styling**     | **Tailwind CSS v4**         | Palet token warna terkunci, responsivitas vertikal, dan _Zero-Blink Dark/Light Mode_. |
| **State Store** | **`useSyncExternalStore`**  | Penyimpanan reaktif _client-side_ berbasis `localStorage` bebas _hydration mismatch_. |
| **AI Model**    | **Google Gemini 2.5 Flash** | _Server-side AI route handler_ dengan _clinical guardrails_ berstandar Kemenkes RI.   |
| **Dokumen PDF** | **@react-pdf/renderer**     | Engine generator dokumen PDF dinamis beresolusi tajam.                                |
| **Komponen UI** | **Lucide React & Sonner**   | Ikon vektor modern dan sistem notifikasi toast bertumpuk (_folded deck_).             |

---

## 4. Standar Klasifikasi Z-Score WHO

SimGizi mengacu pada Buku Standar Antropometri Anak Kemenkes RI (Permenkes No. 2 Tahun 2020):

| Status Gizi     | Ambang Batas Z-Score (SD)                     | Indeks Antropometri Acuan                  |
| :-------------- | :-------------------------------------------- | :----------------------------------------- |
| **Normal**      | $-2.00 \text{ SD} \le Z \le +2.00 \text{ SD}$ | BB/U, TB/U (PB/U), BB/TB (BB/PB)           |
| **Gizi Kurang** | $-3.00 \text{ SD} \le Z < -2.00 \text{ SD}$   | BB/TB (_Wasted_) atau BB/U (_Underweight_) |
| **Gizi Buruk**  | $Z < -3.00 \text{ SD}$                        | BB/TB (_Severely Wasted_)                  |
| **Stunting**    | $Z < -2.00 \text{ SD}$                        | TB/U atau PB/U (_Stunted_)                 |

---

## 5. Struktur Direktori Proyek

```text
SimGizi/
├── .agents/
│   └── AGENTS.md                  # Single Source of Truth: Aturan Desain & Layout Terkunci
├── public/                        # Aset gambar statis, logo, dan favicon
├── userflow/                      # 9 File Diagram Userflow PlantUML (.puml)
├── PRD_SimGizi.md                 # Laporan Product Requirements Document Lengkap
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── export-pdf/        # Endpoint API pembuatan PDF rekap gizi
│   │   │   └── rekomendasi-ai/    # Endpoint API integrasi Google Gemini API
│   │   ├── login/                 # Halaman Autentikasi Pengguna
│   │   ├── pencatatan-anak/       # Halaman Formulir Input Antropometri Balita
│   │   ├── rekap-data-gizi/       # Halaman Rekapitulasi Data & Tabel Analisis
│   │   ├── riwayat-pemeriksaan/   # Halaman Riwayat Sesi Pemeriksaan Posyandu
│   │   ├── layout.tsx             # Root Layout, Font Provider & Toaster
│   │   └── page.tsx               # Halaman Utama (Dashboard Monitoring)
│   ├── components/
│   │   ├── _shared/               # Modal WHO, Modal Detail, Modal Hapus, Skeletons
│   │   ├── charts/                # Komponen Visualisasi Bar Chart Distribusi Gizi
│   │   ├── dashboard/             # HealthSummary dan StuntingAlerts
│   │   ├── forms/                 # CustomDatePicker, CustomSelect, Form Input
│   │   ├── layouts/               # Sidebar Desktop/Mobile, Topbar, ThemeToggle
│   │   └── pdf/                   # Template Dokumen PDF (LaporanGiziDocument)
│   ├── hooks/                     # Custom Hooks (useTheme, useDataAnak, useHasMounted)
│   ├── lib/
│   │   ├── data/
│   │   │   └── zscore-reference.json  # 730 baris data baku WHO Permenkes 2020
│   │   ├── custom-toast.tsx       # Sistem notifikasi toast custom
│   │   ├── data-anak-store.ts     # Persistent store data anak (localStorage)
│   │   └── zscore.ts              # Engine kalkulasi Z-score WHO & Exact Banker's Rounding
│   ├── styles/
│   │   └── globals.css            # Token palet warna, CSS variables, & styling global
│   ├── types/                     # Definisi TypeScript Interface & Data Models
│   └── proxy.ts                   # Next.js Route Guard & Session Proxy Middleware
├── .env.local                     # Konfigurasi Environment Variables (Gemini API)
├── package.json                   # Dependensi & script eksekusi proyek
├── tsconfig.json                  # Konfigurasi TypeScript Compiler
└── next.config.mjs                # Konfigurasi Next.js
```

---

## 6. Panduan Instalasi & Menjalankan

### 1. Prasyarat Sistem

- **Node.js** versi `18.18.0` atau yang lebih baru.
- **npm** (atau package manager: `pnpm` / `yarn`).

### 2. Kloning Repository

```bash
git clone https://github.com/Central-Computer-Improvement/The-Hack-2026-2-FE.git
cd The-Hack-2026-2-FE
```

### 3. Konfigurasi Environment Variable

Buat file `.env.local` pada direktori root proyek:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Model Gemini yang Digunakan
GEMINI_MODEL=gemini-2.5-flash
```

> [!NOTE]
> Jika `GEMINI_API_KEY` tidak diisi, SimGizi tetap berjalan 100% normal dengan memanfaatkan modul _Local Deterministic Fail-Safe Engine_.

### 4. Instalasi Dependensi

```bash
npm install
```

### 5. Menjalankan Server Pengembangan (Development)

```bash
npm run dev
```

Akses aplikasi melalui peramban web di `http://localhost:3000`.

### 6. Build Produksi

```bash
npm run build
npm run start
```

---

## 7. Kredensial Demo

Gunakan akun resmi demo berikut pada halaman `/login`:

- **Username**: `kelompok2`
- **Password**: `simgizi2026`

---
