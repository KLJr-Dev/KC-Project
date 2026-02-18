# ADR-024: File Storage Strategy

## Status

Accepted

## Context

v0.3.x introduces real file handling: multipart uploads, filesystem storage,
streaming downloads, and public sharing. A storage strategy must be chosen.

Options considered:

| Option | Pros | Cons |
|--------|------|------|
| **Local filesystem (`./uploads/`)** | Zero infrastructure, simple, debuggable | Single-node only, no redundancy, path traversal risk |
| Database BLOBs | Transactional consistency | Bloats database, slow for large files |
| Object storage (S3/MinIO) | Scalable, battle-tested | Adds infrastructure dependency, overkill for teaching project |
| In-memory buffers | No disk I/O | Lost on restart, memory-bound |

## Decision

Store uploaded files on the local filesystem under `backend/uploads/` using
Multer `diskStorage`. The client-supplied `originalname` is used as the disk
filename with **no sanitisation** (intentional CWE-22). No upload size limit
is configured (intentional CWE-400). File metadata (mimetype, storagePath,
size) is persisted in the `file_entity` PostgreSQL table.

This is the simplest option that allows demonstrating real file I/O
vulnerabilities without adding external dependencies. It aligns with
ADR-006 (insecure by design) and ADR-020 (Docker for DB only).

## Consequences

### Positive

- No new infrastructure beyond the existing PostgreSQL container.
- Real file I/O enables realistic vulnerability demonstrations: path traversal
  (CWE-22), MIME confusion (CWE-434), unbounded uploads (CWE-400).
- `storagePath` exposed in API responses enables CWE-200 demonstrations.
- Simple debugging: files visible on disk during development.

### Negative / Intentional Weaknesses

- **CWE-22 (Path Traversal)**: Client-supplied filenames used directly in
  `diskStorage` callback. If the multipart parser is bypassed, `../` sequences
  write outside the uploads directory.
- **CWE-434 (Unrestricted Upload)**: No magic-byte validation. A `.html` file
  can claim `image/png`. Server stores and serves with client-supplied
  Content-Type.
- **CWE-400 (No Size Limit)**: Multer has no `limits.fileSize` configured.
  An attacker can exhaust disk space.
- **CWE-200 (Info Exposure)**: `storagePath` (absolute filesystem path)
  returned in API responses reveals server directory structure.
- **Single-node only**: No replication, no CDN, no signed URLs.
- **No cleanup on failure**: If the service layer throws after Multer writes
  the file, the orphaned file remains on disk.

### Remediation (v2.0.0)

- Canonicalise and chroot filenames to `uploads/`.
- Validate MIME via magic bytes (e.g. `file-type` package).
- Configure `limits.fileSize` on Multer.
- Strip `storagePath` from API responses.
- Consider S3-compatible object storage for multi-node deployments.

## References

- ADR-006: Insecure by Design
- ADR-020: Docker for Database Only
- OWASP Top 10:2025 A01 (Broken Access Control), A06 (Vulnerable Components)
- CWE-22, CWE-200, CWE-400, CWE-434
