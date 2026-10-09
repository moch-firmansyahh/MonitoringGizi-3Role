import { NextResponse } from "next/server";
import { DEMO_PROFILES, createDemoSessionToken } from "@/lib/auth/session";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/lib/constants/routes";
import { ROLE_HOMEPAGE } from "@/lib/constants/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cleanUsername = String(body.username || "").trim().toLowerCase();
    const cleanPassword = String(body.password || "").trim();

    if (!cleanUsername || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: "Username dan password wajib diisi." },
        { status: 400 },
      );
    }

    // 1. Coba login via Supabase Auth jika terkonfigurasi
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: cleanUsername.includes("@")
              ? cleanUsername
              : `${cleanUsername}@simgizi.id`,
            password: cleanPassword,
          });

        if (!authError && authData.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

          if (profile) {
            const role = profile.role as "posyandu" | "puskesmas" | "orang_tua";
            const redirectTo = ROLE_HOMEPAGE[role] || "/";

            const res = NextResponse.json({
              success: true,
              data: {
                profile: {
                  id: profile.id,
                  username: profile.username || cleanUsername,
                  namaLengkap: profile.nama_lengkap,
                  role,
                  idPosyandu: profile.id_posyandu,
                  idPuskesmas: profile.id_puskesmas,
                  telepon: profile.telepon,
                },
                redirectTo,
              },
            });

            res.cookies.set(AUTH_COOKIE_NAME, authData.session.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 7 * 24 * 60 * 60,
            });

            res.cookies.set(ROLE_COOKIE_NAME, role, {
              httpOnly: false,
              sameSite: "lax",
              path: "/",
              maxAge: 7 * 24 * 60 * 60,
            });

            if (role === "posyandu") {
              res.cookies.set("simgizi-auth", "true", { path: "/" });
            }

            return res;
          }
        }
      } catch (err) {
        console.warn("Supabase Auth sign-in gagal/offline, cek demo accounts:", err);
      }
    }

    // 2. Fallback Validasi Akun Demo Resmi
    const demoUser = DEMO_PROFILES[cleanUsername];
    if (!demoUser || demoUser.passwordHash !== cleanPassword) {
      // Anti-user enumeration
      return NextResponse.json(
        { success: false, error: "Username atau password salah" },
        { status: 401 },
      );
    }

    const sessionToken = createDemoSessionToken(demoUser.username);
    const redirectTo = ROLE_HOMEPAGE[demoUser.role] || "/";

    const response = NextResponse.json({
      success: true,
      data: {
        profile: {
          id: demoUser.id,
          username: demoUser.username,
          namaLengkap: demoUser.namaLengkap,
          role: demoUser.role,
          idPosyandu: demoUser.idPosyandu,
          idPuskesmas: demoUser.idPuskesmas,
          namaPosyandu: demoUser.namaPosyandu,
          namaPuskesmas: demoUser.namaPuskesmas,
          telepon: demoUser.telepon,
        },
        redirectTo,
      },
    });

    // Pasang cookies sesi aman
    response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set(ROLE_COOKIE_NAME, demoUser.role, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // Backward compatibility cookie
    if (demoUser.role === "posyandu") {
      response.cookies.set("simgizi-auth", "true", { path: "/" });
    }

    return response;
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal pada server saat login" },
      { status: 500 },
    );
  }
}
