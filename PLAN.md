# PLAN.md: Rencana Arsitektur & Eksekusi SimGizi Multi-Role

Dokumen ini merupakan cetak biru (blueprint) arsitektur final, skema basis data, matriks keamanan & otorisasi, keputusan teknologi (ADR), serta pentahapan implementasi pengembangan **SimGizi Multi-Role (Posyandu, Puskesmas, Orang Tua)**.

---

## 1. Jawaban Pertanyaan Terbuka (PRD Bagian 18)

| No | Pertanyaan Terbuka | Keputusan & Solusi Final |
|---|---|---|
| **1** | Apakah dua role baru benar **Puskesmas** dan **Orang Tua**, atau perlu Dinas Kesehatan? | **Tiga Role Baku**: Sesuai judul dan cakupan PRD Addendum, sistem berfokus pada 3 role: `posyandu`, `puskesmas`, dan `orang_tua`. Dinas Kesehatan tidak dimasukkan pada rilis ini agar alur kerja operasional rujukan tetap tajam dan berfokus pada faskes primer. |
| **2** | Apakah Supabase dipakai sebagai backend, atau ada preferensi lain? | **Supabase (PostgreSQL + Supabase Auth + Row Level Security)**. Digunakan `@supabase/ssr` untuk server-side session handling di Next.js 16 (`proxy.ts` dan Server Components/Route Handlers). |
| **3** | Struktur wilayah cukup satu tingkat (Posyandu di bawah Puskesmas), atau perlu kecamatan/kabupaten? | **Satu Tingkat Hierarki**: Posyandu berada langsung di bawah Puskesmas (`posyandu.id_puskesmas -> puskesmas.id`). Ini menyederhanakan agregasi wilayah tanpa redundansi tabel administratif. |
| **4** | Apakah kanal notifikasi di luar aplikasi (WhatsApp, email) diperlukan pada rilis ini? | **In-App Notification First**: Tabel `notifikasi` di database dengan interface polimorfik `NotificationProvider`. Integrasi pihak ketiga (WA/Email gateway) disiapkan sebagai stub adaptor sehingga siap dihubungkan di masa depan tanpa mengubah kode pemanggil. |
| **5** | Target hosting (Vercel atau lainnya) untuk worker dan cron? | **Vercel Serverless / Next.js Standalone**. Scheduled task menggunakan **Next.js Secured Route Handler** (`/api/cron/...`) dengan verifikasi `Bearer CRON_SECRET` (kompatibel dengan Vercel Cron atau Supabase `pg_cron` / `pg_net`), tanpa perlu dependensi broker RabbitMQ eksternal yang memerlukan server stateful khusus. |

---

## 2. Arsitektur Final & Pola Desain (Clean Architecture)

```text
[ Client Layer ]
  ├── Role Posyandu (Desktop Zero-Scroll: Dashboard, Pencatatan, Rekap, Riwayat, Rujukan, Detail Anak)
  ├── Role Puskesmas (Desktop Zero-Scroll: Dashboard Wilayah, Posyandu Binaan, Balita Berisiko, Rujukan, Laporan)
  ├── Role Orang Tua (Mobile-First: Beranda Anak, Perkembangan Kurva WHO, Jadwal, Notifikasi, Klaim Anak)
  └── Offline Sync Engine (IndexedDB Outbox + Idempotent client_uuid + Topbar Status Indicator)
          │
          ▼
[ Proxy & Security Layer ]
  ├── src/proxy.ts (Next.js 16 Route Guard: Supabase Auth Session, Role Verification, Redirect)
  └── CSRF, Rate Limiting & Input Validation (Zod Schema)
          │
          ▼
[ Application & API Layer ] (src/app/api/...)
  ├── /api/auth/me
  ├── /api/anak (CRUD, detail, kode-klaim)
  ├── /api/pengukuran (idempotent, re-calculate Z-Score di server)
  ├── /api/rujukan (pengajuan, audit status rujukan)
  ├── /api/puskesmas/dashboard (agregasi faskes)
  ├── /api/orang-tua/klaim
  ├── /api/rekomendasi-ai (Sanitized prompt tanpa PII, Google Gemini API Header Auth)
  └── /api/export-pdf (Dynamic query database berdasar hak akses role)
          │
          ▼
[ Domain & Engine Layer ] (STRICT LOCKED)
  ├── src/lib/zscore.ts (Engine Z-Score WHO Permenkes No. 2/2020 + Banker's Rounding Float64 BigInt)
  ├── src/lib/data/zscore-reference.json (730 baris baku WHO)
  └── src/lib/constants/ (Single Source of Truth: enum labels, status styles, route config)
          │
          ▼
[ Data Access Layer (Repositories) ] (src/lib/repositories/...)
  ├── anak.repository.ts
  ├── pengukuran.repository.ts
  ├── rujukan.repository.ts
  ├── puskesmas.repository.ts
  ├── orang-tua.repository.ts
  └── notifikasi.repository.ts
          │
          ▼
[ Database & Storage Layer ] (Supabase PostgreSQL)
  └── 12 Tabel + 7 Custom Enum + Row Level Security (RLS) + Audit Logging
```

