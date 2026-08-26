/**
 * Cycle-6 Blue (`v2.3.0`) — Preview destination policy (CWE-918).
 * Blocks loopback, link-local, private RFC1918/ULA, and common cloud metadata hosts.
 */
import { lookup } from 'dns/promises';
import { isIP } from 'net';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.goog',
  'metadata',
]);

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map((p) => Number(p));
  return ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0;
}

function isBlockedIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  // 0.0.0.0/8, 127.0.0.0/8
  if (n <= 0x00ffffff || (n >= 0x7f000000 && n <= 0x7fffffff)) return true;
  // 10.0.0.0/8
  if (n >= 0x0a000000 && n <= 0x0affffff) return true;
  // 172.16.0.0/12
  if (n >= 0xac100000 && n <= 0xac1fffff) return true;
  // 192.168.0.0/16
  if (n >= 0xc0a80000 && n <= 0xc0a8ffff) return true;
  // 169.254.0.0/16 link-local / IMDS
  if (n >= 0xa9fe0000 && n <= 0xa9feffff) return true;
  // 100.64.0.0/10 CGNAT
  if (n >= 0x64400000 && n <= 0x647fffff) return true;
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  // Unique local fc00::/7
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  // Link-local fe80::/10
  if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb'))
    return true;
  return false;
}

export function isBlockedIpLiteral(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return isBlockedIpv4(ip);
  if (v === 6) return isBlockedIpv6(ip);
  return true;
}

/**
 * Throws Error with message suitable for BadRequestException if URL is unsafe.
 */
export async function assertPreviewUrlAllowed(raw: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('Invalid URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http/https URLs are supported');
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host) throw new Error('Invalid URL host');

  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new Error('URL host is not allowed');
  }

  if (isIP(host)) {
    if (isBlockedIpLiteral(host)) {
      throw new Error('URL host is not allowed');
    }
    return parsed;
  }

  // Resolve DNS and reject if any answer is blocked (basic DNS rebinding mitigation).
  try {
    const results = await lookup(host, { all: true, verbatim: true });
    if (!results.length) throw new Error('URL host could not be resolved');
    for (const r of results) {
      if (isBlockedIpLiteral(r.address)) {
        throw new Error('URL host is not allowed');
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'URL host is not allowed') throw err;
    throw new Error('URL host could not be resolved');
  }

  return parsed;
}
