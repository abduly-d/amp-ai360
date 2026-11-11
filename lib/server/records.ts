import { NextRequest, NextResponse } from "next/server";
import { datasetSpec, type DatasetId } from "@/lib/domain/datasets";
import { assignId, validateRow, type Row } from "@/lib/domain/validate";
import { importCsv, templateCsv, toCsv } from "@/lib/import/csv";
import { editingConfigured, sessionSecret, verifySession, SESSION_COOKIE } from "@/lib/auth/session";
import { getStore } from "@/lib/store";

export function editorName(req: NextRequest): string | null {
  if (!editingConfigured()) return null;
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value, sessionSecret())?.name ?? null;
}

export function denyUnlessEditor(req: NextRequest): string | NextResponse {
  if (!editingConfigured()) {
    return NextResponse.json(
      { error: "Editing is disabled. Set EDITOR_PASSWORD before editors can sign in." },
      { status: 403 }
    );
  }
  const name = editorName(req);
  if (!name) return NextResponse.json({ error: "Sign in to edit records." }, { status: 401 });
  return name;
}

function unknown(dataset: string) {
  return NextResponse.json({ error: `Unknown dataset: ${dataset}` }, { status: 404 });
}

export async function listRecords(dataset: string) {
  const spec = datasetSpec(dataset);
  if (!spec) return unknown(dataset);
  try {
    const rows = await (await getStore()).list(spec.id);
    return NextResponse.json({ dataset: spec.id, rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ dataset: spec.id, rows: [], warning: "Records could not be read." });
  }
}

export async function createRecord(dataset: string, req: NextRequest) {
  const spec = datasetSpec(dataset);
  if (!spec) return unknown(dataset);
  const actor = denyUnlessEditor(req);
  if (actor instanceof NextResponse) return actor;
  const body = await readBody(req);
  if (body instanceof NextResponse) return body;
  const checked = validateRow(spec.id, assignId(spec.id, body));
  if (!checked.ok) return NextResponse.json({ error: checked.errors.join(" "), errors: checked.errors }, { status: 400 });
  try {
    const row = await (await getStore()).create(spec.id, checked.value, actor);
    return NextResponse.json({ row }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the record";
    const status = /already exists/i.test(message) ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function updateRecord(dataset: string, req: NextRequest) {
  const spec = datasetSpec(dataset);
  if (!spec) return unknown(dataset);
  const actor = denyUnlessEditor(req);
  if (actor instanceof NextResponse) return actor;
  const body = await readBody(req);
  if (body instanceof NextResponse) return body;
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const store = await getStore();
  const existing = await store.get(spec.id, id);
  if (!existing) return NextResponse.json({ error: "Record not found" }, { status: 404 });
  const checked = validateRow(spec.id, { ...existing, ...body, id: existing.id });
  if (!checked.ok) return NextResponse.json({ error: checked.errors.join(" "), errors: checked.errors }, { status: 400 });
  try {
    const row = await store.update(spec.id, id, checked.value, actor);
    return NextResponse.json({ row });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update the record" }, { status: 400 });
  }
}

export async function deleteRecord(dataset: string, req: NextRequest) {
  const spec = datasetSpec(dataset);
  if (!spec) return unknown(dataset);
  const actor = denyUnlessEditor(req);
  if (actor instanceof NextResponse) return actor;
  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await (await getStore()).remove(spec.id, id, actor);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete the record";
    return NextResponse.json({ error: message }, { status: /not found/i.test(message) ? 404 : 400 });
  }
}

export async function importRecords(dataset: string, req: NextRequest) {
  const spec = datasetSpec(dataset);
  if (!spec) return unknown(dataset);
  const actor = denyUnlessEditor(req);
  if (actor instanceof NextResponse) return actor;
  const csv = await readCsv(req);
  if (csv instanceof NextResponse) return csv;
  const parsed = importCsv(spec.id, csv);
  if (!parsed.ok) return NextResponse.json({ error: "The file has validation errors.", errors: parsed.errors }, { status: 400 });
  try {
    const result = await (await getStore()).upsertMany(spec.id, parsed.rows, actor);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 400 });
  }
}

export function exportRecords(dataset: string, rows: Row[]) {
  const spec = datasetSpec(dataset);
  if (!spec) return unknown(dataset);
  return new NextResponse(toCsv(spec.id, rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${spec.id}.csv"`,
    },
  });
}

export async function downloadRecords(dataset: string) {
  const spec = datasetSpec(dataset);
  if (!spec) return unknown(dataset);
  try {
    const rows = await (await getStore()).list(spec.id);
    return exportRecords(spec.id, rows);
  } catch {
    return exportRecords(spec.id, []);
  }
}

export function downloadTemplate(dataset: string) {
  const spec = datasetSpec(dataset);
  if (!spec) return unknown(dataset);
  return new NextResponse(templateCsv(spec.id as DatasetId), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${spec.id}-template.csv"`,
    },
  });
}

async function readBody(req: NextRequest): Promise<Row | NextResponse> {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
    }
    return body as Row;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

async function readCsv(req: NextRequest): Promise<string | NextResponse> {
  const type = req.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) {
      const body = await req.json();
      const csv = String(body?.csv ?? "");
      if (!csv.trim()) return NextResponse.json({ error: "Missing csv" }, { status: 400 });
      return csv;
    }
    const csv = await req.text();
    if (!csv.trim()) return NextResponse.json({ error: "The file is empty" }, { status: 400 });
    return csv;
  } catch {
    return NextResponse.json({ error: "Could not read the upload" }, { status: 400 });
  }
}
