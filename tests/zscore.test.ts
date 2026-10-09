import { describe, it, expect } from "vitest";
import {
  pythonRound,
  loadReference,
  nilaiGiziAnak,
  floatToBigIntRatio,
} from "@/lib/zscore";

describe("Engine Z-Score WHO Permenkes 2020", () => {
  const ref = loadReference();

  describe("Exact Banker's Rounding (Round-Half-To-Even)", () => {
    it("membulatkan ke bilangan genap terdekat persis seperti Python 3 round()", () => {
      expect(pythonRound(2.5, 0)).toBe(2);
      expect(pythonRound(3.5, 0)).toBe(4);
      expect(pythonRound(-1.875, 2)).toBe(-1.88);
      expect(pythonRound(-1.865, 2)).toBe(-1.86);
      // Uji Round-Half-To-Even dengan angka dyadic rational eksak IEEE 754 (tanpa distorsi representasi)
      expect(pythonRound(1.125, 2)).toBe(1.12); // digit 2 genap -> 1.12
      expect(pythonRound(1.375, 2)).toBe(1.38); // digit 7 ganjil -> 1.38
    });

    it("menghitung floatToBigIntRatio dengan presisi eksak IEEE 754", () => {
      const ratio = floatToBigIntRatio(0.5);
      // Rasio mantissa / 2^53 bernilai 0.5
      expect(Number(ratio.num) / Number(ratio.den)).toBe(0.5);
      expect(ratio.num > BigInt(0)).toBe(true);
      expect(ratio.den > BigInt(0)).toBe(true);
    });
  });

  describe("Kasus Baseline Baku Permenkes No. 2/2020", () => {
    it("Laki-Laki, 30 Bulan, BB 10.5 kg, TB 85.0 cm wajib menghasilkan BB/U: -1.87 SD, TB/U: -2.03 SD, BB/TB: -1.33 SD", () => {
      const hasil = nilaiGiziAnak(ref, 30, "laki-laki", 10.5, 85.0);

      expect(hasil["BB/U"].z_score).toBe(-1.87);
      expect(hasil["TB/U"].z_score).toBe(-2.03);
      expect(hasil["BB/TB"].z_score).toBe(-1.33);

      expect(hasil["TB/U"].status.toLowerCase()).toContain("stunted");
    });
  });

  describe("Uji Batas Umur Balita (0 dan 59 Bulan)", () => {
    it("Bayi baru lahir 0 bulan perempuan dapat dihitung dengan indeks PB/U dan BB/PB", () => {
      const hasil = nilaiGiziAnak(ref, 0, "perempuan", 3.2, 49.0);
      expect(hasil["BB/U"]).toBeDefined();
      expect(hasil["PB/U"]).toBeDefined();
      expect(hasil["BB/PB"]).toBeDefined();
      expect(typeof hasil["BB/U"].z_score).toBe("number");
    });

    it("Balita usia 59 bulan laki-laki dapat dihitung dengan indeks TB/U dan BB/TB", () => {
      const hasil = nilaiGiziAnak(ref, 59, "laki-laki", 18.0, 110.0);
      expect(hasil["BB/U"]).toBeDefined();
      expect(hasil["TB/U"]).toBeDefined();
      expect(hasil["BB/TB"]).toBeDefined();
      expect(typeof hasil["TB/U"].z_score).toBe("number");
    });
  });

  describe("Perbedaan Jenis Kelamin", () => {
    it("menghasilkan Z-Score berbeda antara Laki-laki dan Perempuan untuk input antropometri yang sama", () => {
      const hasilL = nilaiGiziAnak(ref, 24, "laki-laki", 11.0, 85.0);
      const hasilP = nilaiGiziAnak(ref, 24, "perempuan", 11.0, 85.0);

      expect(hasilL["BB/U"].z_score).not.toBe(hasilP["BB/U"].z_score);
      expect(hasilL["TB/U"].z_score).not.toBe(hasilP["TB/U"].z_score);
    });
  });
});
