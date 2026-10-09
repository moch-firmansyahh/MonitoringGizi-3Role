import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/lib/constants/routes";
import { ROLE_HOMEPAGE } from "@/lib/constants/navigation";
import { RolePengguna } from "@/types";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Izinkan akses langsung tanpa redirect untuk aset publik statis dan file media
  const isPublicAsset =
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(png|jpg|jpeg|svg|webp|ico|css|js|json)$/i.test(pathname);

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // 2. Cek status sesi login
  const hasSession =
    request.cookies.has(AUTH_COOKIE_NAME) ||
    request.cookies.get("simgizi-auth")?.value === "true";

  const rawRole = request.cookies.get(ROLE_COOKIE_NAME)?.value as RolePengguna | undefined;
  const role: RolePengguna = rawRole || "posyandu";

  const isLoginPage = pathname === "/login" || pathname.startsWith("/login");
  const isApiAuth = pathname.startsWith("/api/auth/login");

  // 3. API Route Guard: Tolak request API privat jika belum terautentikasi
  if (pathname.startsWith("/api")) {
    if (!hasSession && !isApiAuth) {
      return NextResponse.json(
        { success: false, error: "Autentikasi diperlukan. Sesi tidak ditemukan." },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // 4. Pengguna Belum Login
  if (!hasSession) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 5. Pengguna Sudah Login mengakses /login -> Redirect ke beranda role-nya
  if (isLoginPage) {
    const targetHome = ROLE_HOMEPAGE[role] || "/";
    return NextResponse.redirect(new URL(targetHome, request.url));
  }

  // 6. Role-Based Route Protection (Akses Silang Antar Role)
  // Puskesmas mencoba akses rute Posyandu atau Orang Tua
  if (role === "puskesmas") {
    const isPosyanduOnly =
      pathname === "/" ||
      pathname.startsWith("/pencatatan-anak") ||
      pathname.startsWith("/rekap-data-gizi") ||
      pathname.startsWith("/riwayat-pemeriksaan");
    const isOrangTuaOnly = pathname.startsWith("/orang-tua");

    if (isPosyanduOnly || isOrangTuaOnly) {
      return NextResponse.redirect(new URL("/puskesmas", request.url));
    }
  }

  // Orang Tua mencoba akses rute faskes Posyandu atau Puskesmas
  if (role === "orang_tua") {
    const isFaskesRoute =
      pathname === "/" ||
      pathname.startsWith("/pencatatan-anak") ||
      pathname.startsWith("/rekap-data-gizi") ||
      pathname.startsWith("/riwayat-pemeriksaan") ||
      pathname.startsWith("/rujukan") ||
      pathname.startsWith("/puskesmas");

    if (isFaskesRoute) {
      return NextResponse.redirect(new URL("/orang-tua", request.url));
    }
  }

  // Posyandu mencoba akses rute Puskesmas atau Orang Tua
  if (role === "posyandu") {
    const isOtherRoleRoute =
      pathname.startsWith("/puskesmas") || pathname.startsWith("/orang-tua");

    if (isOtherRoleRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
