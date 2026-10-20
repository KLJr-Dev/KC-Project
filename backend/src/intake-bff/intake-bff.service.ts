/**
 * Cycle-9 Blue — thin Nest BFF → FastAPI Intake (Onboarding squad).
 *
 * Forwards Bearer + Nest-planted hop identity (DB role). Never client X-User-*.
 */
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';

const FETCH_TIMEOUT_MS = 15_000;

export type IntakeForwardResult = {
  status: number;
  contentType: string | null;
  body: Buffer;
};

export type IntakeHopIdentity = {
  userId: string;
  userRole: string;
  authorization?: string;
  requestId?: string;
};

@Injectable()
export class IntakeBffService {
  private baseUrl(): string {
    return (process.env.INTAKE_URL || 'http://intake:8000').replace(/\/$/, '');
  }

  async forward(
    method: string,
    pathAndQuery: string,
    identity: IntakeHopIdentity,
    body: Buffer | undefined,
    contentType: string | undefined,
  ): Promise<IntakeForwardResult> {
    const url = `${this.baseUrl()}/${pathAndQuery.replace(/^\//, '')}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const requestId = identity.requestId || randomUUID();

    const headers: Record<string, string> = {
      'X-User-Id': identity.userId,
      'X-User-Role': identity.userRole,
      'X-Request-Id': requestId,
      Accept: '*/*',
    };
    if (identity.authorization) {
      headers.Authorization = identity.authorization;
    }
    if (body && body.length > 0 && contentType) {
      headers['Content-Type'] = contentType;
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body && body.length > 0 ? new Uint8Array(body) : undefined,
        signal: controller.signal,
        redirect: 'manual',
      });
      const buf = Buffer.from(await res.arrayBuffer());
      return {
        status: res.status,
        contentType: res.headers.get('content-type'),
        body: buf,
      };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new ServiceUnavailableException('Intake upstream timed out');
      }
      throw new ServiceUnavailableException(
        `Intake upstream failed: ${(err as Error).message || 'unknown'}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