---

## 3. Skema Basis Data Supabase (DDL & Relasi)

### 3.1 Custom Enums
```sql
CREATE TYPE role_pengguna AS ENUM ('posyandu', 'puskesmas', 'orang_tua');
CREATE TYPE jenis_kelamin AS ENUM ('L', 'P');
CREATE TYPE status_gizi AS ENUM ('normal', 'gizi_kurang', 'gizi_buruk', 'stunting');
CREATE TYPE tingkat_risiko AS ENUM ('rendah', 'sedang', 'tinggi');
CREATE TYPE posisi_ukur AS ENUM ('telentang', 'berdiri');
CREATE TYPE status_rujukan AS ENUM ('diajukan', 'diterima', 'ditindaklanjuti', 'selesai', 'ditolak');
CREATE TYPE sumber_rekomendasi AS ENUM ('ai', 'lokal');
CREATE TYPE jenis_notifikasi AS ENUM (
  'hasil_pengukuran',
  'rujukan_baru',
  'rujukan_status',
  'jadwal_pengingat',
  'peringatan_stunting'
);
```

### 3.2 Tabel Utama & Relasi
1. **`puskesmas`**: `id (uuid pk)`, `nama (varchar)`, `kode (varchar unik)`, `alamat (text)`, `created_at`, `updated_at`.
2. **`posyandu`**: `id (uuid pk)`, `id_puskesmas (uuid fk -> puskesmas.id)`, `nama (varchar)`, `alamat (text)`, `created_at`, `updated_at`.
3. **`profiles`**: `id (uuid pk fk -> auth.users.id ON DELETE CASCADE)`, `nama_lengkap (varchar)`, `role (role_pengguna)`, `id_posyandu (uuid fk -> posyandu.id NULLABLE)`, `id_puskesmas (uuid fk -> puskesmas.id NULLABLE)`, `telepon (varchar)`, `created_at`, `updated_at`.
4. **`anak`**: `id (uuid pk)`, `nik (varchar(16) NOT NULL)`, `nama (varchar NOT NULL)`, `tanggal_lahir (date NOT NULL)`, `jenis_kelamin (jenis_kelamin NOT NULL)`, `nama_orang_tua (varchar NOT NULL)`, `alamat (text)`, `id_posyandu (uuid fk -> posyandu.id NOT NULL)`, `dibuat_oleh (uuid fk -> profiles.id)`, `created_at`, `updated_at`, `deleted_at (timestamptz NULLABLE untuk soft delete)`.
5. **`anak_orang_tua`**: `id_anak (uuid fk -> anak.id)`, `id_orang_tua (uuid fk -> profiles.id)`, `ditautkan_pada (timestamptz DEFAULT now())`, `PRIMARY KEY(id_anak, id_orang_tua)`.
6. **`kode_klaim`**: `id (uuid pk)`, `id_anak (uuid fk -> anak.id)`, `kode (varchar(8) UNIQUE NOT NULL)`, `kedaluwarsa_pada (timestamptz NOT NULL)`, `dipakai_pada (timestamptz NULLABLE)`, `dipakai_oleh (uuid fk -> profiles.id NULLABLE)`, `dibuat_oleh (uuid fk -> profiles.id)`, `created_at`.
7. **`pengukuran`**: 
   - `id (uuid pk)`
   - `client_uuid (uuid UNIQUE NOT NULL)` *(Idempotency key sinkronisasi offline)*
   - `id_anak (uuid fk -> anak.id NOT NULL)`
   - `tanggal_periksa (date NOT NULL)`
   - `usia_bulan (integer NOT NULL)`
   - `berat_kg (numeric(5,2) NOT NULL)`
   - `tinggi_cm (numeric(5,2) NOT NULL)`
   - `posisi_ukur (posisi_ukur NOT NULL)`
   - `z_bbu (numeric(4,2) NOT NULL)` *(Disimpan desimal murni, bukan teks)*
   - `z_tbu (numeric(4,2) NOT NULL)`
   - `z_bbtb (numeric(4,2) NOT NULL)`
   - `status_gizi (status_gizi NOT NULL)`
   - `tingkat_risiko (tingkat_risiko NOT NULL)`
   - `rekomendasi (text NOT NULL)`
   - `rekomendasi_awam (text NOT NULL)` *(Edukasi bahasa ramah orang tua)*
   - `sumber_rekomendasi (sumber_rekomendasi NOT NULL)`
   - `dibuat_oleh (uuid fk -> profiles.id)`
   - `created_at`, `updated_at`, `deleted_at (timestamptz NULLABLE)`
