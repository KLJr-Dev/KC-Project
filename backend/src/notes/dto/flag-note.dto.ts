/**
 * PUT /notes/:id/flag — moderator/admin moderation (mirrors file approve).
 * Note: do not use @IsNotEmpty on boolean — `false` would fail validation.
 */
import { IsBoolean } from 'class-validator';

export class FlagNoteDto {
  @IsBoolean({ message: 'flagged must be a boolean' })
  flagged!: boolean;
}
