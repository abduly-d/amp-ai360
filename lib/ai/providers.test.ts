import assert from "node:assert/strict";
import test from "node:test";
import { llmAnalyze } from "./engine";
import { completeWithChain, extractAssistantText, providerChain, toPawaMessages } from "./providers";

const PAWA_ANSWER = [
  "Irrigation covers 727 thousand hectares, 61% of the 1.2 million hectare AMP path.",
  "- Flagship 1 still gates the yield response of certified seed.",
  "- Disbursement delays on three basin schemes are the binding constraint.",
  "REC: Release contractor payments for the shovel-ready Mbeya and Morogoro schemes.",
].join("\n");

/** Shape documented at https://docs.pawa-ai.com/api-reference/endpoint/chat/request */
function pawaEnvelope(content: string | { type: string; text: string }[]) {
  return {
    success: true,
    message: "Chat request processed successfully",
    data: {
      request: [
        {
          finish_reason: "stop",
          message: { role: "assistant", content },
          matched_stop: 128001,
        },
      ],
      created: 1753304351,
      model: "pawa-v1-blaze-20250318",
      object: "chat.request",
      usage: { tokens_in: 42, tokens_out: 128 },
    },
  };
}

test("pawa messages alternate and use text blocks", () => {
  const messages = toPawaMessages([
    { role: "assistant", text: "Earlier point." },
    { role: "user", text: "First question" },
    { role: "user", text: "Second part" },
    { role: "assistant", text: "Answer" },
  ]);
  assert.deepEqual(
    messages.map((message) => message.role),
    ["user", "assistant", "user", "assistant"]
  );
  assert.equal(messages[2].content[0].type, "text");
  assert.match(messages[2].content[0].text, /First question/);
  assert.match(messages[2].content[0].text, /Second part/);
});

test("assistant text is read from several response shapes", () => {
  assert.equal(
    extractAssistantText({ choices: [{ message: { content: [{ type: "text", text: "From blocks" }] } }] }),
    "From blocks"
  );
  assert.equal(extractAssistantText({ choices: [{ message: { content: "Plain string" } }] }), "Plain string");
  assert.equal(extractAssistantText({ data: { content: [{ text: "Nested" }] } }), "Nested");
  assert.equal(extractAssistantText({ output_text: "Output" }), "Output");
  assert.equal(extractAssistantText({ unexpected: true }), null);
  assert.equal(extractAssistantText(null), null);
  assert.equal(extractAssistantText({ success: true, message: "Chat request processed successfully" }), null);
});

test("a Pawa envelope yields the assistant reply, not the status message", async () => {
  assert.equal(extractAssistantText(pawaEnvelope(PAWA_ANSWER)), PAWA_ANSWER);
  assert.equal(
    extractAssistantText(pawaEnvelope([{ type: "text", text: "Chat request processed successfully" }, { type: "text", text: PAWA_ANSWER }])),
    PAWA_ANSWER
  );
  assert.doesNotMatch(extractAssistantText(pawaEnvelope(PAWA_ANSWER)) ?? "", /processed successfully/);

  const previousFetch = globalThis.fetch;
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.PAWA_AI_API_KEY;
  process.env.AI_PROVIDER = "pawa";
  process.env.PAWA_AI_API_KEY = "test-key";
  globalThis.fetch = async () => new Response(JSON.stringify(pawaEnvelope(PAWA_ANSWER)), { status: 200 });
  try {
    const result = await llmAnalyze("What is needed to expand irrigation?");
    assert.equal(result?.provider, "pawa");
    assert.match(result?.summary ?? "", /727 thousand hectares/);
    assert.doesNotMatch(result?.summary ?? "", /processed successfully/i);
    assert.ok(result?.keyPoints.some((point) => /Flagship 1/.test(point)));
    assert.ok(result?.recommendations?.some((item) => /Mbeya and Morogoro/.test(item)));
  } finally {
    globalThis.fetch = previousFetch;
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;
    if (previousKey === undefined) delete process.env.PAWA_AI_API_KEY;
    else process.env.PAWA_AI_API_KEY = previousKey;
  }
});

test("provider chain follows AI_PROVIDER and skips missing keys", () => {
  assert.deepEqual(providerChain({ AI_PROVIDER: "anthropic,pawa", ANTHROPIC_API_KEY: "a", PAWA_AI_API_KEY: "p" }), [
    "anthropic",
    "pawa",
  ]);
  assert.deepEqual(providerChain({ AI_PROVIDER: "pawa,openai", OPENAI_API_KEY: "o" }), ["openai"]);
  assert.deepEqual(providerChain({ OPENAI_API_KEY: "o", PAWA_AI_API_KEY: "p" }), ["openai", "pawa"]);
  assert.deepEqual(providerChain({}), []);
});

test("the chain falls through a bad response to the local-ready null", async () => {
  const calls: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    if (url.includes("pawa")) {
      return new Response(JSON.stringify({ weird: true }), { status: 200 });
    }
    if (url.includes("anthropic")) {
      return new Response("nope", { status: 500 });
    }
    return new Response(JSON.stringify({ choices: [{ message: { content: "OpenAI brief" } }] }), { status: 200 });
  };
  const result = await completeWithChain({
    env: { AI_PROVIDER: "pawa,anthropic,openai", PAWA_AI_API_KEY: "p", ANTHROPIC_API_KEY: "a", OPENAI_API_KEY: "o" },
    system: "Be brief",
    user: "Status of irrigation?",
    fetchImpl,
  });
  assert.equal(result?.provider, "openai");
  assert.equal(result?.text, "OpenAI brief");
  assert.equal(calls.length, 3);

  const pawaBody = JSON.parse(
    String(
      (
        await (async () => {
          let body = "";
          const spy: typeof fetch = async (_input, init) => {
            body = String(init?.body ?? "");
            return new Response(JSON.stringify({ choices: [{ message: { content: [{ type: "text", text: "Pawa brief" }] } }] }), {
              status: 200,
            });
          };
          const done = await completeWithChain({
            env: { AI_PROVIDER: "pawa", PAWA_AI_API_KEY: "p", PAWA_MODEL: "pawa-test" },
            system: "System prompt",
            user: "Question",
            fetchImpl: spy,
          });
          assert.equal(done?.text, "Pawa brief");
          return body;
        })()
      )
    )
  );
  assert.equal(pawaBody.model, "pawa-test");
  assert.equal(pawaBody.messages[0].role, "user");
  assert.equal(pawaBody.messages[0].content[0].type, "text");
  assert.match(pawaBody.messages[0].content[0].text, /System prompt/);
  assert.equal(
    pawaBody.messages.filter((message: { role: string }, index: number, all: { role: string }[]) => index > 0 && message.role === all[index - 1].role)
      .length,
    0
  );
});
