# 📚 Katalog Data & Skenario Pengujian (Testing Guide) — SimGizi

Dokumen ini berisi daftar **seluruh akun login** dan **paket data balita siap pakai** untuk menguji alur aplikasi SimGizi, mulai dari deteksi stunting di Posyandu, penanganan di Puskesmas, pemantauan di Orang Tua, hingga pengawasan di Dinas Kesehatan.

> 🔑 **Kata Sandi (Password) Seluruh Akun**: `simgizi2026`  
> 🌐 **URL Halaman Login**: [http://localhost:3000/login](http://localhost:3000/login)

---

## 📋 Daftar Seluruh Akun Pengujian Resmi

| # | Peran (Role) | Tab Login | Username | Password | Nama Profil & Instansi |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Kader Posyandu (Utama)** | Posyandu | `kelompok2` | `simgizi2026` | Bidan Sri Wahyuni, S.Tr.Keb *(Posyandu Melati 03)* |
| **2** | **Kader Posyandu (Wilayah 2)** | Posyandu | `posyandu_mekarsari01` | `simgizi2026` | Kader Siti Nurhaliza, A.Md.Keb *(Posyandu Mekar Sari 01)* |
| **3** | **Dokter Puskesmas (Utama)** | Puskesmas | `puskesmas_bojongsoang` | `simgizi2026` | Dr. Hj. Syahla Mutiara Latifah, M.Kes *(Puskesmas Bojongsoang)* |
| **4** | **Dokter Puskesmas (Wilayah 2)**| Puskesmas | `puskesmas_dayeuhkolot` | `simgizi2026` | Dr. Ahmad Fauzi, Sp.A *(Puskesmas Dayeuhkolot)* |
| **5** | **Orang Tua (Wali Arfan)** | Orang Tua | `orangtua_arfan` | `simgizi2026` | Rahmat Hidayat *(Ayah Muhammad Arfan)* |
| **6** | **Orang Tua (Wali Aisyah)** | Orang Tua | `orangtua_aisyah` | `simgizi2026` | Hendra Wijaya *(Ayah Aisyah Putri Humaira)* |
| **7** | **Orang Tua (Wali Dafa)** | Orang Tua | `orangtua_dafa` | `simgizi2026` | Ibrahim Hasan *(Ayah Dafa Ibrahim)* |
| **8** | **Orang Tua (Wali Kenzo)** | Orang Tua | `orangtua_kenzo` | `simgizi2026` | Ferry Irawan *(Ayah Kenzo Rafasya)* |
| **9** | **Dinas Kesehatan (Dinkes)** | Dinkes | `dinkes_bandung` | `simgizi2026` | Dra. Hj. Nunung Nurhayati, M.Si *(Dinkes Kab. Bandung)* |

---

## 🧪 Skenario 1: Kasus Stunting Berat (Alur Utama End-to-End)
> **Tujuan**: Menguji alur deteksi stunting darurat, pembuatan tiket rujukan otomatis, resep PMT dokter, notifikasi orang tua, dan audit log Dinkes.

### 1. Data Login yang Digunakan
1. **Posyandu**: `kelompok2` / `simgizi2026`
2. **Puskesmas**: `puskesmas_bojongsoang` / `simgizi2026`
3. **Orang Tua**: `orangtua_arfan` / `simgizi2026` *(Rahmat Hidayat)*
4. **Dinkes**: `dinkes_bandung` / `simgizi2026`

### 2. Data Input Penimbangan Balita
- **Halaman**: [http://localhost:3000/pencatatan-anak](http://localhost:3000/pencatatan-anak)
- **Nama Balita**: `Muhammad Arfan`
- **NIK (16 Digit)**: `3201948392010001` *(atau `3201948392010099` jika NIK sudah pernah disimpan)*
- **Nama Orang Tua**: `Rahmat Hidayat`
- **Jenis Kelamin**: `Laki-laki`
- **Umur (Bulan)**: `28`
- **Berat Badan (kg)**: `10.1`
- **Tinggi Badan (cm)**: `78.5`
- **Alamat**: `Jl. Sukabirus No. 14, RT 02/03`

### 3. Hasil & Bukti Pengujian
- **Status Gizi**: **`Stunting`** (Z-Score TB/U = `-3.61 SD`).
- **Puskesmas**: Tiket rujukan otomatis masuk ke [http://localhost:3000/puskesmas/rujukan](http://localhost:3000/puskesmas/rujukan).
- **Orang Tua (`orangtua_arfan`)**: Notifikasi lonceng berdering & status rujukan tampil di [http://localhost:3000/orang-tua](http://localhost:3000/orang-tua).
- **Dinkes**: Tercatat di log aktivitas [http://localhost:3000/dinkes/audit-log](http://localhost:3000/dinkes/audit-log).

---

## 🧪 Skenario 2: Kasus Gizi Buruk (Wasting Akut / Rujukan Segera)
> **Tujuan**: Menguji deteksi balita dengan bobot sangat rendah terhadap tinggi badannya (Severe Wasting) yang membutuhkan intervensi gizi darurat.

### 1. Data Login yang Digunakan
1. **Posyandu**: `kelompok2` / `simgizi2026`
2. **Puskesmas**: `puskesmas_bojongsoang` / `simgizi2026`
3. **Orang Tua**: `orangtua_dafa` / `simgizi2026` *(Ibrahim Hasan)*
4. **Dinkes**: `dinkes_bandung` / `simgizi2026`

### 2. Data Input Penimbangan Balita
- **Halaman**: [http://localhost:3000/pencatatan-anak](http://localhost:3000/pencatatan-anak)
- **Nama Balita**: `Dafa Ibrahim`
- **NIK (16 Digit)**: `3201948392010005` *(atau `3201948392010095`)*
- **Nama Orang Tua**: `Ibrahim Hasan`
- **Jenis Kelamin**: `Laki-laki`
- **Umur (Bulan)**: `12`
- **Berat Badan (kg)**: `6.8`
- **Tinggi Badan (cm)**: `73.5`
- **Alamat**: `Kp. Bojongsoang RW 04`

### 3. Hasil & Bukti Pengujian
- **Status Gizi**: **`Gizi Buruk`** (Z-Score BB/TB < `-3.0 SD`).
- **Puskesmas**: Notifikasi triage peringatan dini kasus Gizi Buruk muncul pada dashboard Puskesmas.
- **Rujukan**: Masuk ke daftar penanganan prioritas tinggi Poli Gizi Puskesmas.
- **Orang Tua (`orangtua_dafa`)**: Login di [http://localhost:3000/login](http://localhost:3000/login), portal memuat kartu kesehatan ananda Dafa Ibrahim dengan status gizi buruk dan rujukan aktif.

---

## 🧪 Skenario 3: Kasus Gizi Kurang (Underweight / Edukasi PMT)
> **Tujuan**: Menguji balita yang berat badannya kurang namun tidak stunting. Sistem memberikan anjuran konseling gizi tanpa menerbitkan rujukan darurat.

### 1. Data Login yang Digunakan
1. **Posyandu**: `kelompok2` / `simgizi2026`
2. **Orang Tua**: `orangtua_kenzo` / `simgizi2026` *(Ferry Irawan)*
3. **Dinkes**: `dinkes_bandung` / `simgizi2026`

### 2. Data Input Penimbangan Balita
- **Halaman**: [http://localhost:3000/pencatatan-anak](http://localhost:3000/pencatatan-anak)
- **Nama Balita**: `Kenzo Rafasya`
- **NIK (16 Digit)**: `3201948392010003` *(atau `3201948392010093`)*
- **Nama Orang Tua**: `Ferry Irawan`
- **Jenis Kelamin**: `Laki-laki`
- **Umur (Bulan)**: `32`
- **Berat Badan (kg)**: `11.2`
- **Tinggi Badan (cm)**: `89.5`
- **Alamat**: `Jl. Ciganitri Barat No. 8`

### 3. Hasil & Bukti Pengujian
- **Status Gizi**: **`Gizi Kurang`** (Z-Score BB/U = `-1.8 SD s.d. -2.2 SD`).
- **Rekomendasi AI**: Edukasi asupan gizi seimbang, pemberian makanan tambahan (PMT lokal telur & ikan), serta jadwal pantau bulan depan.
- **Rujukan**: Tidak dibuat rujukan ke Puskesmas (cukup pantau berkala di Posyandu).
- **Orang Tua (`orangtua_kenzo`)**: Melihat grafik kurva tumbuh kembang Kenzo Rafasya di portal orang tua.

---

## 🧪 Skenario 4: Kasus Balita Normal (Tumbuh Sehat & Ideal)
> **Tujuan**: Menguji balita dengan kurva pertumbuhan ideal sesuai standar baku WHO & Permenkes RI.

### 1. Data Login yang Digunakan
1. **Posyandu**: `kelompok2` / `simgizi2026`
2. **Dinkes**: `dinkes_bandung` / `simgizi2026`

### 2. Data Input Penimbangan Balita
- **Halaman**: [http://localhost:3000/pencatatan-anak](http://localhost:3000/pencatatan-anak)
- **Nama Balita**: `Siti Khadijah`
- **NIK (16 Digit)**: `3201948392010088`
- **Nama Orang Tua**: `Ahmad Fauzan`
- **Jenis Kelamin**: `Perempuan`
- **Umur (Bulan)**: `24`
- **Berat Badan (kg)**: `11.5`
- **Tinggi Badan (cm)**: `86.5`
- **Alamat**: `Kompleks Asri No. 12`

### 3. Hasil & Bukti Pengujian
- **Status Gizi**: **`Normal`** (Badge hijau, seluruh indeks Z-Score berada dalam rentang `-1 SD s.d. +1 SD`).
- **Rekomendasi AI**: Memberikan apresiasi pada orang tua dan menyarankan mempertahankan pola makan sehat & stimulasi motorik.

---

## 🧪 Skenario 5: Posyandu Wilayah 2 & Puskesmas Dayeuhkolot
> **Tujuan**: Menguji independensi antar-wilayah (multi-tenancy faskes). Data Posyandu Mekar Sari 01 terhubung ke Puskesmas Dayeuhkolot dan Orang Tua Aisyah.

### 1. Data Login yang Digunakan
1. **Posyandu 2**: `posyandu_mekarsari01` / `simgizi2026` *(Kader Siti Nurhaliza)*
2. **Puskesmas 2**: `puskesmas_dayeuhkolot` / `simgizi2026` *(Dr. Ahmad Fauzi, Sp.A)*
3. **Orang Tua 2**: `orangtua_aisyah` / `simgizi2026` *(Hendra Wijaya)*

### 2. Data Input Penimbangan Balita
- **Nama Balita**: `Aisyah Putri Humaira`
- **NIK (16 Digit)**: `3201948392010002`
- **Nama Orang Tua**: `Hendra Wijaya`
- **Jenis Kelamin**: `Perempuan`
- **Umur (Bulan)**: `14`
- **Berat Badan (kg)**: `8.1`
- **Tinggi Badan (cm)**: `71.2`
- **Alamat**: `Jl. Radio No. 5, Dayeuhkolot`

### 3. Hasil & Bukti Pengujian
- Rujukan diarahkan secara otomatis ke **Puskesmas Dayeuhkolot**.
- Saat login sebagai `orangtua_aisyah`, portal hanya memuat data ananda Aisyah Putri Humaira.

---

## 🔄 Cara Reset Data (Untuk Pengujian Berulang Kali)

Jika Anda ingin mengulang pengujian dari awal (agar data input sebelumnya bersih kembali):

### Cara 1: Lewat Tombol UI
1. Login sebagai akun Posyandu (`kelompok2`).
2. Masuk ke halaman **Rekap Data Gizi** ([http://localhost:3000/rekap-data-gizi](http://localhost:3000/rekap-data-gizi)).
3. Klik tombol **"Reset Data Uji"** di pojok kanan atas ➔ seluruh data anak, rujukan, dan log audit akan kembali ke status default awal.

### Cara 2: Lewat Panggilan API (Browser / cURL)
Buka URL berikut langsung di peramban Anda:
```text
http://localhost:3000/api/reset-data
```
Respon sukses:
```json
{
  "success": true,
  "message": "Seluruh data pengujian (anak, rujukan, notifikasi, audit log) berhasil di-reset ke kondisi awal."
}
```

---

## 💡 Tips Cepat Saat Pengujian
1. **Ingin membuka 4 peran sekaligus?**
   - Gunakan 4 jendela peramban berbeda:
     1. Chrome Biasa ➔ Posyandu (`kelompok2`)
     2. Chrome Mode Incognito (Samaran) ➔ Puskesmas (`puskesmas_bojongsoang`)
     3. Microsoft Edge Biasa ➔ Orang Tua (`orangtua_arfan` atau `orangtua_dafa`)
     4. Microsoft Edge Mode InPrivate ➔ Dinkes (`dinkes_bandung`)
2. **Validasi NIK**: Harus tepat **16 digit angka**. Bila NIK sudah ada di sistem, cukup ubah digit terakhir (misal dari `...0001` ke `...0099`).
3. **Worker Antrean**: Pastikan `npm run worker` menyala di terminal kedua agar setiap event tercetak secara langsung di konsol.
