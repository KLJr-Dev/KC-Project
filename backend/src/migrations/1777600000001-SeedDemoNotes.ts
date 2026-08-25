/**
 * Cycle-4 — Seed demo notes (greenfield).
 *
 * v2.2.0 Blue (C4-F02): innocuous product demos only — no live SSH passwords,
 * Cycle-4 flags, or XSS scratchpad plants. Insecure plants remain on tag/branch
 * `v1.2.0` / `ctf/v1.2.0` (see Cycle-4 GT). Neutralize migration updates existing DBs.
 *
 * Idempotent on note id. Requires SeedDemoUsers (9001–9003) + CreateNoteEntity.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDemoNotes1777600000001 implements MigrationInterface {
  private readonly notes: Array<{
    id: string;
    ownerId: string;
    title: string;
    body: string;
    flagged: boolean;
  }> = [
    {
      id: '9201',
      ownerId: '9003', // admin
      title: 'ops: standup notes',
      body: [
        'Weekly ops standup.',
        '',
        '- Rotate lab TLS certs before the recruiter demo.',
        '- Keep bastion access in the secrets vault — not in Notes.',
        '- Flag noisy notes; admins delete when needed.',
      ].join('\n'),
      flagged: false,
    },
    {
      id: '9202',
      ownerId: '9003',
      title: 'old jump host (retired)',
      body: 'Retired jump host ticket closed. No credentials stored here.',
      flagged: false,
    },
    {
      id: '9203',
      ownerId: '9001', // demo_user
      title: 'meeting notes — scratchpad',
      body: [
        'Scratchpad for meeting bullets.',
        '',
        '- Follow up with mod on review queue.',
        '- Keep note bodies as plain text.',
      ].join('\n'),
      flagged: false,
    },
    {
      id: '9204',
      ownerId: '9001',
      title: 'todo: rotate vpn',
      body: 'Reminder: rotate personal VPN profile this month (IT ticket).',
      flagged: false,
    },
    {
      id: '9205',
      ownerId: '9002', // mod
      title: 'mod queue reminder',
      body: 'Flag noisy notes. Do not delete — admins delete.',
      flagged: false,
    },
    {
      id: '9206',
      ownerId: '9004', // other (may exist from files seed)
      title: 'personal diary',
      body: 'Workshop leftovers cleaned up — nothing sensitive here.',
      flagged: false,
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const now = new Date().toISOString();

    for (const n of this.notes) {
      if (n.ownerId === '9004') {
        const other: unknown[] = await queryRunner.query(
          `SELECT 1 FROM "user" WHERE id = $1 LIMIT 1`,
          ['9004'],
        );
        if (other.length === 0) continue;
      }

      const existing: unknown[] = await queryRunner.query(
        `SELECT 1 FROM "note_entity" WHERE id = $1 LIMIT 1`,
        [n.id],
      );
      if (existing.length > 0) continue;

      await queryRunner.query(
        `INSERT INTO "note_entity"
          (id, "ownerId", title, body, flagged, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $6)`,
        [n.id, n.ownerId, n.title, n.body, n.flagged, now],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "note_entity" WHERE id IN ('9201','9202','9203','9204','9205','9206')`,
    );
  }
}
