import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowWelcome } from "./welcome";

test("the welcome screen shows on a first visit and when reopened", () => {
  assert.equal(shouldShowWelcome(false, false), true);
  assert.equal(shouldShowWelcome(true, false), false);
  assert.equal(shouldShowWelcome(true, true), true);
  assert.equal(shouldShowWelcome(false, true), true);
});
