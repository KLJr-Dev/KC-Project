/**
 * Note entity — Cycle-4 Notes product surface (secure tip `v2.2.0`).
 *
 * Product: user-owned notes with optional attachment metadata.
 * Authz: service-layer ownership + mod/admin read; admin delete-any; mod flag
 * (see NotesService — mirrors Files pattern, not Sharing).
 *
 * C4-F01: body is untrusted text — UI renders React-escaped plain text only
 * (no HTML/MD sink). Search uses parameterized ILike only (never concat).
 *
 * SoftDev insecure render / plants: tag/`ctf/v1.2.0` only.
 * Sequential string IDs: accepted residual (same as files/users).
 */
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('note_entity')
export class NoteEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  ownerId!: string;

  @Column()
  title!: string;

  /** Note body — untrusted plain text; UI must not HTML-sink (C4-F01). */
  @Column({ type: 'text' })
  body!: string;

  /** Moderator/admin moderation flag (Cycle-4 tertiary RBAC). */
  @Column({ default: false })
  flagged!: boolean;

  @Column({ nullable: true })
  attachmentFilename?: string;

  @Column({ nullable: true })
  attachmentMimetype?: string;

  /** Disk path — never expose in API response DTOs. */
  @Column({ nullable: true })
  attachmentStoragePath?: string;

  @Column()
  createdAt!: string;

  @Column()
  updatedAt!: string;
}
