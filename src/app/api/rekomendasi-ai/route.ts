import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rekomendasiAiSchema } from "@/lib/validation/schemas";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_PROMPT = `Kamu adalah asisten edukasi gizi untuk petugas posyandu dan tenaga kesehatan di Indonesia.

ATURAN KETAT:
1. Status gizi anak SUDAH FINAL dihitung berdasar standar WHO/Permenkes No. 2/2020. DILARANG mendiagnosis ulang atau mengubah angka Z-score.
2. Buatkan 1 paragraf ringkas (2-3 kalimat) saran tindak lanjut edukatif yang diawali dengan format persis:
   "[ANALISIS MEDIS KEMENKES RI & WHO] Pasien {nama} ({usia} Bulan) terindikasi status {status} dengan Z-Score BB/TB {zScoreBBTB} (BB {bb} kg pada TB {tb} cm). [Saran edukatif pola asuh/asupan dan anjuran rujukan faskes jika berisiko tinggi]."
3. DILARANG meresepkan obat atau dosis suplemen spesifik.
4. Jangan gunakan formatting markdown berlebih (tanpa bold/bintang-bintang).`;

// Sliding-window in-memory rate limiter: maks 20 permintaan per menit per user
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 detik
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(identifier) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(identifier, validTimestamps);
  return false;
}

export async function POST(request: Request) {
  try {
    // 1. Guard Autentikasi (FR-AI-01)
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Sesi tidak ditemukan." },
        { status: 401 },
      );
    }

    // 2. Rate Limiting per User (FR-AI-04)
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Batas permintaan tercapai (maksimal 20 per menit). Silakan coba sesaat lagi.",
        },
        { status: 429 },
      );
    }

    // 3. Validasi Skema Input (FR-AI-01)
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Format request JSON tidak valid." },
        { status: 400 },
      );
    }

    const parsed = rekomendasiAiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Input tidak valid",
        },
        { status: 400 },
      );
    }

    const {
      nama,
      usiaBulan,
      jenisKelamin,
      beratKg,
      tinggiCm,
      statusGizi,
      zScoreBBU,
      zScoreTBU,
      zScoreBBTB,
    } = parsed.data;

    const zBbtbStr =
      typeof zScoreBBTB === "number"
        ? (zScoreBBTB > 0 ? `+${zScoreBBTB.toFixed(2)} SD` : `${zScoreBBTB.toFixed(2)} SD`)
        : String(zScoreBBTB);

    // Template Fallback Edukatif Awam untuk Orang Tua (FR-AI-07)
    let rekomendasiAwam =
      statusGizi.toLowerCase().includes("stunting")
        ? `Tinggi badan ananda ${nama} saat ini berada di bawah kurva standar usia. Diperlukan konsultasi ke Puskesmas dan pemenuhan protein hewani (telur/ikan/daging) secara rutin.`
        : statusGizi.toLowerCase().includes("buruk")
        ? `Ananda ${nama} membutuhkan penanganan medis segera dari Puskesmas untuk evaluasi gizi intensif. Tetap jaga hidrasi dan asupan makanan lembut.`
        : statusGizi.toLowerCase().includes("kurang")
        ? `Berat badan ananda ${nama} di bawah rata-rata. Tambahkan variasi makanan berkalori dan berprotein tinggi serta periksa kembali jadwal penimbangan bulan depan.`
        : `Pertumbuhan ananda ${nama} optimal dan sehat sesuai kurva standar WHO. Pertahankan pola makan bergizi seimbang dan stimulasi aktif.`;

    // 4. Cek Ketersediaan Gemini API Key (FR-AI-06)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackLocal = `[ANALISIS MEDIS KEMENKES RI & WHO] Pasien ${nama} (${usiaBulan} Bulan) terindikasi status ${statusGizi} dengan Z-Score BB/TB ${zBbtbStr} (BB ${beratKg} kg pada TB ${tinggiCm} cm). ${
        statusGizi.toLowerCase().includes("stunting") || statusGizi.toLowerCase().includes("buruk")
          ? "Berisiko tinggi terhadap gangguan pertumbuhan. Segera konsultasikan ke Posyandu/Puskesmas untuk tatalaksana gizi terpadu."
          : "Pertahankan pemantauan gizi rutin bulanan dan berikan asupan makanan bergizi seimbang."
      }`;
      return NextResponse.json(
        {
          success: true,
          rekomendasi: fallbackLocal,
          rekomendasiAwam,
          sumber: "lokal",
        },
        { status: 200 },
      );
    }

    // 5. Sanitasi PII: Gunakan placeholder {nama} tanpa mengirim nama asli anak ke pihak ketiga (FR-AI-02)
    const sanitizedPrompt = `Data Pasien:
- Nama: {nama}
- Umur: ${usiaBulan} bulan
- Jenis Kelamin: ${jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
- Berat Badan: ${beratKg} kg
- Tinggi Badan: ${tinggiCm} cm
- Status Gizi Utama: ${statusGizi}
- Z-Score BB/U: ${zScoreBBU}
- Z-Score TB/U: ${zScoreTBU}
- Z-Score BB/TB: ${zScoreBBTB}

Buatkan rekomendasi tindak lanjut gizi sesuai format sistem.`;

    // 6. Request ke Gemini API: Header x-goog-api-key, BUKAN query URL! (FR-AI-03)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: sanitizedPrompt }] }],
        generationConfig: {
          temperature: 0.3,
        },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    let generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedText) {
      throw new Error("Gemini API returned empty text");
    }

    // 7. Re-substitusi nama anak asli di sisi server (FR-AI-02)
    const finalRekomendasi = generatedText.replaceAll("{nama}", nama);

    return NextResponse.json({
      success: true,
      rekomendasi: finalRekomendasi,
      rekomendasiAwam,
      sumber: "ai",
    });
  } catch (error) {
    // Fail-safe lokal deterministik (FR-AI-06)
    const bodyFallback = await request.clone().json().catch(() => ({}));
    const namaFallback = bodyFallback.nama || "Pasien";
    const statusFallback = bodyFallback.statusGizi || "Normal";
    const usiaFallback = bodyFallback.usiaBulan || 0;
    const bbFallback = bodyFallback.beratKg || 0;
    const tbFallback = bodyFallback.tinggiCm || 0;
    const zBbtbFallback = bodyFallback.zScoreBBTB || "-0.0 SD";

    const isCritical =
      statusFallback.toLowerCase().includes("stunting") ||
      statusFallback.toLowerCase().includes("buruk");

    const fallbackAdvice = `[ANALISIS MEDIS KEMENKES RI & WHO] Pasien ${namaFallback} (${usiaFallback} Bulan) terindikasi status ${statusFallback} dengan Z-Score BB/TB ${zBbtbFallback} (BB ${bbFallback} kg pada TB ${tbFallback} cm). ${
      isCritical
        ? "Berisiko tinggi terhadap gangguan pertumbuhan dan kognitif dini. Segera konsultasikan ke Posyandu/Puskesmas untuk pemantauan dan intervensi gizi terpadu."
        : "Pertahankan pemantauan gizi rutin bulanan dan berikan asupan makanan bergizi seimbang."
    }`;

    return NextResponse.json(
      {
        success: true,
        rekomendasi: fallbackAdvice,
        rekomendasiAwam: `Pemeriksaan ananda ${namaFallback} tercatat. Pertahankan pemantauan gizi rutin di Posyandu.`,
        sumber: "lokal",
      },
      { status: 200 },
    );
  }
}
