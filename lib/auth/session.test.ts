import assert from "node:assert/strict";
import test from "node:test";
import { createSession, passwordsMatch, verifySession } from "./session";

test("a signed session round-trips and rejects tampering", () => {
  const token = createSession("Amina Hassan", "secret-key", 1_700_000_000_000);
  const session = verifySession(token, "secret-key", 1_700_000_000_000);
  assert.equal(session?.name, "Amina Hassan");

  const flipped = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
  assert.equal(verifySession(flipped, "secret-key", 1_700_000_000_000), null);
  assert.equal(verifySession(token, "other-secret", 1_700_000_000_000), null);
  assert.equal(verifySession(token, "secret-key", session!.exp + 1), null);
});

test("password check is exact and empty passwords never match", () => {
  assert.equal(passwordsMatch("amp-editor", "amp-editor"), true);
  assert.equal(passwordsMatch("amp-editor", "amp-editoR"), false);
  assert.equal(passwordsMatch("amp-editor", ""), false);
  assert.equal(passwordsMatch("", ""), false);
});

test("display names are trimmed and required", () => {
  assert.throws(() => createSession("   ", "secret"));
  const token = createSession("  ATO desk \n", "secret");
  assert.equal(verifySession(token, "secret")?.name, "ATO desk");
});
