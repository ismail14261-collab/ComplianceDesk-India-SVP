#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ALLOWED_STATUSES = new Set([
  "draft",
  "research_needed",
  "in_review",
  "approved",
  "suspended",
  "superseded"
]);

const APPROVAL_REQUIRED_FIELDS = [
  "ruleId",
  "title",
  "regime",
  "primaryAuthority",
  "sourceUrl",
  "sourceReference",
  "sourceCheckedOn",
  "sourceType",
  "effectiveFrom",
  "applicability",
  "exceptions",
  "triggerEvent",
  "deadlineMethod",
  "requiredOutput",
  "reviewer",
  "reviewedOn",
  "version",
  "testCases",
  "sourceVerified",
  "reviewerApproval"
];

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isNonEmpty(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== null && value !== undefined;
}

function validateRegistry(registry) {
  const errors = [];
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    return ["Registry must be a JSON object."];
  }
  if (registry.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (!Array.isArray(registry.rules)) return errors.concat("rules must be an array.");

  const seenIds = new Set();
  registry.rules.forEach((rule, index) => {
    const at = "rules[" + index + "]";
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
      errors.push(at + " must be an object.");
      return;
    }

    if (!isNonEmpty(rule.ruleId)) errors.push(at + ".ruleId is required.");
    else if (seenIds.has(rule.ruleId)) errors.push(at + ".ruleId is duplicated: " + rule.ruleId);
    else seenIds.add(rule.ruleId);

    if (!ALLOWED_STATUSES.has(rule.status)) {
      errors.push(at + ".status must be one of: " + [...ALLOWED_STATUSES].join(", ") + ".");
      return;
    }

    if (rule.effectiveFrom != null && !isIsoDate(rule.effectiveFrom)) {
      errors.push(at + ".effectiveFrom must be a real YYYY-MM-DD date or null.");
    }
    if (rule.effectiveTo != null && !isIsoDate(rule.effectiveTo)) {
      errors.push(at + ".effectiveTo must be a real YYYY-MM-DD date or null.");
    }
    if (rule.reviewedOn != null && !isIsoDate(rule.reviewedOn)) {
      errors.push(at + ".reviewedOn must be a real YYYY-MM-DD date or null.");
    }
    if (isIsoDate(rule.effectiveFrom) && isIsoDate(rule.effectiveTo) && rule.effectiveTo < rule.effectiveFrom) {
      errors.push(at + ".effectiveTo cannot be earlier than effectiveFrom.");
    }
    if (rule.sourceUrl != null) {
      try {
        const url = new URL(rule.sourceUrl);
        if (url.protocol !== "https:") errors.push(at + ".sourceUrl must use HTTPS.");
      } catch {
        errors.push(at + ".sourceUrl must be a valid absolute URL.");
      }
    }

    if (rule.status === "approved") {
      for (const field of APPROVAL_REQUIRED_FIELDS) {
        if (!isNonEmpty(rule[field])) errors.push(at + " is approved but " + field + " is missing.");
      }
      if (rule.sourceVerified !== true) {
        errors.push(at + " cannot be approved unless sourceVerified is true.");
      }
      if (rule.reviewerApproval !== true) {
        errors.push(at + " cannot be approved unless reviewerApproval is true.");
      }
      if (!isIsoDate(rule.effectiveFrom)) {
        errors.push(at + " cannot be approved without a valid effectiveFrom date.");
      }
      if (!isIsoDate(rule.reviewedOn)) {
        errors.push(at + " cannot be approved without a valid reviewedOn date.");
      }
      if (rule.testCases && (!Array.isArray(rule.testCases) || rule.testCases.length === 0)) {
        errors.push(at + " must have at least one test case before approval.");
      }
      if (rule.sourceUrl) {
        try {
          if (new URL(rule.sourceUrl).protocol !== "https:") errors.push(at + " approved source must use HTTPS.");
        } catch {
          errors.push(at + " approved sourceUrl is invalid.");
        }
      }
    }
  });
  return errors;
}

function main() {
  const file = process.argv[2] || path.join(__dirname, "..", "data", "legal-rules.json");
  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error("Could not read/parse registry:", error.message);
    process.exitCode = 1;
    return;
  }

  const errors = validateRegistry(registry);
  if (errors.length) {
    console.error("Legal rules registry validation failed:");
    errors.forEach(error => console.error(" - " + error));
    process.exitCode = 1;
    return;
  }

  const approved = registry.rules.filter(rule => rule.status === "approved").length;
  console.log("Legal rules registry valid. " + registry.rules.length + " rule(s); " + approved + " approved.");
  if (approved === 0) console.log("No statutory rules are approved for deadline automation.");
}

if (require.main === module) main();

module.exports = { validateRegistry, isIsoDate, APPROVAL_REQUIRED_FIELDS };
