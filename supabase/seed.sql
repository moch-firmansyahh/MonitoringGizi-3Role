-- ==============================================================================
-- SIM GIZI MULTI-ROLE: seed.sql
-- Data Awal Faskes, Akun Demo Tiga Role, Data Balita, Pengukuran & Rujukan
-- ==============================================================================

-- 1. PUSKESMAS & POSYANDU
INSERT INTO puskesmas (id, nama, kode, alamat, telepon) VALUES
('b0000000-0000-0000-0000-000000000001', 'Puskesmas Bojongsoang', 'PKM-BJS-01', 'Jl. Sukabirus No. 123, Bojongsoang, Kab. Bandung', '022-2501234')
ON CONFLICT (id) DO NOTHING;

INSERT INTO posyandu (id, id_puskesmas, nama, alamat, rw, kelurahan) VALUES
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Posyandu Melati 03', 'Balai Warga RW 03, Bojongsoang', '03', 'Bojongsoang'),
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Posyandu Mekar Sari 01', 'Balai Warga RW 01, Lengkong', '01', 'Lengkong'),
('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Posyandu Mawar 02', 'Balai Warga RW 02, Buahbatu', '02', 'Buahbatu')
ON CONFLICT (id) DO NOTHING;

-- 2. AKUN PROFIL DEMO
-- Posyandu (Username: kelompok2 / Password: simgizi2026)
INSERT INTO profiles (id, username, nama_lengkap, role, id_posyandu, id_puskesmas, telepon) VALUES
('c0000000-0000-0000-0000-000000000001', 'kelompok2', 'Bidan Sri Wahyuni, S.Tr.Keb', 'posyandu', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '081234567890'),
-- Puskesmas (Username: puskesmas_bojongsoang / Password: simgizi2026)
('c0000000-0000-0000-0000-000000000002', 'puskesmas_bojongsoang', 'Dr. Hj. Syahla Mutiara Latifah, M.Kes', 'puskesmas', NULL, 'b0000000-0000-0000-0000-000000000001', '081234567891'),
-- Orang Tua (Username: orangtua_arfan / Password: simgizi2026)
('c0000000-0000-0000-0000-000000000003', 'orangtua_arfan', 'Rahmat Hidayat (Ayah Arfan)', 'orang_tua', NULL, NULL, '081234567892')
ON CONFLICT (id) DO NOTHING;

