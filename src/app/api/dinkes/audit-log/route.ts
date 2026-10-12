import { NextResponse } from "next/server";
import { auditRepository } from "@/lib/repositories/audit.repository";
import { getBrokerStatus } from "@/lib/broker/rabbitmq";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("eventType") || undefined;
    const search = searchParams.get("search") || undefined;

    const logs = await auditRepository.getAll({ eventType, search });
    const summary = await auditRepository.getSummary();
    const brokerStatus = await getBrokerStatus();

    return NextResponse.json({
      success: true,
      data: {
        logs,
        summary,
        brokerStatus,
      },
    });
  } catch (error) {
    console.error("GET /api/dinkes/audit-log error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat log audit broker." },
      { status: 500 },
    );
  }
}