8. **`rujukan`**: `id (uuid pk)`, `id_pengukuran (uuid fk -> pengukuran.id)`, `id_anak (uuid fk -> anak.id)`, `id_posyandu (uuid fk -> posyandu.id)`, `id_puskesmas (uuid fk -> puskesmas.id)`, `status (status_rujukan DEFAULT 'diajukan')`, `catatan (text)`, `alasan_penolakan (text NULLABLE)`, `catatan_tindakan (text NULLABLE)`, `dibuat_oleh (uuid fk -> profiles.id)`, `diperbarui_oleh (uuid fk -> profiles.id)`, `created_at`, `updated_at`.
9. **`rujukan_riwayat`**: `id (uuid pk)`, `id_rujukan (uuid fk -> rujukan.id ON DELETE CASCADE)`, `dari_status (status_rujukan NULLABLE)`, `ke_status (status_rujukan NOT NULL)`, `oleh (uuid fk -> profiles.id)`, `catatan (text)`, `waktu (timestamptz DEFAULT now())`.
10. **`jadwal_kunjungan`**: `id (uuid pk)`, `id_anak (uuid fk -> anak.id)`, `id_posyandu (uuid fk -> posyandu.id)`, `tanggal (date NOT NULL)`, `jenis (varchar NOT NULL)`, `keterangan (text)`, `status (varchar DEFAULT 'dijadwalkan')`, `created_at`, `updated_at`.
11. **`notifikasi`**: `id (uuid pk)`, `id_penerima (uuid fk -> profiles.id NOT NULL)`, `jenis (jenis_notifikasi NOT NULL)`, `judul (varchar NOT NULL)`, `isi (text NOT NULL)`, `tautan (varchar)`, `dibaca (boolean DEFAULT false)`, `created_at`.
12. **`audit_log`**: `id (uuid pk)`, `pelaku (uuid fk -> profiles.id NULLABLE)`, `aksi (varchar NOT NULL)`, `entitas (varchar NOT NULL)`, `id_entitas (uuid NOT NULL)`, `metadata (jsonb)`, `waktu (timestamptz DEFAULT now())`.

---

## 4. Matriks Hak Akses & Kebijakan RLS (Security Matrix)

