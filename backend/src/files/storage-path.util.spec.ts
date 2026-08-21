import { ForbiddenException } from '@nestjs/common';
import { assertPathInsideUploads, uploadsRoot } from './storage-path.util';
import { join } from 'path';

describe('assertPathInsideUploads', () => {
  const root = uploadsRoot();

  it('allows paths under uploads/', () => {
    const p = join(root, 'safe.txt');
    expect(assertPathInsideUploads(p)).toBe(p);
  });

  it('rejects path traversal outside uploads/', () => {
    expect(() => assertPathInsideUploads(join(root, '..', 'etc', 'passwd'))).toThrow(
      ForbiddenException,
    );
  });
});
