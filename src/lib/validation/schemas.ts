import { z } from "zod";

export const createAnakSchema = z.object({
  nik: z
    .string()
    .length(16, "NIK harus tepat 16 digit angka")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  nama: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  tanggalLahir: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD"),
  jenisKelamin: z.enum(["L", "P"], {
    error: "Jenis kelamin harus L (Laki-laki) atau P (Perempuan)",
  }),
  namaOrangTua: z
    .string()
    .min(2, "Nama orang tua minimal 2 karakter")
    .max(100, "Nama orang tua maksimal 100 karakter"),
  alamat: z.string().optional(),
  idPosyandu: z.string().uuid().optional(),
});

export const createPengukuranSchema = z.object({
  clientUuid: z.string().uuid().optional(),
  idAnak: z.string().min(1, "ID Anak wajib diisi"),
  tanggalPeriksa: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal periksa harus YYYY-MM-DD"),
  usiaBulan: z
    .number()
    .int("Usia harus bilangan bulat")
    .min(0, "Usia minimal 0 bulan")
    .max(59, "Usia maksimal 59 bulan"),
  beratKg: z
    .number()
    .min(0.5, "Berat badan minimal 0.5 kg")
    .max(59.9, "Berat badan maksimal 59.9 kg"),
  tinggiCm: z
    .number()
    .min(40.0, "Tinggi badan minimal 40.0 cm")
    .max(130.0, "Tinggi badan maksimal 130.0 cm"),
  posisiUkur: z.enum(["telentang", "berdiri"]).optional(),
  rekomendasi: z.string().optional(),
  rekomendasiAwam: z.string().optional(),
  sumberRekomendasi: z.enum(["ai", "lokal"]).optional(),
});

export const createRujukanSchema = z.object({
  idPengukuran: z.string().min(1, "ID Pengukuran wajib diisi"),
  idAnak: z.string().min(1, "ID Anak wajib diisi"),
  catatan: z
    .string()
    .min(5, "Catatan rujukan minimal 5 karakter")
    .max(1000, "Catatan rujukan maksimal 1000 karakter"),
});

export const updateRujukanStatusSchema = z.object({
  status: z.enum([
    "diajukan",
    "diterima",
    "ditindaklanjuti",
    "selesai",
    "ditolak",
  ]),
  catatan: z.string().optional(),
  alasanPenolakan: z.string().optional(),
  catatanTindakan: z.string().optional(),
});

export const rekomendasiAiSchema = z.object({
  nama: z.string().min(1).default("Pasien"),
  usiaBulan: z.number().int().min(0).max(59),
  jenisKelamin: z.enum(["L", "P"]),
  beratKg: z.number().positive(),
  tinggiCm: z.number().positive(),
  statusGizi: z.string(),
  zScoreBBU: z.union([z.string(), z.number()]),
  zScoreTBU: z.union([z.string(), z.number()]),
  zScoreBBTB: z.union([z.string(), z.number()]),
});

export const klaimAnakSchema = z.object({
  kodeKlaim: z
    .string()
    .min(6, "Kode klaim minimal 6 karakter")
    .max(10, "Kode klaim maksimal 10 karakter"),
  tanggalLahir: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD"),
});
