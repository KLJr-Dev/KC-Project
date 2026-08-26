import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PreviewDto } from './dto/preview.dto';
import { assertPreviewUrlAllowed } from './preview-url.policy';

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
 * Link Preview — Cycle-6 Blue (`v2.3.0`): destination policy (CWE-918).
 */
@Injectable()
export class PreviewService {
  async preview(dto: PreviewDto): Promise<PreviewResult> {
    let parsed: URL;
    try {
      parsed = await assertPreviewUrlAllowed(dto.url);
    } catch (err) {
      throw new BadRequestException((err as Error).message || 'Invalid URL');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(parsed.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'KC-Project-LinkPreview/2.3.0' },
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
