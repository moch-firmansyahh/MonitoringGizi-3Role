-- ==============================================================================
-- SIM GIZI MULTI-ROLE: 001_initial_schema.sql
-- Skema Database PostgreSQL / Supabase Lengkap dengan RLS & Audit Trail
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
    CREATE TYPE role_pengguna AS ENUM ('posyandu', 'puskesmas', 'orang_tua');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE jenis_kelamin AS ENUM ('L', 'P');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE status_gizi AS ENUM ('normal', 'gizi_kurang', 'gizi_buruk', 'stunting');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tingkat_risiko AS ENUM ('rendah', 'sedang', 'tinggi');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE posisi_ukur AS ENUM ('telentang', 'berdiri');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE status_rujukan AS ENUM ('diajukan', 'diterima', 'ditindaklanjuti', 'selesai', 'ditolak');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sumber_rekomendasi AS ENUM ('ai', 'lokal');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE jenis_notifikasi AS ENUM (
        'hasil_pengukuran',
        'rujukan_baru',
        'rujukan_status',
        'jadwal_pengingat',
        'peringatan_stunting'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. HELPER FUNCTION UNTUK UPDATED_AT
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABEL PUSKESMAS & POSYANDU
CREATE TABLE IF NOT EXISTS puskesmas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(150) NOT NULL,
    kode VARCHAR(50) UNIQUE NOT NULL,
    alamat TEXT NOT NULL,
    telepon VARCHAR(25),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_puskesmas_updated_at
BEFORE UPDATE ON puskesmas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS posyandu (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_puskesmas UUID NOT NULL REFERENCES puskesmas(id) ON DELETE RESTRICT,
    nama VARCHAR(150) NOT NULL,
    alamat TEXT NOT NULL,
    rw VARCHAR(10),
    kelurahan VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_posyandu_updated_at
BEFORE UPDATE ON posyandu
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. TABEL PROFILES (Tautkan dengan auth.users jika Supabase Auth aktif)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    nama_lengkap VARCHAR(150) NOT NULL,
    role role_pengguna NOT NULL,
    id_posyandu UUID REFERENCES posyandu(id) ON DELETE SET NULL,
    id_puskesmas UUID REFERENCES puskesmas(id) ON DELETE SET NULL,
    telepon VARCHAR(25),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. TABEL ANAK
CREATE TABLE IF NOT EXISTS anak (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nik VARCHAR(16) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin jenis_kelamin NOT NULL,
    nama_orang_tua VARCHAR(150) NOT NULL,
    alamat TEXT,
    id_posyandu UUID NOT NULL REFERENCES posyandu(id) ON DELETE RESTRICT,
    dibuat_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_anak_updated_at
BEFORE UPDATE ON anak
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_anak_nik ON anak(nik);
CREATE INDEX IF NOT EXISTS idx_anak_posyandu ON anak(id_posyandu);
CREATE INDEX IF NOT EXISTS idx_anak_deleted_at ON anak(deleted_at);

-- 7. TABEL RELASI ANAK - ORANG TUA
CREATE TABLE IF NOT EXISTS anak_orang_tua (
    id_anak UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
    id_orang_tua UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ditautkan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_anak, id_orang_tua)
);

CREATE INDEX IF NOT EXISTS idx_anak_ortu_ortu ON anak_orang_tua(id_orang_tua);

-- 8. TABEL KODE KLAIM ANAK
CREATE TABLE IF NOT EXISTS kode_klaim (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_anak UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
    kode VARCHAR(8) UNIQUE NOT NULL,
    kedaluwarsa_pada TIMESTAMPTZ NOT NULL,
    dipakai_pada TIMESTAMPTZ,
    dipakai_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    dibuat_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kode_klaim_kode ON kode_klaim(kode);
CREATE INDEX IF NOT EXISTS idx_kode_klaim_anak ON kode_klaim(id_anak);

-- 9. TABEL PENGUKURAN (Z-SCORE NUMERIC DENGAN 2 DESIMAL)
CREATE TABLE IF NOT EXISTS pengukuran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_uuid UUID UNIQUE NOT NULL,
    id_anak UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
    tanggal_periksa DATE NOT NULL,
    usia_bulan INT NOT NULL CHECK (usia_bulan >= 0 AND usia_bulan <= 60),
    berat_kg NUMERIC(5, 2) NOT NULL CHECK (berat_kg > 0 AND berat_kg < 60),
    tinggi_cm NUMERIC(5, 2) NOT NULL CHECK (tinggi_cm >= 40 AND tinggi_cm <= 130),
    posisi_ukur posisi_ukur NOT NULL,
    z_bbu NUMERIC(4, 2) NOT NULL,
    z_tbu NUMERIC(4, 2) NOT NULL,
    z_bbtb NUMERIC(4, 2) NOT NULL,
    status_gizi status_gizi NOT NULL,
    tingkat_risiko tingkat_risiko NOT NULL,
    rekomendasi TEXT NOT NULL,
    rekomendasi_awam TEXT,
    sumber_rekomendasi sumber_rekomendasi NOT NULL DEFAULT 'lokal',
    dibuat_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_pengukuran_updated_at
BEFORE UPDATE ON pengukuran
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_pengukuran_anak ON pengukuran(id_anak);
CREATE INDEX IF NOT EXISTS idx_pengukuran_tanggal ON pengukuran(tanggal_periksa);
CREATE INDEX IF NOT EXISTS idx_pengukuran_status ON pengukuran(status_gizi);
CREATE INDEX IF NOT EXISTS idx_pengukuran_client_uuid ON pengukuran(client_uuid);
CREATE INDEX IF NOT EXISTS idx_pengukuran_deleted_at ON pengukuran(deleted_at);

-- 10. TABEL RUJUKAN
CREATE TABLE IF NOT EXISTS rujukan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_pengukuran UUID NOT NULL REFERENCES pengukuran(id) ON DELETE RESTRICT,
    id_anak UUID NOT NULL REFERENCES anak(id) ON DELETE RESTRICT,
    id_posyandu UUID NOT NULL REFERENCES posyandu(id) ON DELETE RESTRICT,
    id_puskesmas UUID NOT NULL REFERENCES puskesmas(id) ON DELETE RESTRICT,
    status status_rujukan NOT NULL DEFAULT 'diajukan',
    catatan TEXT NOT NULL,
    alasan_penolakan TEXT,
    catatan_tindakan TEXT,
    dibuat_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    diperbarui_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_rujukan_updated_at
BEFORE UPDATE ON rujukan
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_rujukan_puskesmas ON rujukan(id_puskesmas);
CREATE INDEX IF NOT EXISTS idx_rujukan_posyandu ON rujukan(id_posyandu);
CREATE INDEX IF NOT EXISTS idx_rujukan_status ON rujukan(status);
CREATE INDEX IF NOT EXISTS idx_rujukan_anak ON rujukan(id_anak);

-- 11. TABEL RIWAYAT STATUS RUJUKAN (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS rujukan_riwayat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_rujukan UUID NOT NULL REFERENCES rujukan(id) ON DELETE CASCADE,
    dari_status status_rujukan,
    ke_status status_rujukan NOT NULL,
    oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    catatan TEXT,
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rujukan_riwayat_rujukan ON rujukan_riwayat(id_rujukan);

-- 12. TABEL JADWAL KUNJUNGAN
CREATE TABLE IF NOT EXISTS jadwal_kunjungan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_anak UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
    id_posyandu UUID NOT NULL REFERENCES posyandu(id) ON DELETE RESTRICT,
    tanggal DATE NOT NULL,
    jenis VARCHAR(100) NOT NULL,
    keterangan TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'dijadwalkan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_jadwal_kunjungan_updated_at
BEFORE UPDATE ON jadwal_kunjungan
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_jadwal_anak ON jadwal_kunjungan(id_anak);
CREATE INDEX IF NOT EXISTS idx_jadwal_posyandu ON jadwal_kunjungan(id_posyandu);
CREATE INDEX IF NOT EXISTS idx_jadwal_tanggal ON jadwal_kunjungan(tanggal);

-- 13. TABEL NOTIFIKASI
CREATE TABLE IF NOT EXISTS notifikasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_penerima UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    jenis jenis_notifikasi NOT NULL,
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    tautan VARCHAR(255),
    dibaca BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifikasi_penerima ON notifikasi(id_penerima, dibaca);

-- 14. TABEL AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pelaku UUID REFERENCES profiles(id) ON DELETE SET NULL,
    aksi VARCHAR(100) NOT NULL,
    entitas VARCHAR(100) NOT NULL,
    id_entitas UUID NOT NULL,
    metadata JSONB,
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entitas ON audit_log(entitas, id_entitas);

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE puskesmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE posyandu ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anak ENABLE ROW LEVEL SECURITY;
ALTER TABLE anak_orang_tua ENABLE ROW LEVEL SECURITY;
ALTER TABLE kode_klaim ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengukuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE rujukan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rujukan_riwayat ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_kunjungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper Function untuk membaca profile user saat ini
CREATE OR REPLACE FUNCTION auth_user_profile()
RETURNS profiles AS $$
    SELECT * FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Pengguna bisa melihat profil sendiri & staf faskes melihat faskes terkait
CREATE POLICY "profiles_select_self" ON profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid() OR
        (auth_user_profile()).role IN ('posyandu', 'puskesmas')
    );

CREATE POLICY "profiles_update_self" ON profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid());

-- Posyandu & Puskesmas: Boleh dibaca oleh pengguna terautentikasi
CREATE POLICY "posyandu_select" ON posyandu
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "puskesmas_select" ON puskesmas
    FOR SELECT TO authenticated
    USING (true);

-- Anak:
-- Posyandu: CRUD anak di posyandunya
-- Puskesmas: Read anak di seluruh posyandu bawahannya
-- Orang Tua: Read anak miliknya
CREATE POLICY "anak_select" ON anak
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL AND (
            ((auth_user_profile()).role = 'posyandu' AND id_posyandu = (auth_user_profile()).id_posyandu)
            OR
            ((auth_user_profile()).role = 'puskesmas' AND id_posyandu IN (
                SELECT id FROM posyandu WHERE id_puskesmas = (auth_user_profile()).id_puskesmas
            ))
            OR
            ((auth_user_profile()).role = 'orang_tua' AND id IN (
                SELECT id_anak FROM anak_orang_tua WHERE id_orang_tua = auth.uid()
            ))
        )
    );

CREATE POLICY "anak_insert_posyandu" ON anak
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth_user_profile()).role = 'posyandu' AND id_posyandu = (auth_user_profile()).id_posyandu
    );

