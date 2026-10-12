import { describe, it, expect } from "vitest";
import { DEMO_PROFILES } from "@/lib/auth/session";
import { ROLE_NAV_ITEMS, ROLE_HOMEPAGE } from "@/lib/constants/navigation";
import { RolePengguna } from "@/types";

describe("Sistem Autentikasi & Otorisasi Multi-Role", () => {
  describe("Kredensial Profil Demo", () => {
    it("memiliki akun resmi terdaftar (Posyandu, Puskesmas, Orang Tua, Dinkes)", () => {
      const keys = Object.keys(DEMO_PROFILES);
      expect(keys).toContain("kelompok2");
      expect(keys).toContain("posyandu_mekarsari01");
      expect(keys).toContain("puskesmas_bojongsoang");
      expect(keys).toContain("puskesmas_dayeuhkolot");
      expect(keys).toContain("orangtua_arfan");
      expect(keys).toContain("orangtua_aisyah");
      expect(keys).toContain("orangtua_dafa");
      expect(keys).toContain("dinkes_bandung");
      expect(keys.length).toBeGreaterThanOrEqual(7);
    });

    it("memiliki pemetaan role yang valid dan terpisah untuk setiap profil pengguna", () => {
      // Posyandu
      expect(DEMO_PROFILES.kelompok2.role).toBe("posyandu");
      expect(DEMO_PROFILES.posyandu_mekarsari01.role).toBe("posyandu");

      // Puskesmas
      expect(DEMO_PROFILES.puskesmas_bojongsoang.role).toBe("puskesmas");
      expect(DEMO_PROFILES.puskesmas_dayeuhkolot.role).toBe("puskesmas");

      // Orang Tua
      expect(DEMO_PROFILES.orangtua_arfan.role).toBe("orang_tua");
      expect(DEMO_PROFILES.orangtua_aisyah.role).toBe("orang_tua");
      expect(DEMO_PROFILES.orangtua_dafa.role).toBe("orang_tua");

      // Dinkes
      expect(DEMO_PROFILES.dinkes_bandung.role).toBe("dinkes");
    });
  });

  describe("Navigasi & Isolasi Antarmuka", () => {
    const roles: RolePengguna[] = ["posyandu", "puskesmas", "orang_tua", "dinkes"];

    it("menyediakan landing page spesifik untuk setiap role", () => {
      expect(ROLE_HOMEPAGE.posyandu).toBe("/");
      expect(ROLE_HOMEPAGE.puskesmas).toBe("/puskesmas");
      expect(ROLE_HOMEPAGE.orang_tua).toBe("/orang-tua");
      expect(ROLE_HOMEPAGE.dinkes).toBe("/dinkes");
    });

    it("memiliki rute navigasi yang terpisah tanpa cross-access rute internal", () => {
      for (const role of roles) {
        const navItems = ROLE_NAV_ITEMS[role];
        expect(navItems.length).toBeGreaterThan(0);
        for (const item of navItems) {
          expect(item.id).toBeDefined();
          expect(item.label).toBeDefined();
          expect(item.href).toBeDefined();
        }
      }

      // Puskesmas navigasi harus di bawah prefix /puskesmas
      const puskesmasHrefs = ROLE_NAV_ITEMS.puskesmas.map((item) => item.href);
      expect(puskesmasHrefs.every((h) => h.startsWith("/puskesmas"))).toBe(true);

      // Orang tua navigasi harus di bawah prefix /orang-tua
      const orangTuaHrefs = ROLE_NAV_ITEMS.orang_tua.map((item) => item.href);
      expect(orangTuaHrefs.every((h) => h.startsWith("/orang-tua"))).toBe(true);

      // Dinkes navigasi harus di bawah prefix /dinkes
      const dinkesHrefs = ROLE_NAV_ITEMS.dinkes.map((item) => item.href);
      expect(dinkesHrefs.every((h) => h.startsWith("/dinkes"))).toBe(true);
    });
  });
});
