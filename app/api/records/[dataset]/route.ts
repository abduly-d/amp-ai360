import { NextRequest } from "next/server";
import { createRecord, deleteRecord, listRecords, updateRecord } from "@/lib/server/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { dataset: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return listRecords(params.dataset);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  return createRecord(params.dataset, req);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return updateRecord(params.dataset, req);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return deleteRecord(params.dataset, req);
}