| Sumber Daya / Aksi | Role: Posyandu | Role: Puskesmas | Role: Orang Tua |
|---|---|---|---|
| **Data Anak** | CRUD anak pada posyandu yang sama (`id_posyandu = profile.id_posyandu`) | SELECT seluruh anak di puskesmas binaannya | SELECT data anak miliknya (`EXISTS in anak_orang_tua`) |
| **Pengukuran** | INSERT & SELECT di posyandunya; SOFT DELETE dengan alasan audit | SELECT seluruh pengukuran di puskesmasnya | SELECT pengukuran anak miliknya |
| **Masking NIK** | NIK lengkap 16 digit (`3201948392010001`) | NIK lengkap 16 digit | NIK dimasking server-side (`3201••••••••0001`) |
| **Rujukan** | INSERT rujukan baru, SELECT riwayat rujukan posyandunya | SELECT seluruh rujukan faskes, UPDATE status (terima/tolak/tindak lanjut/selesai) | SELECT status rujukan anak miliknya |
| **Jadwal Kunjungan** | CRUD jadwal untuk posyandunya | SELECT jadwal seluruh wilayahnya | SELECT jadwal anak miliknya |
| **Kode Klaim** | INSERT kode klaim 8-karakter valid 7 hari | Tidak memiliki akses | Pakai kode klaim via `/api/orang-tua/klaim` |
| **Laporan & Export PDF**| Ekspor rekap data anak posyandunya | Ekspor rekap seluruh puskesmas binaan & per posyandu | Tidak memiliki akses ekspor PDF resmi |

---

## 5. Daftar Keputusan Teknis (Architectural Decision Records)

### ADR-01: Autentikasi Menggunakan `@supabase/ssr` & Server Cookies
- **Konteks**: Mekanisme sebelumnya memakai cookie `simgizi-auth=true` tanpa verifikasi server.
- **Keputusan**: Gunakan Supabase Auth dengan sesi JWT aman (`HttpOnly`, `Secure`, `SameSite=Lax/Strict`). Profil pengguna dan role disimpan di tabel `profiles`.
- **Dukungan Demo Akun**: Akun demo lama `kelompok2` dialokasikan ke email `kader.posyandu@simgizi.id` (password: `simgizi2026`) dengan username mapping di login form agar demo tetap berjalan mulus. Sediakan juga tombol Quick Switch / Prefill demo role di halaman login untuk kemudahan penilaian juri.

### ADR-02: Next.js 16 Route Guard (`src/proxy.ts`)
- **Konteks**: Next.js 16 mengenalkan konvensi `proxy.ts`.
- **Keputusan**: `src/proxy.ts` membaca sesi Supabase dari cookie request, mengambil role pengguna, dan melakukan routing protektif:
  - Belum login -> redirect ke `/login`.
  - Sudah login:
    - Role `posyandu` -> akses `/`, `/pencatatan-anak`, `/rekap-data-gizi`, `/riwayat-pemeriksaan`, `/rujukan`, `/anak/[id]`.
    - Role `puskesmas` -> akses `/puskesmas`, `/puskesmas/posyandu`, `/puskesmas/balita-berisiko`, `/puskesmas/rujukan`, `/puskesmas/laporan`, `/anak/[id]`.
    - Role `orang_tua` -> akses `/orang-tua`, `/orang-tua/perkembangan`, `/orang-tua/jadwal`, `/orang-tua/notifikasi`, `/orang-tua/klaim`.
  - Akses silang role dialihkan otomatis ke root masing-masing role dengan pesan error/toast.
  - Seluruh endpoint `/api/...` (kecuali `/api/auth/login`) diverifikasi di server handler dengan status `401 Unauthorized` atau `403 Forbidden`.

### ADR-03: Penyatuan Tipe Data (Single Source of Truth)
- **Konteks**: Terdapat ketidakcocokan antara `types/index.ts` dan `data-anak.ts` (misal Z-score string vs number, status gizi lowercase vs titlecase, JK "laki-laki" vs "L").
- **Keputusan**:
  - `types/index.ts` menjadi Single Source of Truth.
  - Z-score disimpan sebagai `number` (float64 2 desimal). Helper formatting `formatZScore(val: number): string` menghasilkan string `"-3.10 SD"`.
  - Jenis kelamin di database adalah `'L' | 'P'`. Helper `mapJenisKelaminToZScoreInput` mengonversi `'L' -> 'laki-laki'` dan `'P' -> 'perempuan'` saat memanggil `lib/zscore.ts`.
  - `status_gizi` disimpan dalam enum database `'normal' | 'gizi_kurang' | 'gizi_buruk' | 'stunting'`. Konstanta `STATUS_GIZI_CONFIG` di `lib/constants/nutrition.ts` memetakan enum ke label resmi ("Normal", "Gizi Kurang", "Gizi Buruk", "Stunting"), warna hex, badge Tailwind classes, dan deskripsi.

