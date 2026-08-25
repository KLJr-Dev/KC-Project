/**
 * Cycle-4 SoftDev — Seed demo notes for `v1.2.0` (XSS → SSH path).
 *
 * Plants:
 * - Admin ops note (owner admin@kc.test): real SSH foothold material + F2
 * - Decoy notes with wrong hosts/users/passwords
 * - User HTML note with F1 (XSS / render checkpoint)
 *
 * F3 lives on the SSH host (`user.txt`), not in this migration.
 * Idempotent on note id. Requires SeedDemoUsers (9001–9003) + CreateNoteEntity.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  CYCLE4_FLAG_F1,
  CYCLE4_FLAG_F2,
  CYCLE4_SSH_LAB_PASSWORD,
} from '../notes/cycle4-plants';

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
      title: 'ops: bastion access (do not share)',
      body: [
        '# Internal bastion',
        '',
        'Jump host for the lab appliance. **Do not** paste into tickets.',
        '',
        `- user: \`lab\``,
        `- password: \`${CYCLE4_SSH_LAB_PASSWORD}\``,
        '- port: `2222` (not 22)',
        '- host: compose service / published overlay port on the box IP',
        '',
        'Home has `user.txt` and a `.bak` clutter pile. No sudo — foothold only.',
        '',
        `Checkpoint: ${CYCLE4_FLAG_F2}`,
        '',
        '<p style="display:none">ops-meta: ssh-lab-real</p>',
      ].join('\n'),
      flagged: false,
    },
    {
      id: '9202',
      ownerId: '9003',
      title: 'old jump host (retired)',
      body: [
        'Retired — ignore.',
        'ssh root@10.0.0.5 -p 22',
        'password: Summer2024!',
        'user: kc',
      ].join('\n'),
      flagged: false,
    },
    {
      id: '9203',
      ownerId: '9001', // demo_user
      title: 'meeting notes — XSS scratchpad',
      body: [
        '<h2>Scratchpad</h2>',
        '<p>Paste snippets below for the notes HTML preview.</p>',
        `<p>XSS checkpoint: <code>${CYCLE4_FLAG_F1}</code></p>`,
        '<p>Try: <img src=x onerror="console.log(\'xss\')"> or markdown mode with raw HTML.</p>',
      ].join('\n'),
      flagged: false,
    },
    {
      id: '9204',
      ownerId: '9001',
      title: 'todo: rotate vpn',
      body: 'VPN user `vpn-lab` / `ChangeMe!` — not related to bastion.',
      flagged: false,
    },
    {
      id: '9205',
      ownerId: '9002', // mod
      title: 'mod queue reminder',
      body: 'Flag noisy notes. Do not delete — admins delete. SSH rumors in #ops are often decoys.',
      flagged: false,
    },
    {
      id: '9206',
      ownerId: '9004', // other (may exist from files seed)
      title: 'personal diary',
      body: 'ssh user@localhost password Password123 — leftover from a workshop VM.',
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
