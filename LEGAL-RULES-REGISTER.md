# Legal Rules Register — ComplianceDesk India

**Status: governance template only. No statutory deadlines in this document are approved for production.**

This register is intended to prevent an unreviewed deadline, outdated provision, or incorrect applicability assumption from silently becoming a compliance rule. Official portals are entry points for research; a link alone is not evidence that a specific rule is current.

## Minimum fields required for every rule

| Field | Required content |
|---|---|
| Rule ID | Stable internal identifier; never reuse an ID for a different legal obligation |
| Obligation title | Plain-language description of the action required |
| Regime | Companies Act, LLP Act, GST, income tax, labour law, FEMA, SEBI, RBI, state law, etc. |
| Primary authority | Exact Act/section, rule, form, notification, circular or regulation |
| Official source | Direct official URL to the relevant source or document |
| Source type | Act, rule, Gazette notification, circular, form instruction, order or official FAQ |
| Published date | Date the source was published, where available |
| Effective from / to | Legal commencement and end date, if applicable |
| Applicability | Entity type, size, listing status, thresholds, turnover, industry, state and other triggers |
| Exceptions / relief | Exemptions, exclusions, extensions, condonation, transitional rules and relevant conditions |
| Trigger event | Financial year-end, board decision, appointment, allotment, change, notice or other event |
| Deadline algorithm | Explicit calculation method, calendar-day/business-day treatment, holidays and inclusivity |
| Required output | Filing, register entry, notice, resolution, payment, return, disclosure or evidence |
| Reviewer | Named qualified reviewer or designated compliance owner |
| Reviewed on | Date the reviewer checked the source and facts |
| Version | Internal version, plus previous version reference |
| Test cases | Ordinary case, boundary dates, exception case, amended-law case and negative case |
| Status | Draft, research needed, in review, approved, suspended, superseded |
| Change history | Who changed what, when, and why |

## Rule lifecycle

1. **Capture:** Create a draft record and identify the source.
2. **Verify primary law:** Read the exact provision and related rules, forms, instructions, commencement notifications and amendments.
3. **Check applicability:** Record facts and conditions; do not assume every company or LLP has the same obligation.
4. **Calculate:** Write a deterministic deadline method and document assumptions, extensions, holidays and event-date treatment.
5. **Test:** Test standard cases, edge cases and historical effective dates.
6. **Review:** A qualified reviewer approves the rule and its evidence.
7. **Publish:** Only approved, effective rules can generate statutory alerts.
8. **Monitor:** Review official updates and mark potentially affected rules as needing review.
9. **Supersede:** Keep historical versions; do not overwrite a rule that was valid for a previous period.

## Official research starting points

- Ministry of Corporate Affairs (MCA): https://www.mca.gov.in/
- India Code: https://www.indiacode.nic.in/
- e-Gazette of India: https://egazette.gov.in/
- GST Portal: https://www.gst.gov.in/
- Income Tax Department: https://www.incometax.gov.in/
- Ministry of Labour & Employment: https://labour.gov.in/
- Securities and Exchange Board of India: https://www.sebi.gov.in/
- Reserve Bank of India: https://www.rbi.org.in/

## Initial implementation priorities

1. Companies Act, 2013 and Companies (Management and Administration) Rules: annual/event-based filing catalog, applicability and form references.
2. LLP Act, 2008 and LLP Rules: annual/event-based filings and partner/LLP agreement changes.
3. Board/shareholder meeting workflows, Secretarial Standards and company-specific constitutional documents.
4. GST, income tax, FEMA, labour and state-specific obligations as separate rule families.
5. Regulatory update intake and a human approval queue before any legal rule is changed.

## Safety requirements

- Never label a sample date as a verified statutory due date.
- Never infer legal applicability from entity type alone when facts or thresholds are required.
- Keep the source snapshot/version and review date with the rule.
- Do not use an LLM-generated summary as the sole legal authority.
- If an amendment or extension may affect a rule, flag it for review rather than silently recalculating all clients' deadlines.
- The prototype is not legal advice and must not be used as the sole compliance control.