### ADR-04: Masking & Keamanan NIK Anak
- **Konteks**: NIK adalah Data Pribadi Sensitif (UU PDP).
- **Keputusan**: NIK disimpan utuh di database (Postgres text). Endpoint yang mengembalikan data ke role `orang_tua` wajib memotong dan memasking digit ke-5 hingga ke-12 (`3201••••••••0001`) di sisi server repository layer, sehingga NIK utuh tidak pernah terkirim ke browser orang tua.

### ADR-05: Visualisasi Grafik Pertumbuhan WHO Menggunakan `recharts`
- **Konteks**: Diperlukan grafik kurva pertumbuhan WHO (BB/U, TB/U, BB/TB) dengan pita standar SD (-3, -2, 0, +2, +3) dan titik-titik pengukuran anak.
- **Keputusan**: Gunakan `recharts` (responsif, ringan, beroperasi di client component dengan animasi smooth). Data garis kurva referensi di-generate langsung dari tabel `zscore-reference.json` yang sudah ada, ditumpuk dengan data riwayat anak.

### ADR-06: Arsitektur Ketahanan Offline (IndexedDB Outbox Pattern)
- **Konteks**: Jaringan di Posyandu kerap tidak stabil (sinyal lemah).
- **Keputusan**:
  - Gunakan pustaka ringan `idb` untuk mengelola IndexedDB `simgizi_offline_db` dengan store `pending_pengukuran`.
  - Setiap pengukuran baru di client langsung diberi `client_uuid = crypto.randomUUID()`.
  - Form pencatatan menghitung Z-score di client secara instan melalui `nilaiGiziAnak`.
  - Jika fetch ke `/api/pengukuran` gagal karena network error / offline: simpan record ke IndexedDB, tandai status sinkronisasi `menunggu` di Topbar, dan tampilkan toast informatif ("Data disimpan di antrean offline lokal").
  - Service worker / event listener window `online` memicu proses sinkronisasi otomatis batch (`flushOfflineQueue()`).
  - Server menggunakan constraint `UNIQUE(client_uuid)` dan UPSERT / ON CONFLICT DO NOTHING sehingga pengiriman berulang dijamin aman (idempotent).
  - Server selalu menghitung ulang Z-score secara otoritatif menggunakan `nilaiGiziAnak`.

### ADR-07: AI Security & Privacy Hardening
- **Konteks**: Endpoint AI sebelumnya mengekspos nama anak ke prompt pihak ketiga dan menyertakan API key via query URL.
- **Keputusan**:
  - API Key Gemini dikirimkan via HTTP Header: `x-goog-api-key: process.env.GEMINI_API_KEY`.
  - Prompt ke Gemini menggunakan placeholder tanpa PII: `"Pasien {nama}"`. Nama asli anak disubstitusi di server setelah teks dari Gemini diterima.
  - Validasi ketat menggunakan Zod schema sebelum memproses request.
  - Rate limiting di server: maksimal 20 request per menit per IP/User (menggunakan in-memory sliding window cache pada route handler).
  - Mekanisme fail-safe lokal dipertahankan 100%. Field `sumber_rekomendasi` di database mencatat `'ai'` atau `'lokal'`.

