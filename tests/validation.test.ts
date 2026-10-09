import { describe, it, expect } from "vitest";
import {
  createAnakSchema,
  createPengukuranSchema,
  createRujukanSchema,
  klaimAnakSchema,
} from "@/lib/validation/schemas";

describe("Validasi Skema Zod Input SimGizi", () => {
  describe("createAnakSchema", () => {
    it("menerima payload anak yang valid", () => {
      const valid = {
        nik: "3201948392010001",
        nama: "Muhammad Arfan",
        tanggalLahir: "2024-04-12",
        jenisKelamin: "L",
        namaOrangTua: "Rahmat Hidayat",
        alamat: "Bojongsoang",
      };
      const result = createAnakSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("menolak NIK yang kurang atau lebih dari 16 digit", () => {
      const invalid = {
        nik: "12345",
        nama: "Anak",
        tanggalLahir: "2024-01-01",
        jenisKelamin: "L",
        namaOrangTua: "Ortu",
      };
      const result = createAnakSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("menolak jenis kelamin di luar 'L' atau 'P'", () => {
      const invalid = {
        nik: "3201948392010001",
        nama: "Anak",
        tanggalLahir: "2024-01-01",
        jenisKelamin: "X",
        namaOrangTua: "Ortu",
      };
      const result = createAnakSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("createPengukuranSchema", () => {
    it("menolak usia > 59 bulan", () => {
      const invalid = {
        idAnak: "123",
        tanggalPeriksa: "2026-08-12",
        usiaBulan: 65,
        beratKg: 15.0,
        tinggiCm: 90.0,
      };
      const result = createPengukuranSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("menolak tinggi badan < 40 cm atau > 130 cm", () => {
      const invalid = {
        idAnak: "123",
        tanggalPeriksa: "2026-08-12",
        usiaBulan: 24,
        beratKg: 10.0,
        tinggiCm: 30.0,
      };
      const result = createPengukuranSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("klaimAnakSchema", () => {
    it("memvalidasi kode klaim dan tanggal lahir", () => {
      const valid = {
        kodeKlaim: "KLAIM123",
        tanggalLahir: "2024-04-12",
      };
      const result = klaimAnakSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("menolak kode klaim terlalu pendek (< 6 karakter)", () => {
      const invalid = {
        kodeKlaim: "KL",
        tanggalLahir: "2024-04-12",
      };
      const result = klaimAnakSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