-- 3. DATA BALITA
INSERT INTO anak (id, nik, nama, tanggal_lahir, jenis_kelamin, nama_orang_tua, alamat, id_posyandu, dibuat_oleh) VALUES
('d0000000-0000-0000-0000-000000000001', '3201948392010001', 'Muhammad Arfan', '2024-04-12', 'L', 'Rahmat Hidayat', 'Jl. Sukabirus No. 14, RT 02/03', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000002', '3201948392010002', 'Aisyah Putri Humaira', '2025-06-11', 'P', 'Hendra Wijaya', 'Jl. Sukabirus No. 25, RT 01/03', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000003', '3201948392010003', 'Kenzo Rafasya', '2023-12-10', 'L', 'Ferry Irawan', 'Komp. Melati Indah B-10', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000004', '3201948392010004', 'Zahra Bilqis', '2024-08-08', 'P', 'Dedi Supardi', 'Jl. Bojongsoang Kulon No. 8', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000005', '3201948392010005', 'Rafi Ahmad Fauzi', '2023-04-05', 'L', 'Agus Setiawan', 'Jl. Sukabirus Gang Melati 1', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Tautkan Orang Tua ke Anak Arfan
INSERT INTO anak_orang_tua (id_anak, id_orang_tua) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 4. PENGUKURAN AWAL (Z-SCORE NUMERIC 2 DESIMAL)
INSERT INTO pengukuran (
    id, client_uuid, id_anak, tanggal_periksa, usia_bulan, berat_kg, tinggi_cm,
    posisi_ukur, z_bbu, z_tbu, z_bbtb, status_gizi, tingkat_risiko,
    rekomendasi, rekomendasi_awam, sumber_rekomendasi, dibuat_oleh
) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    '2026-08-12', 28, 10.10, 78.50, 'berdiri',
    -2.80, -3.10, -1.50, 'stunting', 'tinggi',
    '[ANALISIS MEDIS KEMENKES RI & WHO] Pasien Muhammad Arfan (28 Bulan) terindikasi status Stunting dengan Z-Score TB/U -3.10 SD. Disarankan evaluasi asupan kalori & rujukan medis ke Faskes.',
    'Tinggi badan ananda Muhammad Arfan saat ini berada di bawah kurva standar usia 28 bulan. Diperlukan pemeriksaan lanjutan dan pemenuhan protein hewani harian bersama tim medis Puskesmas.',
    'lokal', 'c0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    '2026-08-11', 14, 8.10, 71.20, 'telentang',
    -2.10, -2.40, -1.20, 'stunting', 'sedang',
    '[ANALISIS MEDIS KEMENKES RI & WHO] Pasien Aisyah Putri Humaira (14 Bulan) terindikasi status Stunting Moderate. Diberikan PMT protein hewani (2 telur/hari).',
    'Pertumbuhan tinggi ananda Aisyah perlu perhatian khusus. Berikan asupan protein hewani secara teratur (misalnya 2 butir telur sehari) dan pantau kembali bulan depan.',
    'lokal', 'c0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000003',
    '2026-08-10', 32, 11.20, 84.10, 'berdiri',
    -2.30, -2.60, -1.30, 'stunting', 'sedang',
    '[ANALISIS MEDIS KEMENKES RI & WHO] Terindikasi Stunting Ringan-Sedang. Evaluasi MP-ASI & sanitasi air minum rumah tangga.',
    'Ananda Kenzo membutuhkan tambahan gizi berimbang dan pastikan kebersihan air minum keluarga tetap terjaga.',
    'lokal', 'c0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000004',
    '2026-08-08', 24, 11.80, 86.50, 'berdiri',
    0.10, 0.20, -0.10, 'normal', 'rendah',
    '[ANALISIS MEDIS KEMENKES RI & WHO] Pertumbuhan optimal sesuai kurva WHO. Pertahankan stimulasi tumbuh kembang aktif.',
    'Selamat! Pertumbuhan ananda Zahra sangat baik dan berada pada kurva normal sehat. Pertahankan pola makan bergizi seimbang.',
    'lokal', 'c0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000005',
    '2026-08-05', 40, 11.50, 93.00, 'berdiri',
    -2.90, -1.80, -3.20, 'gizi_buruk', 'tinggi',
    '[ANALISIS MEDIS KEMENKES RI & WHO] Terindikasi Gizi Buruk (Severely Wasted). Wajib rujukan segera ke Puskesmas untuk Tatalaksana Gizi Buruk.',
    'Perhatian medis segera diperlukan untuk ananda Rafi. Mohon segera bawa rujukan ini ke Puskesmas untuk penanganan dokter spesialis gizi.',
    'lokal', 'c0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- 5. CONTOH RUJUKAN AKTIF
INSERT INTO rujukan (
    id, id_pengukuran, id_anak, id_posyandu, id_puskesmas,
    status, catatan, dibuat_oleh
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'diajukan',
    'Anak mengalami stunting kronis dengan TB/U -3.10 SD, nafsu makan menurun dalam 2 bulan terakhir. Mohon penanganan lanjutan ahli gizi faskes.',
    'c0000000-0000-0000-0000-000000000001'
),
(
    '10000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'diterima',
    'Indikasi Gizi Buruk Severely Wasted (-3.20 SD). Diterima oleh Puskesmas untuk evaluasi formula F-75/F-100.',
    'c0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- Riwayat Rujukan
INSERT INTO rujukan_riwayat (id_rujukan, dari_status, ke_status, oleh, catatan) VALUES
('10000000-0000-0000-0000-000000000001', NULL, 'diajukan', 'c0000000-0000-0000-0000-000000000001', 'Pengajuan rujukan stunting dari Posyandu Melati 03'),
('10000000-0000-0000-0000-000000000002', NULL, 'diajukan', 'c0000000-0000-0000-0000-000000000001', 'Pengajuan rujukan gizi buruk dari Posyandu Melati 03'),
('10000000-0000-0000-0000-000000000002', 'diajukan', 'diterima', 'c0000000-0000-0000-0000-000000000002', 'Rujukan diterima oleh dr. Syahla. Jadwal konsultasi gizi disiapkan.')
ON CONFLICT DO NOTHING;

-- 6. JADWAL KUNJUNGAN
INSERT INTO jadwal_kunjungan (id_anak, id_posyandu, tanggal, jenis, keterangan) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-09-12', 'Penimbangan Rutin', 'Penimbangan berkala & evaluasi PMT bulanan'),
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-08-20', 'Konsultasi Puskesmas', 'Kunjungan tindak lanjut rujukan ke poli gizi Puskesmas Bojongsoang')
ON CONFLICT DO NOTHING;

-- 7. NOTIFIKASI
INSERT INTO notifikasi (id_penerima, jenis, judul, isi, tautan) VALUES
('c0000000-0000-0000-0000-000000000003', 'hasil_pengukuran', 'Hasil Pemeriksaan Muhammad Arfan', 'Pemeriksaan terbaru pada 12 Agustus 2026 telah dicatat. Klik untuk melihat grafik pertumbuhan.', '/orang-tua/perkembangan'),
('c0000000-0000-0000-0000-000000000002', 'rujukan_baru', 'Rujukan Baru Masuk dari Posyandu Melati 03', 'Balita Muhammad Arfan dirujuk dengan indikasi Stunting kronis.', '/puskesmas/rujukan')
ON CONFLICT DO NOTHING;
