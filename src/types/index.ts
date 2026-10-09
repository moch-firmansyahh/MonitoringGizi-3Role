// src/types/index.ts
// Single Source of Truth untuk Data Models & API Contracts SimGizi Multi-Role

export type RolePengguna = "posyandu" | "puskesmas" | "orang_tua";
export type JenisKelamin = "L" | "P";
export type StatusGizi = "normal" | "gizi_kurang" | "gizi_buruk" | "stunting";
export type TingkatRisiko = "rendah" | "sedang" | "tinggi";
export type PosisiUkur = "telentang" | "berdiri";
export type StatusRujukan = "diajukan" | "diterima" | "ditindaklanjuti" | "selesai" | "ditolak";
export type SumberRekomendasi = "ai" | "lokal";
export type JenisNotifikasi =
  | "hasil_pengukuran"
  | "rujukan_baru"
  | "rujukan_status"
  | "jadwal_pengingat"
  | "peringatan_stunting";

// 1. ENTITAS FASKES
export interface Puskesmas {
  id: string;
  nama: string;
  kode: string;
  alamat: string;
  telepon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Posyandu {
  id: string;
  idPuskesmas: string;
  nama: string;
  alamat: string;
  rw?: string | null;
  kelurahan?: string | null;
  puskesmas?: Puskesmas;
  createdAt?: string;
  updatedAt?: string;
}

// 2. ENTITAS PENGGUNA & AUTH
export interface UserProfile {
  id: string;
  username: string;
  namaLengkap: string;
  role: RolePengguna;
  idPosyandu?: string | null;
  idPuskesmas?: string | null;
  telepon?: string | null;
  namaPosyandu?: string;
  namaPuskesmas?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Backward compatibility untuk Petugas
export type Petugas = UserProfile;
export type PetugasSafe = UserProfile;

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token?: string;
  profile: UserProfile;
  redirectTo: string;
}

// 3. ENTITAS ANAK
export interface Anak {
  id: string;
  nik: string;
  nikMasked?: string;
  nama: string;
  tanggalLahir: string; // YYYY-MM-DD
  jenisKelamin: JenisKelamin;
  namaOrangTua: string;
  alamat?: string | null;
  idPosyandu: string;
  dibuatOleh?: string | null;
  posyandu?: Posyandu;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnakPayload {
  nik: string;
  nama: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin;
  namaOrangTua: string;
  alamat?: string;
  idPosyandu?: string;
}

// 4. ENTITAS PENGUKURAN
export interface Pengukuran {
  id: string;
  clientUuid: string;
  idAnak: string;
  tanggalPeriksa: string; // YYYY-MM-DD
  usiaBulan: number;
  beratKg: number;
  tinggiCm: number;
  posisiUkur: PosisiUkur;
  zBbu: number; // numeric 2 desimal
  zTbu: number;
  zBbtb: number;
  statusGizi: StatusGizi;
  tingkatRisiko: TingkatRisiko;
  rekomendasi: string;
  rekomendasiAwam?: string | null;
  sumberRekomendasi: SumberRekomendasi;
  dibuatOleh?: string | null;
  anak?: Anak;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePengukuranPayload {
  clientUuid?: string;
  idAnak: string;
  tanggalPeriksa: string;
  usiaBulan: number;
  beratKg: number;
  tinggiCm: number;
  posisiUkur?: PosisiUkur;
  zBbu?: number;
  zTbu?: number;
  zBbtb?: number;
  statusGizi?: StatusGizi;
  tingkatRisiko?: TingkatRisiko;
  rekomendasi?: string;
  rekomendasiAwam?: string;
  sumberRekomendasi?: SumberRekomendasi;
}

// 5. ENTITAS RUJUKAN
export interface Rujukan {
  id: string;
  idPengukuran: string;
  idAnak: string;
  idPosyandu: string;
  idPuskesmas: string;
  status: StatusRujukan;
  catatan: string;
  alasanPenolakan?: string | null;
  catatanTindakan?: string | null;
  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  anak?: Anak;
  pengukuran?: Pengukuran;
  posyandu?: Posyandu;
  puskesmas?: Puskesmas;
  riwayat?: RujukanRiwayat[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RujukanRiwayat {
  id: string;
  idRujukan: string;
  dariStatus?: StatusRujukan | null;
  keStatus: StatusRujukan;
  oleh?: string | null;
  namaPelaku?: string;
  catatan?: string | null;
  waktu: string;
}

export interface CreateRujukanPayload {
  idPengukuran: string;
  idAnak: string;
  catatan: string;
}

export interface UpdateRujukanStatusPayload {
  status: StatusRujukan;
  catatan?: string;
  alasanPenolakan?: string;
  catatanTindakan?: string;
}

// 6. KODE KLAIM & RELASI ORANG TUA
export interface KodeKlaim {
  id: string;
  idAnak: string;
  kode: string;
  kedaluwarsaPada: string;
  dipakaiPada?: string | null;
  dipakaiOleh?: string | null;
}

export interface KlaimAnakPayload {
  kodeKlaim: string;
  tanggalLahir: string;
}

// 7. JADWAL KUNJUNGAN
export interface JadwalKunjungan {
  id: string;
  idAnak: string;
  idPosyandu: string;
  tanggal: string; // YYYY-MM-DD
  jenis: string;
  keterangan?: string | null;
  status: "dijadwalkan" | "selesai" | "dibatalkan";
  anak?: Anak;
  posyandu?: Posyandu;
  createdAt?: string;
}

// 8. NOTIFIKASI
export interface Notifikasi {
  id: string;
  idPenerima: string;
  jenis: JenisNotifikasi;
  judul: string;
  isi: string;
  tautan?: string | null;
  dibaca: boolean;
  createdAt: string;
}

// 9. REKOMENDASI AI & GEMINI PAYLOAD
export interface RekomendasiAIRequest {
  nama: string;
  usiaBulan: number;
  jenisKelamin: "L" | "P";
  beratKg: number;
  tinggiCm: number;
  statusGizi: string;
  zScoreBBU: string | number;
  zScoreTBU: string | number;
  zScoreBBTB: string | number;
}

export interface RekomendasiAIResponse {
  rekomendasi: string;
  rekomendasiAwam?: string;
  sumber: SumberRekomendasi;
}

// 10. FORMAT STANDAR RESPONS API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 11. ADAPTOR BACKWARD-COMPATIBILITY: AnakRecord (untuk komponen UI Posyandu yang sudah ada)
export interface AnakRecord {
  id: string;
  nama: string;
  nik: string;
  usiaBulan: number;
  jenisKelamin: "L" | "P";
  namaOrangTua: string;
  beratBadan: number;
  tinggiBadan: number;
  zScoreTBU: string; // e.g. "-3.1 SD"
  zScoreBBU: string;
  zScoreBBTB: string;
  statusGizi: "Normal" | "Gizi Kurang" | "Gizi Buruk" | "Stunting";
  rekomendasiAI: string;
  rekomendasiAwam?: string;
  tanggalPeriksa: string;
  idPengukuran?: string;
}
