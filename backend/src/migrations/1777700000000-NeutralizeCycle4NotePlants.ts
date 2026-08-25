/**
 * Cycle-4 Blue (`v2.2.0`) — neutralize SoftDev note plants on existing DBs (C4-F02).
 *
 * SeedDemoNotes may already have run with live SSH/flags. This migration UPDATEs
 * those rows in place. Greenfield installs get the rewritten SeedDemoNotes bodies.
 * CTF/GT values remain on tag `v1.2.0` / branch `ctf/v1.2.0` only.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const SECURE_NOTES: Array<{ id: string; title: string; body: string }> = [
  {
    id: '9201',
    title: 'ops: standup notes',
    body: [
      'Weekly ops standup.',
      '',
      '- Rotate lab TLS certs before the recruiter demo.',
      '- Keep bastion access in the secrets vault — not in Notes.',
      '- Flag noisy notes; admins delete when needed.',
    ].join('\n'),
  },
  {
    id: '9202',
    title: 'old jump host (retired)',
    body: 'Retired jump host ticket closed. No credentials stored here.',
  },
  {
    id: '9203',
    title: 'meeting notes — scratchpad',
    body: [
      'Scratchpad for meeting bullets.',
      '',
      '- Follow up with mod on review queue.',
      '- Keep note bodies as plain text.',
    ].join('\n'),
  },
  {
    id: '9204',
    title: 'todo: rotate vpn',
    body: 'Reminder: rotate personal VPN profile this month (IT ticket).',
  },
  {
    id: '9205',
    title: 'mod queue reminder',
    body: 'Flag noisy notes. Do not delete — admins delete.',
  },
  {
    id: '9206',
    title: 'personal diary',
    body: 'Workshop leftovers cleaned up — nothing sensitive here.',
  },
];

export class NeutralizeCycle4NotePlants1777700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const now = new Date().toISOString();
    for (const n of SECURE_NOTES) {
      await queryRunner.query(
        `UPDATE "note_entity"
         SET title = $2, body = $3, "updatedAt" = $4
         WHERE id = $1`,
        [n.id, n.title, n.body, now],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Irreversible without re-introducing secrets — leave bodies as-is on down.
    void queryRunner;
  }
}
