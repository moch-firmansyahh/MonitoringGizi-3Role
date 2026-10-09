import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/lib/constants/routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Berhasil keluar dari sistem.",
  });

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Abaikan jika offline
    }
  }

  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(ROLE_COOKIE_NAME);
  response.cookies.delete("simgizi-auth");

  return response;
}
