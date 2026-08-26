import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PreviewDto } from './dto/preview.dto';

const FETCH_TIMEOUT_MS = 5_000;
const MAX_BODY_BYTES = 64_000;

export type PreviewResult = {
  url: string;
  status: number;
  contentType: string | null;
  title: string | null;
  snippet: string;
};

/**
 * Link Preview — Cycle-6 intentional open fetch (CWE-918 / FC-03).
 * No allowlist, no block of loopback/link-local/IMDS on v1.3.0.
 */
@Injectable()
export class PreviewService {
  async preview(dto: PreviewDto): Promise<PreviewResult> {
    let parsed: URL;
    try {
      parsed = new URL(dto.url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException('Only http/https URLs are supported');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(parsed.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'KC-Project-LinkPreview/1.3.0' },
      });
      const buf = Buffer.from(await res.arrayBuffer());
      const truncated = buf.subarray(0, MAX_BODY_BYTES);
      const text = truncated.toString('utf8');
      const contentType = res.headers.get('content-type');
      const titleMatch = text.match(/<title[^>]*>([^<]*)<\/title>/i);
      return {
        url: parsed.toString(),
        status: res.status,
        contentType,
        title: titleMatch ? titleMatch[1].trim() : null,
        snippet: text.slice(0, 500),
      };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new ServiceUnavailableException('Upstream fetch timed out');
      }
      throw new ServiceUnavailableException(
        `Upstream fetch failed: ${(err as Error).message || 'unknown'}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
