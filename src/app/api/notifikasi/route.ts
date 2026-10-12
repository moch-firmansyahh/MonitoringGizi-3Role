import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { notifikasiRepository } from "@/lib/repositories/notifikasi.repository";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    let userId = user?.id || "c0000000-0000-0000-0000-000000000003";
    if (user?.username === "orangtua_arfan") {
      userId = "c0000000-0000-0000-0000-000000000003";
    } else if (user?.username === "orangtua_aisyah") {
      userId = "c0000000-0000-0000-0000-000000000006";
    } else if (user?.username === "orangtua_dafa") {
      userId = "c0000000-0000-0000-0000-000000000008";
    } else if (user?.username === "orangtua_kenzo") {
      userId = "c0000000-0000-0000-0000-000000000009";
    }

    const notifikasiList = await notifikasiRepository.getByUserId(userId);
    const unreadCount = notifikasiList.filter((n) => !n.dibaca).length;

    return NextResponse.json({
      success: true,
      data: notifikasiList,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifikasi error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data notifikasi." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "c0000000-0000-0000-0000-000000000003";

    const body = await request.json().catch(() => ({}));
    if (body.all) {
      await notifikasiRepository.markAllAsRead(userId);
    } else if (body.id) {
      await notifikasiRepository.markAsRead(body.id);
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil diperbarui.",
    });
  } catch (error) {
    console.error("PATCH /api/notifikasi error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui notifikasi." },
      { status: 500 },
    );
  }
}
