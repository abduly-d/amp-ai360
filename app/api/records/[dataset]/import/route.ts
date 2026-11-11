import { NextRequest } from "next/server";
import { importRecords } from "@/lib/server/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { dataset: string } }) {
  return importRecords(params.dataset, req);
}
