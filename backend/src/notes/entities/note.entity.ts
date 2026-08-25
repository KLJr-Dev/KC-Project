/**
 * Note entity — Cycle-4 SoftDev surface (`v1.2.0` intentional insecure tip).
 *
 * Product: user-owned notes with optional attachment metadata (upload wired in P1c).
 * Authz: service-layer ownership + mod/admin read; admin delete-any; mod flag
 * (see NotesService — mirrors Files pattern, not Sharing).
 *
 * XSS is NOT stored here as a “feature flag”: the insecure tip renders `body`
 * unsafely in the frontend. Search uses parameterized ILike only (never concat).
 *
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

  /** Note body — may contain HTML/markdown; sanitize on secure v2.2.0 render path. */
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
