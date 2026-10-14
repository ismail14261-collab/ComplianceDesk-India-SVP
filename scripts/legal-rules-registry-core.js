;(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.LegalRulesCore=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const STATUSES=["draft","research_needed","in_review","approved","suspended","superseded"];
const REQUIRED=["ruleId","title","regime","primaryAuthority","sourceUrl","sourceReference","sourceCheckedOn","sourceType","effectiveFrom","applicability","exceptions","triggerEvent","deadlineMethod","requiredOutput","reviewer","reviewedOn","version","testCases","sourceVerified","reviewerApproval"];
const DATE_FIELDS=["effectiveFrom","effectiveTo","reviewedOn","sourcePublishedOn","sourceCheckedOn"];
function isDate(v){if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+"T00:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v;}
function nonempty(v){if(typeof v==="boolean")return v;if(typeof v==="string")return !!v.trim();if(Array.isArray(v))return v.length>0;if(v&&typeof v==="object")return Object.keys(v).length>0;return v!==null&&v!==undefined;}
function validateRegistry(registry){
 const errors=[];if(!registry||typeof registry!=="object"||Array.isArray(registry))return ["Registry must be a JSON object."];
 if(registry.schemaVersion!==1)errors.push("schemaVersion must be 1.");if(!Array.isArray(registry.rules))return errors.concat("rules must be an array.");
 const seen=new Set();registry.rules.forEach((r,i)=>{const at="rules["+i+"]";if(!r||typeof r!=="object"||Array.isArray(r)){errors.push(at+" must be an object.");return;}
 if(!nonempty(r.ruleId))errors.push(at+".ruleId is required.");else{const id=String(r.ruleId).toLowerCase();if(seen.has(id))errors.push(at+".ruleId is duplicated: "+r.ruleId);seen.add(id);}
 if(!STATUSES.includes(r.status)){errors.push(at+".status is invalid.");return;}
 for(const field of DATE_FIELDS)if(r[field]!=null&&r[field]!==""&&!isDate(r[field]))errors.push(at+"."+field+" must be a real YYYY-MM-DD date.");
 if(isDate(r.effectiveFrom)&&isDate(r.effectiveTo)&&r.effectiveTo<r.effectiveFrom)errors.push(at+".effectiveTo cannot be earlier than effectiveFrom.");
 if(isDate(r.sourcePublishedOn)&&isDate(r.sourceCheckedOn)&&r.sourceCheckedOn<r.sourcePublishedOn)errors.push(at+".sourceCheckedOn cannot be earlier than sourcePublishedOn.");
 if(r.sourceUrl){try{if(new URL(r.sourceUrl).protocol!=="https:")errors.push(at+".sourceUrl must use HTTPS.");}catch{errors.push(at+".sourceUrl must be a valid absolute URL.");}}
 if(r.status==="approved"){
  for(const f of REQUIRED)if(!nonempty(r[f]))errors.push(at+" is approved but "+f+" is missing.");
  if(r.sourceVerified!==true)errors.push(at+" cannot be approved unless sourceVerified is true.");
  if(r.reviewerApproval!==true)errors.push(at+" cannot be approved unless reviewerApproval is true.");
  if(!isDate(r.effectiveFrom))errors.push(at+" cannot be approved without a valid effectiveFrom date.");
  if(!isDate(r.reviewedOn))errors.push(at+" cannot be approved without a valid reviewedOn date.");
  if(!Array.isArray(r.testCases)||r.testCases.length===0)errors.push(at+" must have at least one test case before approval.");
 }
 });return errors;
}
function splitLines(value){return String(value||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);}
function toRegistryRule(ui){
 const keepA=ui._registryApplicability!==undefined&&ui.applicability===ui._registryApplicabilityDisplay;
 const keepE=ui._registryExceptions!==undefined&&ui.exceptions===ui._registryExceptionsDisplay;
 const keepT=ui._registryTestCases!==undefined&&ui.testCases===ui._registryTestCasesDisplay;
 const out={...ui,applicability:keepA?ui._registryApplicability:{description:String(ui.applicability||"")},exceptions:keepE?ui._registryExceptions:splitLines(ui.exceptions),testCases:keepT?ui._registryTestCases:splitLines(ui.testCases).map(s=>({scenario:s})),version:String(ui.version||"1.0")};
 for(const key of ["updatedAt","_registryApplicability","_registryApplicabilityDisplay","_registryExceptions","_registryExceptionsDisplay","_registryTestCases","_registryTestCasesDisplay"])delete out[key];
 return out;
}
function toUiRule(r){
 const applicability=typeof r.applicability==="string"?r.applicability:(r.applicability?.description||JSON.stringify(r.applicability||{}));
 const exceptions=Array.isArray(r.exceptions)?r.exceptions.map(x=>typeof x==="string"?x:JSON.stringify(x)).join("\n"):String(r.exceptions||"");
 const testCases=Array.isArray(r.testCases)?r.testCases.map(x=>typeof x==="string"?x:(x.scenario||x.name||JSON.stringify(x))).join("\n"):String(r.testCases||"");
 return {...r,_registryApplicability:r.applicability,_registryApplicabilityDisplay:applicability,_registryExceptions:r.exceptions,_registryExceptionsDisplay:exceptions,_registryTestCases:r.testCases,_registryTestCasesDisplay:testCases,applicability,exceptions,testCases,version:String(r.version??"1.0"),sourceVerified:r.sourceVerified===true,reviewerApproval:r.reviewerApproval===true};
}
return {STATUSES,validateRegistry,toRegistryRule,toUiRule,isDate};
});
