# Contributing to ComplianceDesk India

## Legal correctness comes before automation

Do not add a statutory deadline, legal conclusion or automatic filing recommendation unless its source and applicability are documented and the rule has been reviewed.

## For a legal-rule change

Include:
- Exact statutory reference and direct official source link
- Source publication date and commencement/effective date
- Applicability criteria, exclusions and reliefs
- Trigger event and deadline calculation method
- At least one ordinary test case and one boundary/exception test
- Reviewer and review date
- Whether the change affects previously calculated tasks

Mark uncertain work as **Draft** or **Needs review**. Do not present it as approved.

## For code changes

- Keep user-entered data escaped before rendering in HTML.
- Avoid collecting unnecessary personal data.
- Do not add secrets, credentials, client identity documents or production data to the repository.
- Keep browser storage limitations clear until secure server-side persistence exists.
- Test desktop and mobile layouts, keyboard use, forms, export/import and failure cases.
- Do not claim a feature has been tested in a browser or deployed unless it has actually been tested or deployed.

## Suggested pull request checklist

- [ ] Scope and expected behaviour are explained.
- [ ] Legal changes include official source evidence and reviewer details.
- [ ] Dates, applicability and exceptions are covered by tests.
- [ ] No credentials or confidential data are included.
- [ ] Accessibility and responsive behaviour were checked.
- [ ] Documentation reflects the actual implementation.
