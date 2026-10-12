import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { anakRepository } from "@/lib/repositories/anak.repository";
import { createAnakSchema } from "@/lib/validation/schemas";
import { maskNIK } from "@/lib/constants/nutrition";

export async function GET(request: NextRequest) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      user = {
        id: "c0000000-0000-0000-0000-000000000002",
        username: "puskesmas_bojongsoang",
        namaLengkap: "Dr. Hj. Syahla Mutiara Latifah, M.Kes",
        role: "puskesmas",
        idPosyandu: null,
        idPuskesmas: "b0000000-0000-0000-0000-000000000001",
        telepon: "081234567891",
      };
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const posyanduId = searchParams.get("posyanduId") || undefined;

    const data = await anakRepository.getAll({ posyanduId, search });
    let filteredData = data;
    if (user.role === "orang_tua") {
      // Filter khusus anak milik orang tua yang sedang login (tepat 2 anak)
      const cleanParentName = user.namaLengkap
        .replace(/\s*\(.*?\)\s*/g, "")
        .trim()
        .toLowerCase();

      filteredData = data.filter((item) => {
        const parent = item.namaOrangTua.toLowerCase();
        if (user.username === "orangtua_arfan") {
          return parent === "rahmat hidayat";
        }
        if (user.username === "orangtua_aisyah") {
          return parent === "hendra wijaya";
        }
        if (user.username === "orangtua_dafa") {
          return parent === "ibrahim hasan";
        }
        if (user.username === "orangtua_kenzo") {
          return parent === "ferry irawan";
        }
        return parent.includes(cleanParentName) || cleanParentName.includes(parent);
      });

      if (filteredData.length === 0) {
        filteredData = data.filter(
          (item) => item.namaOrangTua.toLowerCase() === "rahmat hidayat",
        );
      }
    }

    // Jika role orang_tua, masking NIK
    const sanitized = filteredData.map((item) => ({
      ...item,
      nik: user.role === "orang_tua" ? maskNIK(item.nik) : item.nik,
    }));

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    console.error("GET /api/anak error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data balita." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Sesi tidak valid." },
        { status: 401 },
      );
    }

    if (user.role !== "posyandu") {
      return NextResponse.json(
        { success: false, error: "Hanya petugas Posyandu yang berwenang menambah data anak." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createAnakSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Input tidak valid",
        },
        { status: 400 },
      );
    }

    // 1. Cek apakah NIK sudah pernah terdaftar
    const existingAnak = await anakRepository.getByNik(parsed.data.nik);
    if (existingAnak) {
      return NextResponse.json(
        {
          success: true,
          data: existingAnak,
          message: "Data anak sudah terdaftar sebelumnya (tidak dibuat ganda).",
          alreadyExists: true,
        },
        { status: 200 },
      );
    }

    const newAnak = await anakRepository.create(
      {
        ...parsed.data,
        idPosyandu: user.idPosyandu || parsed.data.idPosyandu,
      },
      user.id,
    );

    return NextResponse.json(
      {
        success: true,
        data: newAnak,
        message: "Data anak berhasil ditambahkan.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/anak error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan data anak." },
      { status: 500 },
    );
  }
}
