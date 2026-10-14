# ComplianceDesk India

A compliance operations workspace for Indian companies, LLPs and corporate compliance professionals.

## Current scope

- Responsive dashboard for entity and compliance operations
- Company/LLP entity register with local browser persistence
- Compliance task register with status, due dates and priority
- Search and filtering across compliance tasks
- Statutory-source links and legal verification status
- Versioned legal rules registry scaffold with approval validation, JSON import/export and automated tests
- Export tasks to CSV
- Clear separation between illustrative tasks and verified legal deadlines

## Run locally

No build tools are required for the current front-end MVP.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. For a local development server, run `python -m http.server 8000` from the project directory and open `http://localhost:8000`.

## Legal rules registry and validation

The initial registry is `data/legal-rules.json`. It intentionally starts empty; no statutory deadlines are approved. Run `node scripts/validate-legal-rules.js` to validate it and `node --test scripts/validate-legal-rules.test.js scripts/legal-rules-registry-core.test.js` to run registry and browser-module tests. The screen loads the repository registry as its baseline and supports validated JSON import/export. Edits and imports remain browser-local and do not commit changes back to GitHub; update `data/legal-rules.json` through reviewed repository changes for a shared versioned update. The validator checks rule IDs, status values, dates, HTTPS source URLs, and mandatory evidence for rules marked approved. It does not independently verify that a cited source is authoritative or that a legal interpretation is correct; qualified human review remains required.

## GitHub Pages deployment

The workflow validates every push to `main`. To publish the static site, an owner/admin must first enable Pages in repository settings because the connected automation cannot create the Pages site with its current permissions:

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Return to **Actions** and rerun the latest `Validate and deploy ComplianceDesk India` workflow, or push a new commit to `main`.

A successful validation job does not mean deployment succeeded. Confirm that the deployment job completes and provides a Pages URL before sharing the site.

## Legal accuracy and use

This software is an operational aid, not legal advice. Statutory deadlines and applicability can depend on entity type, facts, financial year, event date, extensions, exemptions, commencement notifications and amendments. Sample tasks are marked as illustrative and must not be treated as verified legal advice.

Before any rule is enabled for production, record:
- legislation and section/rule/form reference
- official source URL and source publication date
- effective-from and effective-to dates, where applicable
- entity/applicability conditions and exceptions
- calculation method and triggering event
- reviewer, review date and version history
- test cases covering ordinary and exceptional scenarios

Prefer primary sources such as the Ministry of Corporate Affairs (MCA), e-Gazette of India, India Code, Income Tax Department, GST portal and relevant labour-law authorities. Verify current consolidated text and commencement status before relying on a provision.

## Privacy and security status

This is a client-side prototype. Data is stored in the current browser using localStorage and is not synced to a server. Do not enter sensitive personal information, identity documents, DSC credentials, passwords, or confidential client records. Authentication, server-side access control, encryption, backups, retention controls and audit logging are not yet implemented.

## Suggested roadmap

1. Legal rules registry with versioning and review workflow
2. Secure backend and database
3. Role-based access, client portal and audit log
4. Document template engine and DOCX/PDF generation
5. Regulatory update ingestion with human approval
6. Automated testing of deadline rules
7. Deployment, monitoring and backup strategy

## License

No license has been granted yet. Add a license before distributing or reusing this project publicly.
