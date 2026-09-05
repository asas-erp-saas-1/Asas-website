# Security Policy

## Reporting

Do not disclose security vulnerabilities in public issues or pull requests.

Report suspected vulnerabilities privately through GitHub's repository security reporting channel when available.

## Engineering rules

ASAS security work must preserve:
- server-authoritative authorization
- least-privilege GitHub Actions permissions
- no committed secrets
- no production database manipulation from CI
- audited and reversible operational changes
- evidence-backed completion claims

Security fixes should include a regression test whenever the defect is testable.