### ADR-08: Pengujian Komprehensif dengan Vitest & React Testing Library
- **Konteks**: Engine Z-Score dan otorisasi membutuhkan kepastian tanpa regresi.
- **Keputusan**: Pasang `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, dan `jsdom`. Buat test suite untuk:
  - 100% kasus uji batas Z-Score WHO (0 bulan, 59 bulan, -3 SD, -2 SD, pembulatan Banker's rounding).
  - Validasi skema input Zod.
  - Logika guard role & otorisasi.
  - Komponen form dan filter.

### ADR-09: Perbaikan ESLint React 19 `react-hooks/set-state-in-effect`
- **Konteks**: Pemeriksaan baseline ESLint menemukan 6 warning/error terkait `setState` di dalam `useEffect` pada `rekap-data-gizi`, `riwayat-pemeriksaan`, `useHasMounted`, dan `useSidebarCollapse`.
- **Keputusan**: Perbaiki pola state sinkronisasi:
  - Pada input pagination: gunakan event handler langsung atau derive state tanpa unnecessary effect cascading.
  - Pada `useHasMounted`: ganti dengan `useSyncExternalStore` yang idiomatik untuk SSR/CSR mounting detection tanpa re-render effect.
  - Pada `useSidebarCollapse`: gunakan subscriber `useSyncExternalStore` untuk membaca local storage secara reaktif.

---

## 6. Struktur Direktori Baru

```text
src/
├── app/
│   ├── api/
│   │   ├── anak/
│   │   │   ├── route.ts                    # GET (list), POST (create anak)
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PATCH, DELETE anak
│   │   │       ├── kurva/route.ts          # GET data kurva pertumbuhan WHO
│   │   │       └── kode-klaim/route.ts     # POST generate claim code
│   │   ├── auth/
│   │   │   ├── login/route.ts              # POST login Supabase
│   │   │   ├── logout/route.ts             # POST logout
│   │   │   └── me/route.ts                 # GET profile & role
│   │   ├── cron/
│   │   │   └── pengingat/route.ts          # Scheduled job pengingat jadwal
│   │   ├── export-pdf/route.ts             # Secured role-based PDF generator
│   │   ├── notifikasi/
│   │   │   ├── route.ts                    # GET notifikasi user
│   │   │   └── [id]/route.ts               # PATCH tandai dibaca
│   │   ├── orang-tua/
│   │   │   └── klaim/route.ts              # POST klaim anak
│   │   ├── pengukuran/route.ts             # GET, POST idempotent pengukuran
│   │   ├── puskesmas/
│   │   │   └── dashboard/route.ts          # GET ringkasan wilayah faskes
│   │   ├── rekomendasi-ai/route.ts         # Secure sanitized Gemini API
│   │   └── rujukan/
│   │       ├── route.ts                    # GET, POST rujukan
│   │       └── [id]/route.ts               # PATCH update status rujukan
│   ├── anak/
│   │   └── [id]/page.tsx                   # Halaman Detail Anak & Riwayat Pertumbuhan
│   ├── login/page.tsx                      # Login terintegrasi Supabase Auth
│   ├── orang-tua/
│   │   ├── layout.tsx                      # Mobile-first Layout & Bottom Nav
│   │   ├── page.tsx                        # Beranda Ringkasan Anak & Status
│   │   ├── perkembangan/page.tsx           # Kurva Pertumbuhan WHO Interaktif
│   │   ├── jadwal/page.tsx                 # Jadwal Penimbangan & Kontrol
│   │   ├── notifikasi/page.tsx             # Pusat Notifikasi & Edukasi
│   │   └── klaim/page.tsx                  # Form Klaim Anak
│   ├── puskesmas/
│   │   ├── layout.tsx                      # Layout Puskesmas (Sidebar Faskes)
│   │   ├── page.tsx                        # Dashboard Agregasi Wilayah & Tren
│   │   ├── posyandu/page.tsx               # Daftar & Monitoring Posyandu Binaan
│   │   ├── balita-berisiko/page.tsx        # Triage Prioritas Balita Berisiko
│   │   ├── rujukan/page.tsx                # Inbox & Manajemen Rujukan Faskes
│   │   └── laporan/page.tsx                # Ekspor Laporan Periodik
│   ├── rujukan/page.tsx                    # Rujukan Aktif Posyandu
│   ├── pencatatan-anak/page.tsx            # Form Posyandu (Offline-Ready)
│   ├── rekap-data-gizi/page.tsx            # Rekap Posyandu (Database-backed)
│   ├── riwayat-pemeriksaan/page.tsx        # Riwayat Posyandu (Database-backed)
│   ├── page.tsx                            # Dashboard Utama Posyandu
│   └── layout.tsx
├── components/
│   ├── _shared/                            # Modal WHO, Modal Detail, Skeletons
│   ├── charts/
│   │   ├── NutritionChart.tsx              # Bar Chart Distribusi
│   │   └── GrowthChart.tsx                 # Grafik Garis Kurva Pertumbuhan WHO
│   ├── dashboard/
│   │   ├── HealthSummary.tsx
│   │   └── StuntingAlerts.tsx
│   ├── forms/
│   │   ├── CustomDatePicker.tsx
│   │   ├── CustomSelect.tsx
│   │   └── LoginForm.tsx
│   ├── layouts/
│   │   ├── Sidebar.tsx                     # Dynamic role-based nav items
│   │   ├── Topbar.tsx                      # Status sinkronisasi offline & profile
│   │   ├── MobileNavOrangTua.tsx           # Bottom bar ramah sentuh
│   │   └── ThemeToggle.tsx
│   ├── rujukan/
│   │   ├── RujukanModal.tsx
│   │   └── RujukanTimeline.tsx
│   └── pdf/
│       └── LaporanGiziDocument.tsx
├── hooks/
│   ├── useAuth.ts                          # Hook autentikasi & profile
│   ├── useDataAnak.ts                      # Adaptor backward-compatible
│   ├── useOfflineSync.ts                   # Monitor status online & sync queue
│   ├── useGrowthChart.ts                   # Kalkulasi data kurva WHO
│   ├── useTheme.ts
│   └── useHasMounted.ts
├── lib/
│   ├── auth/                               # Supabase client & server session helpers
│   ├── constants/
│   │   ├── nutrition.ts                    # Enum mapping, colors, labels
│   │   ├── navigation.ts                   # Sidebar menus per role
│   │   └── routes.ts                       # Public/private route paths
│   ├── data/
│   │   └── zscore-reference.json           # DATA BAKU WHO (TERKUNCI)
│   ├── notifikasi/
│   │   └── notification-service.ts         # In-app notification dispatcher
│   ├── offline/
│   │   └── queue.ts                        # IndexedDB store & sync runner
│   ├── repositories/                       # Data access layer
│   │   ├── anak.repository.ts
│   │   ├── pengukuran.repository.ts
│   │   ├── rujukan.repository.ts
│   │   ├── puskesmas.repository.ts
│   │   └── notifikasi.repository.ts
│   ├── supabase/
│   │   ├── client.ts                       # Browser client
│   │   ├── server.ts                       # Server client (cookies)
│   │   └── admin.ts                        # Service role client (bypassed RLS for seeds/cron)
│   ├── validation/
│   │   └── schemas.ts                      # Zod validation schemas
│   ├── custom-toast.tsx
│   └── zscore.ts                           # ENGINE Z-SCORE WHO (TERKUNCI)
├── types/
│   ├── database.types.ts                   # Supabase generated types
│   └── index.ts                            # Domain models & ApiResponse<T>
└── proxy.ts                                # Next.js 16 Route Guard
```

---

## 7. Rencana Migrasi Data dari `localStorage`

1. **Skrip Migrasi**: Sediakan endpoint `/api/admin/migrate-localstorage` atau komponen migrasi sekali pakai yang membaca data dari `localStorage` (`simgizi_data_anak`).
2. **Transformasi Data**:
   - `AnakRecord` dipetakan ke tabel `anak` dan tabel `pengukuran`.
   - String Z-score seperti `"-3.1 SD"` diparsing menjadi angka desimal `-3.10`.
   - Normalisasi `statusGizi`: `"Stunting" -> 'stunting'`, `"Gizi Kurang" -> 'gizi_kurang'`, `"Gizi Buruk" -> 'gizi_buruk'`, `"Normal" -> 'normal'`.
   - Menghasilkan `client_uuid = crypto.randomUUID()` untuk setiap record lama.
3. **Pembersihan**: Setelah data tersimpan di Supabase, `data-anak-store.ts` dialihkan membaca dari repository, dan seed default dipindahkan ke `supabase/seed.sql`.

---

## 8. Pentahapan Pengerjaan (Phased Execution Plan)

### Fase 1: Fondasi Backend, Autentikasi Supabase & Penyatuan Tipe
- Inisialisasi dependensi: `@supabase/supabase-js`, `@supabase/ssr`, `zod`.
- Buat migrasi SQL Supabase (`supabase/migrations/001_initial_schema.sql` dan `supabase/seed.sql`).
- Penyatuan tipe data di `src/types/index.ts` dan konstanta status di `src/lib/constants/nutrition.ts`.
- Buat lapisan repositori `src/lib/repositories/`.
- Perbarui `LoginForm.tsx` dengan Supabase Auth & prefill demo switcher.
- Pastikan 4 halaman role Posyandu lama (`/`, `/pencatatan-anak`, `/rekap-data-gizi`, `/riwayat-pemeriksaan`) beralih membaca dari repository tanpa merusak tampilan.

### Fase 2: Keamanan, Route Guard Role & AI Hardening
- Implementasi role-aware `src/proxy.ts` (Next 16).
- Buat endpoint API (`/api/anak`, `/api/pengukuran`, `/api/auth/me`).
- Hardening endpoint AI (`/api/rekomendasi-ai`): masking PII, header `x-goog-api-key`, rate limiting, Zod validation.
- Perbarui `/api/export-pdf` agar mengambil data riil dari database sesuai hak akses.
- Perbaiki error ESLint React 19 (`set-state-in-effect`).

### Fase 3: Alur Rujukan & Fitur Role Puskesmas
- Buat halaman Detail Anak `/anak/[id]`.
- Buat sistem rujukan (`/api/rujukan`, modal buat rujukan di Posyandu, halaman `/rujukan`).
- Buat seluruh antarmuka role Puskesmas:
  - `/puskesmas` (Dashboard agregat wilayah).
  - `/puskesmas/posyandu` (Monitoring Posyandu binaan).
  - `/puskesmas/balita-berisiko` (Triage balita).
  - `/puskesmas/rujukan` (Inbox & tindakan rujukan beserta audit riwayat).
  - `/puskesmas/laporan` (Ekspor PDF/CSV wilayah).

### Fase 4: Role Orang Tua, Kode Klaim & Grafik Pertumbuhan WHO
- Pasang pustaka `recharts`.
- Implementasi generator kode klaim 8-karakter di Posyandu (`/api/anak/[id]/kode-klaim`).
- Buat antarmuka mobile-first Orang Tua:
  - `/orang-tua/klaim` (Penautan anak).
  - `/orang-tua` (Ringkasan kondisi anak & edukasi bahasa awam).
  - `/orang-tua/perkembangan` (Grafik kurva pertumbuhan WHO BB/U, TB/U, BB/TB).
  - `/orang-tua/jadwal` (Jadwal posyandu & kontrol faskes).
  - `/orang-tua/notifikasi` (Pemberitahuan hasil penimbangan & rujukan).

### Fase 5: Ketahanan Offline, Notifikasi, Pengujian & Dokumentasi
- Implementasi IndexedDB offline queue (`lib/offline/queue.ts`) dan indikator status sinkronisasi di Topbar.
- Service notifikasi otomatis (`lib/notifikasi/notification-service.ts`) saat pengukuran dan perubahan status rujukan terjadi.
- Siapkan testing harness Vitest + React Testing Library.
- Tulis unit tests (100% engine Z-Score, Banker's rounding, batas umur/status, role guard).
- Pembaruan `README.md` dan dokumentasi instalasi/kredensial multi-role.

### Fase 6 (Opsional): Outbox Pattern & Persistent Event Routing
- Implementasi tabel `outbox_event` dan processor untuk arsitektur event-driven decoupling.

---

## 9. Definition of Done (DoD) Per Fase

Setiap fase dinyatakan selesai jika dan hanya jika:
1. Seluruh kriteria fungsional pada fase tersebut telah diimplementasikan.
2. Tidak ada regresi visual maupun fungsional pada 4 halaman awal role Posyandu (sesuai aturan terkunci `AGENTS.md`).
3. Perintah `npm run lint` selesai tanpa error (0 errors).
4. Perintah `npm run build` selesai tanpa error.
5. Laporan akhir fase diserahkan dengan format baku Bagian 16.2.
