# Panduan Akun Multi-Role & Data Master Pengujian CRUD — SimGizi

Dokumen ini memuat daftar lengkap 6 akun pengguna (2 Posyandu, 2 Puskesmas, 2 Orang Tua), data fasilitas kesehatan, NIK balita binaan, parameter antropometri Z-Score WHO, serta panduan skenario pengujian siklus CRUD (*Create, Read, Update, Delete*).

---

## 1. Daftar 6 Akun Pengguna Resmi (Multi-Role)

> 🔑 **Kata Sandi (Password) Seluruh Akun**: `simgizi2026`

| No | Peran (Role) | Username | Kata Sandi | Nama Pengguna / Jabatan | Afiliasi Faskes | Halaman Akses Utama |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Posyandu 1** | `kelompok2` | `simgizi2026` | Bidan Sri Wahyuni, S.Tr.Keb | Posyandu Melati 03 (Puskesmas Bojongsoang) | `/` (Dashboard), `/pencatatan-anak`, `/rekap-data-gizi`, `/riwayat-pemeriksaan`, `/rujukan` |
| **2** | **Posyandu 2** | `posyandu_mekarsari01` | `simgizi2026` | Kader Siti Nurhaliza, A.Md.Keb | Posyandu Mekar Sari 01 (Puskesmas Bojongsoang) | `/` (Dashboard), `/pencatatan-anak`, `/rekap-data-gizi`, `/riwayat-pemeriksaan`, `/rujukan` |
| **3** | **Puskesmas 1** | `puskesmas_bojongsoang` | `simgizi2026` | Dr. Hj. Syahla Mutiara Latifah, M.Kes | Puskesmas Bojongsoang | `/puskesmas` (Dashboard Wilayah), `/puskesmas/posyandu`, `/puskesmas/balita-berisiko`, `/puskesmas/rujukan`, `/puskesmas/laporan` |
| **4** | **Puskesmas 2** | `puskesmas_dayeuhkolot` | `simgizi2026` | Dr. Ahmad Fauzi, Sp.A | Puskesmas Dayeuhkolot | `/puskesmas` (Dashboard Wilayah), `/puskesmas/posyandu`, `/puskesmas/balita-berisiko`, `/puskesmas/rujukan`, `/puskesmas/laporan` |
| **5** | **Orang Tua 1** | `orangtua_arfan` | `simgizi2026` | Rahmat Hidayat (Ayah Arfan) | Wali Muhammad Arfan | `/orang-tua` (Beranda Edukasi), `/orang-tua/perkembangan` (Kurva WHO), `/orang-tua/jadwal`, `/orang-tua/klaim` |
| **6** | **Orang Tua 2** | `orangtua_aisyah` | `simgizi2026` | Hendra Wijaya (Ayah Aisyah) | Wali Aisyah Putri Humaira | `/orang-tua` (Beranda Edukasi), `/orang-tua/perkembangan` (Kurva WHO), `/orang-tua/jadwal`, `/orang-tua/klaim` |

---

## 2. Master Data Fasilitas Kesehatan (Faskes)

### A. Puskesmas Bojongsoang
- **Kepala / Dokter Penanggung Jawab**: Dr. Hj. Syahla Mutiara Latifah, M.Kes
- **Alamat**: Jl. Raya Bojongsoang No. 128, Kab. Bandung
- **Kontak**: 0812-3456-7891
- **Posyandu Binaan**:
  1. **Posyandu Melati 03** (RW 03, Kel. Bojongsoang) — Bidan Sri Wahyuni
  2. **Posyandu Mekar Sari 01** (RW 01, Kel. Lengkong) — Kader Siti Nurhaliza
  3. **Posyandu Mawar 02** (RW 02, Kel. Buahbatu)

### B. Puskesmas Dayeuhkolot
- **Kepala / Dokter Penanggung Jawab**: Dr. Ahmad Fauzi, Sp.A
- **Alamat**: Jl. Raya Dayeuhkolot No. 45, Kab. Bandung
- **Kontak**: 0812-3456-7894
- **Posyandu Binaan**:
  1. **Posyandu Teratai 01** (RW 01, Kel. Dayeuhkolot)
  2. **Posyandu Cempaka 04** (RW 04, Kel. Cangkuang Kulon)

---

## 3. Data Balita Binaan untuk Pengujian CRUD

| No | Nama Balita | NIK (16 Digit) | Tanggal Lahir | Usia | JK | Nama Orang Tua | BB (kg) | TB (cm) | Status Gizi WHO | Z-Score Acuan | Kode Klaim | Posyandu Pembina |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | **Muhammad Arfan** | `3201948392010001` | 12-04-2024 | 28 bln | L | Rahmat Hidayat | 10.1 | 78.5 | **Stunting** | TB/U: `-3.10 SD`<br>BB/TB: `-1.50 SD` | `ARFN2026` | Posyandu Melati 03 |
| **2** | **Aisyah Putri Humaira** | `3201948392010002` | 11-06-2025 | 14 bln | P | Hendra Wijaya | 7.2 | 71.0 | **Gizi Buruk** | BB/TB: `-3.25 SD`<br>TB/U: `-1.80 SD` | `ASYH2026` | Posyandu Mekar Sari 01 |
| **3** | **Kenzo Rafasya** | `3201948392010003` | 10-12-2023 | 32 bln | L | Ferry Irawan | 10.5 | 85.0 | **Stunting** | TB/U: `-2.03 SD`<br>BB/U: `-1.87 SD` | `KNZO2026` | Posyandu Melati 03 |
| **4** | **Zahra Bilqis** | `3201948392010004` | 08-08-2024 | 24 bln | P | Dedi Supardi | 8.4 | 79.0 | **Gizi Kurang** | BB/TB: `-2.15 SD`<br>TB/U: `-1.70 SD` | `ZHRA2026` | Posyandu Melati 03 |
| **5** | **Rafi Ahmad Fauzi** | `3201948392010005` | 05-04-2023 | 40 bln | L | Agus Setiawan | 14.8 | 98.2 | **Normal** | TB/U: `+0.20 SD`<br>BB/TB: `+0.10 SD` | `RAFI2026` | Posyandu Mekar Sari 01 |

