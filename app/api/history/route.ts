import { NextResponse } from "next/server";
import { historyStore } from "@/lib/history-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? "5")));
  return NextResponse.json({ history: historyStore.list().slice(0, limit) });
}
