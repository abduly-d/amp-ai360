export type ProviderName = "pawa" | "anthropic" | "openai";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface PawaMessage {
  role: "user" | "assistant";
  content: { type: "text"; text: string }[];
}

const PROVIDERS: ProviderName[] = ["pawa", "anthropic", "openai"];

export function isProvider(value: string): value is ProviderName {
  return (PROVIDERS as string[]).includes(value);
}

export function providerConfigured(name: ProviderName, env: NodeJS.ProcessEnv): boolean {
  if (name === "pawa") return Boolean(env.PAWA_AI_API_KEY);
  if (name === "anthropic") return Boolean(env.ANTHROPIC_API_KEY);
  return Boolean(env.OPENAI_API_KEY);
}

/** Ordered providers to try. Unconfigured names are skipped. */
export function providerChain(env: NodeJS.ProcessEnv = process.env): ProviderName[] {
  const requested = (env.AI_PROVIDER || "")
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const base = requested.length ? requested.filter(isProvider) : (["openai", "anthropic", "pawa"] as ProviderName[]);
  return base.filter((name) => providerConfigured(name, env));
}

/**
 * Pawa requires user and assistant turns to alternate, and content is a list
 * of typed text blocks. A system prompt is folded into the first user turn.
 */
export function toPawaMessages(turns: ChatTurn[]): PawaMessage[] {
  const messages: PawaMessage[] = [];
  for (const turn of turns) {
    const text = turn.text?.trim();
    if (!text) continue;
    const role = turn.role === "assistant" ? "assistant" : "user";
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content[0].text += `\n\n${text}`;
    else messages.push({ role, content: [{ type: "text", text }] });
  }
  if (messages[0]?.role === "assistant") {
    messages.unshift({ role: "user", content: [{ type: "text", text: "Continue the briefing." }] });
  }
  if (!messages.length) messages.push({ role: "user", content: [{ type: "text", text: "Brief the executive." }] });
  return messages;
}

function textFromContent(content: unknown): string | null {
  if (typeof content === "string" && content.trim()) return content.trim();
  if (!Array.isArray(content)) return null;
  const parts = content
    .map((block) => {
      if (typeof block === "string") return block;
      if (block && typeof block === "object") {
        const record = block as Record<string, unknown>;
        if (typeof record.text === "string") return record.text;
        if (typeof record.content === "string") return record.content;
      }
      return "";
    })
    .filter(Boolean);
  return parts.length ? parts.join("\n").trim() : null;
}

/** Accept OpenAI-style, Anthropic-style, and a few Pawa variants without assuming one shape. */
export function extractAssistantText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const choices = root.choices;
  if (Array.isArray(choices) && choices[0] && typeof choices[0] === "object") {
    const message = (choices[0] as Record<string, unknown>).message;
    if (message && typeof message === "object") {
      const text = textFromContent((message as Record<string, unknown>).content);
      if (text) return text;
    }
    const text = textFromContent((choices[0] as Record<string, unknown>).text);
    if (text) return text;
  }
  const direct = [
    root.output_text,
    root.text,
    root.answer,
    root.result,
    textFromContent(root.content),
    textFromContent(root.message),
  ];
  for (const candidate of direct) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  if (root.message && typeof root.message === "object") {
    const text = textFromContent((root.message as Record<string, unknown>).content);
    if (text) return text;
  }
  const data = root.data;
  if (data && typeof data === "object") return extractAssistantText(data);
  if (Array.isArray(root.content)) return textFromContent(root.content);
  return null;
}

export async function completeWithChain(options: {
  env?: NodeJS.ProcessEnv;
  system: string;
  user: string;
  fetchImpl?: typeof fetch;
}): Promise<{ provider: ProviderName; text: string } | null> {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  for (const provider of providerChain(env)) {
    try {
      const text = await callProvider(provider, env, options.system, options.user, fetchImpl);
      if (text?.trim()) return { provider, text: text.trim() };
    } catch (error) {
      console.error(`AI provider ${provider} failed`, error instanceof Error ? error.message : error);
    }
  }
  return null;
}

async function callProvider(
  provider: ProviderName,
  env: NodeJS.ProcessEnv,
  system: string,
  user: string,
  fetchImpl: typeof fetch
): Promise<string | null> {
  if (provider === "pawa") return callPawa(env, system, user, fetchImpl);
  if (provider === "anthropic") return callAnthropic(env, system, user, fetchImpl);
  return callOpenAI(env, system, user, fetchImpl);
}

async function callPawa(env: NodeJS.ProcessEnv, system: string, user: string, fetchImpl: typeof fetch): Promise<string | null> {
  const messages = toPawaMessages([{ role: "user", text: `${system}\n\n${user}` }]);
  const res = await fetchImpl("https://api.pawa-ai.com/v1/chat/request", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.PAWA_AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.PAWA_MODEL || "pawa-v1-blaze-20250318",
      messages,
    }),
  });
  if (!res.ok) return null;
  const payload = await res.json().catch(() => null);
  return extractAssistantText(payload);
}

async function callAnthropic(env: NodeJS.ProcessEnv, system: string, user: string, fetchImpl: typeof fetch): Promise<string | null> {
  const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL || "claude-opus-4-8",
      max_tokens: 900,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) return null;
  const payload = await res.json().catch(() => null);
  return extractAssistantText(payload);
}

async function callOpenAI(env: NodeJS.ProcessEnv, system: string, user: string, fetchImpl: typeof fetch): Promise<string | null> {
  const res = await fetchImpl("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 900,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) return null;
  const payload = await res.json().catch(() => null);
  return extractAssistantText(payload);
}