---

## 4. Panduan Skenario Pengujian CRUD Lengkap

### Skenario A: CREATE (Pencatatan Balita Baru)
1. Masuk sebagai **Kader Posyandu** (`kelompok2` / `simgizi2026`).
2. Buka menu **Pencatatan Data Anak** (`/pencatatan-anak`).
3. Masukkan data balita baru:
   - Nama Balita: `Bilal Pratama`
   - NIK: `3201948392010006` (16 digit angka)
   - Nama Orang Tua: `Budi Pratama`
   - Jenis Kelamin: `Laki-laki`
   - Umur: `18` Bulan
   - Berat Badan: `11.0` kg
   - Tinggi Badan: `82.5` cm
   - Alamat: `Jl. Melati No. 7`
4. Klik tombol **"Tambah data balita"**.
5. **Hasil**: Data berhasil tersimpan, kalkulasi Z-Score otomatis muncul, dan toast notifikasi sukses ditampilkan.

---

### Skenario B: READ (Pemantauan Data di Berbagai Role)
1. **Di Posyandu** (`/rekap-data-gizi`):
   - Gunakan fitur pencarian NIK `3201948392010001` atau nama `Muhammad Arfan`.
   - Gunakan filter status gizi untuk menyaring hanya balita `Stunting`.
   - Klik baris balita untuk membuka **Modal Detail Anak** yang memuat indikator antropometri dan telaah klinis.
2. **Di Puskesmas** (`/puskesmas/balita-berisiko`):
   - Masuk sebagai `puskesmas_bojongsoang`.
   - Buka menu **Balita Berisiko** untuk melihat daftar triage otomatis: Prioritas 1 (`Gizi Buruk`) $\rightarrow$ Prioritas 2 (`Stunting`) $\rightarrow$ Prioritas 3 (`Gizi Kurang`).
3. **Di Orang Tua** (`/orang-tua/perkembangan`):
   - Masuk sebagai `orangtua_arfan`.
   - Buka menu **Grafik WHO** untuk melihat visualisasi kurva standar WHO (Median, -2 SD, -3 SD) bersama titik pengukuran riil Arfan.

---

### Skenario C: UPDATE (Penimbangan Ulang & Alur Rujukan Faskes)

#### 1. Update Status Gizi Melalui Pengukuran Ulang:
1. Buka menu **Pencatatan Data Anak** (`/pencatatan-anak`).
2. Masukkan NIK Muhammad Arfan: `3201948392010001`.
3. Masukkan data pengukuran terbaru (setelah pemulihan gizi):
   - Usia: `28` Bulan
   - Berat Badan: `12.5` kg (naik dari 10.1 kg)
   - Tinggi Badan: `88.5` cm (naik dari 78.5 cm)
4. Klik **"Tambah data balita"**.
5. **Hasil**: Engine Z-Score menghitung ulang indikator TB/U menjadi $\ge -2.00\text{ SD}$, dan status gizi Arfan otomatis berubah dari **`Stunting`** menjadi **`Normal`**!

#### 2. Update Alur Rujukan Medis di Puskesmas:
1. Sebagai Posyandu, ajukan rujukan untuk balita berisiko melalui tombol **"Buat Rujukan Faskes"** di detail anak.
2. Masuk sebagai Puskesmas (`puskesmas_bojongsoang`), buka `/puskesmas/rujukan`.
3. Klik tombol **"Terima"** $\rightarrow$ Status berubah menjadi `Diterima`.
4. Klik **"Tindak Lanjut"** $\rightarrow$ Masukkan catatan tindakan dokter (contoh: *Pemberian PMT Pemulihan biskuit gizi & suplemen zat besi*).
5. Klik **"Selesaikan"** $\rightarrow$ Rujukan selesai dan audit trail tercatat rapi.

---

### Skenario D: DELETE (Penghapusan Data Balita)
1. Masuk sebagai **Kader Posyandu** (`kelompok2`), buka **Rekap Data Gizi** (`/rekap-data-gizi`).
2. Temukan data balita yang ingin dihapus pada tabel.
3. Klik tombol aksi **Hapus** (ikon tempat sampah).
4. Modal konfirmasi keamanan akan muncul: *"Apakah anda yakin ingin menghapus data ini? Data yang sudah dihapus tidak akan bisa dipulihkan"*.
5. Klik **"Hapus Data"** $\rightarrow$ Data balita dihapus secara permanen dan toast notifikasi muncul.

---

### Skenario E: KLAIM BALITA (Orang Tua Menautkan Anak Baru)
1. Masuk sebagai akun Orang Tua kedua (`orangtua_aisyah` / `simgizi2026`).
2. Buka menu **Klaim Balita** (`/orang-tua/klaim`).
3. Masukkan Kode Klaim: `ASYH2026`.
4. Masukkan Tanggal Lahir Anak: `11-06-2025`.
5. Klik **"Verifikasi & Tautkan Anak"**.
6. **Hasil**: Profil balita Aisyah Putri Humaira berhasil ditautkan ke akun orang tua, dan grafiknya langsung dapat dipantau di portal ayah/bunda.
