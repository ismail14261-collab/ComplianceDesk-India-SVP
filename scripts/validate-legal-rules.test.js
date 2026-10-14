"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRegistry } = require("./validate-legal-rules");

function validApprovedRule() {
  return {
    ruleId: "TEST-001",
    title: "Test obligation",
    regime: "Test regime",
    primaryAuthority: "Test Act, section 1",
    sourceUrl: "https://www.mca.gov.in/",
    sourceType: "official portal reference",
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    applicability: { entityTypes: ["company"], conditions: ["test only"] },
    exceptions: ["Test exception must be reviewed"],
    triggerEvent: "Test trigger event",
    deadlineMethod: "Test calculation only; not a real statutory rule",
    requiredOutput: "Test output",
    reviewer: "Qualified reviewer placeholder",
    reviewedOn: "2026-01-02",
    version: 1,
    testCases: [{ name: "basic", expected: "pass" }],
    sourceVerified: true,
    reviewerApproval: true,
    status: "approved",
    changeHistory: []
  };
}

test("accepts an empty registry as the safe initial state", () => {
  assert.deepEqual(validateRegistry({ schemaVersion: 1, rules: [] }), []);
});

test("rejects an approved rule missing source, applicability, or reviewer evidence", () => {
  const rule = validApprovedRule();
  delete rule.sourceUrl;
  delete rule.applicability;
  rule.reviewerApproval = false;
  const errors = validateRegistry({ schemaVersion: 1, rules: [rule] });
  assert.ok(errors.some(error => error.includes("sourceUrl is missing")));
  assert.ok(errors.some(error => error.includes("applicability is missing")));
  assert.ok(errors.some(error => error.includes("reviewerApproval is missing")));
  assert.ok(errors.some(error => error.includes("reviewerApproval is true")));
});

test("rejects a non-HTTPS source", () => {
  const rule = validApprovedRule();
  rule.sourceUrl = "http://example.com/rule";
  const errors = validateRegistry({ schemaVersion: 1, rules: [rule] });
  assert.ok(errors.some(error => error.includes("must use HTTPS")));
});

test("rejects duplicate rule IDs", () => {
  const a = { ruleId: "DUP-1", status: "draft" };
  const b = { ruleId: "DUP-1", status: "draft" };
  const errors = validateRegistry({ schemaVersion: 1, rules: [a, b] });
  assert.ok(errors.some(error => error.includes("ruleId is duplicated")));
});

test("rejects invalid dates and reversed effective dates", () => {
  const rule = validApprovedRule();
  rule.effectiveFrom = "2026-02-30";
  const invalidDateErrors = validateRegistry({ schemaVersion: 1, rules: [rule] });
  assert.ok(invalidDateErrors.some(error => error.includes("effectiveFrom must be a real")));
  rule.effectiveFrom = "2026-02-01";
  rule.effectiveTo = "2025-01-01";
  const reversedDateErrors = validateRegistry({ schemaVersion: 1, rules: [rule] });
  assert.ok(reversedDateErrors.some(error => error.includes("effectiveTo cannot be earlier")));
});

test("does not allow approval without explicit source verification", () => {
  const rule = validApprovedRule();
  rule.sourceVerified = false;
  const errors = validateRegistry({ schemaVersion: 1, rules: [rule] });
  assert.ok(errors.some(error => error.includes("sourceVerified is true")));
});
