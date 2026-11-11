import { downloadTemplate } from "@/lib/server/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { dataset: string } }) {
  return downloadTemplate(params.dataset);
}