CREATE POLICY "anak_update_posyandu" ON anak
    FOR UPDATE TO authenticated
    USING (
        (auth_user_profile()).role = 'posyandu' AND id_posyandu = (auth_user_profile()).id_posyandu
    );

-- Pengukuran:
CREATE POLICY "pengukuran_select" ON pengukuran
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL AND (
            id_anak IN (SELECT id FROM anak) -- mewarisi kebijakan seleksi anak
        )
    );

CREATE POLICY "pengukuran_insert_posyandu" ON pengukuran
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth_user_profile()).role = 'posyandu'
    );

-- Rujukan:
CREATE POLICY "rujukan_select" ON rujukan
    FOR SELECT TO authenticated
    USING (
        ((auth_user_profile()).role = 'posyandu' AND id_posyandu = (auth_user_profile()).id_posyandu)
        OR
        ((auth_user_profile()).role = 'puskesmas' AND id_puskesmas = (auth_user_profile()).id_puskesmas)
        OR
        ((auth_user_profile()).role = 'orang_tua' AND id_anak IN (
            SELECT id_anak FROM anak_orang_tua WHERE id_orang_tua = auth.uid()
        ))
    );

CREATE POLICY "rujukan_insert_posyandu" ON rujukan
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth_user_profile()).role = 'posyandu' AND id_posyandu = (auth_user_profile()).id_posyandu
    );

CREATE POLICY "rujukan_update_puskesmas" ON rujukan
    FOR UPDATE TO authenticated
    USING (
        (auth_user_profile()).role = 'puskesmas' AND id_puskesmas = (auth_user_profile()).id_puskesmas
    );

-- Notifikasi:
CREATE POLICY "notifikasi_user" ON notifikasi
    FOR ALL TO authenticated
    USING (id_penerima = auth.uid());
