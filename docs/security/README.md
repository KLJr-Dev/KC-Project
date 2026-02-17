# Security

This directory will contain security testing methodology, tools, reporting formats, and findings.

**Status: Deferred** -- content will be added closer to v1.0.0 when structured penetration testing begins.

---

## Planned Contents

### Methodology

- Pentesting approach and phases (reconnaissance, scanning, exploitation, reporting)
- Tool selection and configuration
- Testing scope per v1.N.0 version

### Tools

- Burp Suite (web application proxy and scanner)
- OWASP ZAP (open-source alternative)
- nmap (network scanning and service discovery)
- sqlmap (SQL injection automation)
- curl / httpie (manual API testing)
- Browser DevTools (client-side inspection)
- Custom scripts as needed

### Reporting

- Findings template (vulnerability, severity, reproduction steps, remediation)
- Per-cycle pentest reports (v1.0.x, v1.1.x, ...)

### Findings

- Documented vulnerabilities discovered during each pentest cycle
- Mapped to CWE, OWASP Top 10, and STRIDE categories

---

## Prerequisites

Before writing the methodology, these documents should be complete and stable:

- [threat-model.md](../diagrams/threat-model.md) -- defines the attack surface to test against
- [security-baseline.md](../spec/security-baseline.md) -- defines the target security posture
- [stride.md](../architecture/stride.md) -- provides the threat categorisation framework
