import { cookies } from "next/headers";
import { Shell } from "@/components/shell";
import { SESSION_COOKIE, editingConfigured, sessionSecret, verifySession } from "@/lib/auth/session";
import { loadSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await loadSnapshot();
  const session = verifySession(cookies().get(SESSION_COOKIE)?.value, sessionSecret());
  return (
    <Shell snapshot={snapshot} session={{ name: session?.name ?? null, editingEnabled: editingConfigured() }}>
      {children}
    </Shell>
  );
}
