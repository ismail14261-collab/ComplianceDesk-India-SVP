"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {validateRegistry,toRegistryRule,toUiRule}=require("./legal-rules-registry-core");
test("accepts the empty versioned registry",()=>assert.deepEqual(validateRegistry({schemaVersion:1,rules:[]}),[]));
test("rejects duplicate IDs case-insensitively",()=>assert.ok(validateRegistry({schemaVersion:1,rules:[{ruleId:"ABC",status:"draft"},{ruleId:"abc",status:"draft"}]}).some(e=>e.includes("duplicated"))));
test("rejects non-HTTPS source links",()=>assert.ok(validateRegistry({schemaVersion:1,rules:[{ruleId:"A",status:"draft",sourceUrl:"http://example.com"}]}).some(e=>e.includes("HTTPS"))));
test("rejects an approved rule without reviewer evidence",()=>{const r={ruleId:"A",status:"approved",title:"x",regime:"x",primaryAuthority:"x",sourceUrl:"https://example.com",sourceType:"Act",effectiveFrom:"2026-01-01",applicability:{description:"x"},exceptions:["none"],triggerEvent:"x",deadlineMethod:"x",requiredOutput:"x",reviewer:"x",reviewedOn:"2026-01-02",version:"1.0",testCases:[{scenario:"x"}],sourceVerified:true,reviewerApproval:false};assert.ok(validateRegistry({schemaVersion:1,rules:[r]}).some(e=>e.includes("reviewerApproval is true")));});
test("round-trips structured applicability, exceptions and test cases",()=>{const ui={ruleId:"A",status:"draft",applicability:"Companies only",exceptions:"Exemption A\\nExemption B",testCases:"Basic case\\nException case",version:"1.0"};const back=toUiRule(toRegistryRule(ui));assert.equal(back.applicability,"Companies only");assert.equal(back.exceptions,"Exemption A\\nExemption B");assert.equal(back.testCases,"Basic case\\nException case");});
test("rejects impossible calendar dates",()=>assert.ok(validateRegistry({schemaVersion:1,rules:[{ruleId:"A",status:"draft",effectiveFrom:"2026-02-30"}]}).some(e=>e.includes("real YYYY-MM-DD"))));

test("preserves structured imported fields when unchanged",()=>{const source={schemaVersion:1,rules:[{ruleId:"STRUCT-1",status:"draft",applicability:{entityTypes:["company"],conditions:["threshold"]},exceptions:[{reference:"proviso"}],testCases:[{scenario:"ordinary",expected:"review"}]}]};const roundTrip=toRegistryRule(toUiRule(source.rules[0]));assert.deepEqual(roundTrip.applicability,source.rules[0].applicability);assert.deepEqual(roundTrip.exceptions,source.rules[0].exceptions);assert.deepEqual(roundTrip.testCases,source.rules[0].testCases);});

test("validates source publication and checked dates",()=>{const r={ruleId:"SRC-1",status:"draft",sourcePublishedOn:"2026-02-30"};assert.ok(validateRegistry({schemaVersion:1,rules:[r]}).some(e=>e.includes("sourcePublishedOn")));});
test("rejects source checked date earlier than publication date",()=>{const r={ruleId:"SRC-2",status:"draft",sourcePublishedOn:"2026-02-01",sourceCheckedOn:"2026-01-31"};assert.ok(validateRegistry({schemaVersion:1,rules:[r]}).some(e=>e.includes("sourceCheckedOn cannot be earlier")));});
