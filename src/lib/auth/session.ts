import { cookies } from "next/headers";
import { UserProfile, RolePengguna } from "@/types";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/lib/constants/routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const DEMO_PROFILES: Record<string, UserProfile & { passwordHash: string }> = {
  // --- 2 Akun Posyandu ---
  kelompok2: {
    id: "c0000000-0000-0000-0000-000000000001",
    username: "kelompok2",
    passwordHash: "simgizi2026",
    namaLengkap: "Bidan Sri Wahyuni, S.Tr.Keb",
    role: "posyandu",
    idPosyandu: "a0000000-0000-0000-0000-000000000001",
    idPuskesmas: "b0000000-0000-0000-0000-000000000001",
    namaPosyandu: "Posyandu Melati 03",
    namaPuskesmas: "Puskesmas Bojongsoang",
    telepon: "081234567890",
  },
  posyandu_mekarsari01: {
    id: "c0000000-0000-0000-0000-000000000004",
    username: "posyandu_mekarsari01",
    passwordHash: "simgizi2026",
    namaLengkap: "Kader Siti Nurhaliza, A.Md.Keb",
    role: "posyandu",
    idPosyandu: "a0000000-0000-0000-0000-000000000002",
    idPuskesmas: "b0000000-0000-0000-0000-000000000001",
    namaPosyandu: "Posyandu Mekar Sari 01",
    namaPuskesmas: "Puskesmas Bojongsoang",
    telepon: "081234567893",
  },

  // --- 2 Akun Puskesmas ---
  puskesmas_bojongsoang: {
    id: "c0000000-0000-0000-0000-000000000002",
    username: "puskesmas_bojongsoang",
    passwordHash: "simgizi2026",
    namaLengkap: "Dr. Hj. Syahla Mutiara Latifah, M.Kes",
    role: "puskesmas",
    idPosyandu: null,
    idPuskesmas: "b0000000-0000-0000-0000-000000000001",
    namaPuskesmas: "Puskesmas Bojongsoang",
    telepon: "081234567891",
  },
  puskesmas_dayeuhkolot: {
    id: "c0000000-0000-0000-0000-000000000005",
    username: "puskesmas_dayeuhkolot",
    passwordHash: "simgizi2026",
    namaLengkap: "Dr. Ahmad Fauzi, Sp.A",
    role: "puskesmas",
    idPosyandu: null,
    idPuskesmas: "b0000000-0000-0000-0000-000000000002",
    namaPuskesmas: "Puskesmas Dayeuhkolot",
    telepon: "081234567894",
  },

  // --- 2 Akun Orang Tua ---
  orangtua_arfan: {
    id: "c0000000-0000-0000-0000-000000000003",
    username: "orangtua_arfan",
    passwordHash: "simgizi2026",
    namaLengkap: "Rahmat Hidayat (Ayah Arfan)",
    role: "orang_tua",
    idPosyandu: null,
    idPuskesmas: null,
    telepon: "081234567892",
  },
  orangtua_aisyah: {
    id: "c0000000-0000-0000-0000-000000000006",
    username: "orangtua_aisyah",
    passwordHash: "simgizi2026",
    namaLengkap: "Hendra Wijaya (Ayah Aisyah)",
    role: "orang_tua",
    idPosyandu: null,
    idPuskesmas: null,
    telepon: "081234567895",
  },
};

/**
 * Membaca profil pengguna aktif saat ini dari server
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const roleCookie = cookieStore.get(ROLE_COOKIE_NAME)?.value as RolePengguna | undefined;

  if (!sessionToken) {
    // Backward compatibility check untuk legacy cookie jika ada
    const legacyAuth = cookieStore.get("simgizi-auth")?.value;
    if (legacyAuth === "true") {
      return DEMO_PROFILES.kelompok2;
    }
    return null;
  }

  // Coba verifikasi dengan Supabase Auth jika client tersedia
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          return {
            id: profile.id,
            username: profile.username || user.email?.split("@")[0] || "user",
            namaLengkap: profile.nama_lengkap,
            role: profile.role as RolePengguna,
            idPosyandu: profile.id_posyandu,
            idPuskesmas: profile.id_puskesmas,
            telepon: profile.telepon,
          };
        }
      }
    } catch {
      // Fallback ke token parser lokal jika network/supabase offline
    }
  }

  // Fallback: Membaca dari demo session token terenkripsi/encoded
  try {
    const decoded = JSON.parse(Buffer.from(sessionToken, "base64").toString("utf-8"));
    if (decoded && decoded.username && DEMO_PROFILES[decoded.username]) {
      const demo = DEMO_PROFILES[decoded.username];
      return {
        id: demo.id,
        username: demo.username,
        namaLengkap: demo.namaLengkap,
        role: (roleCookie || demo.role) as RolePengguna,
        idPosyandu: demo.idPosyandu,
        idPuskesmas: demo.idPuskesmas,
        namaPosyandu: demo.namaPosyandu,
        namaPuskesmas: demo.namaPuskesmas,
        telepon: demo.telepon,
      };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Buat session token aman untuk demo / offline login
 */
export function createDemoSessionToken(username: string): string {
  const payload = {
    username,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}
