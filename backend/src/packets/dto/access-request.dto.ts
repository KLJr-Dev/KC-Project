/**
 * Cycle-10 — Stage-0 access request body (`POST /access-requests`).
 *
 * CYCLE10-PLANT: successful submit creates a **moderator** (not admin).
 * Password policy mirrors `/auth/register` so open-register noise and Stage-0
 * share the same strength rules — only the resulting *role* differs.
 *
 * @see ../../auth/dto/register.dto.ts
 */
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_COMPLEXITY_MESSAGE,
  PASSWORD_COMPLEXITY_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MAX_LENGTH_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from '../../auth/password-policy';

export class AccessRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, { message: PASSWORD_MIN_LENGTH_MESSAGE })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: PASSWORD_MAX_LENGTH_MESSAGE })
  @Matches(PASSWORD_COMPLEXITY_REGEX, { message: PASSWORD_COMPLEXITY_MESSAGE })
  @IsNotEmpty()
  password!: string;

  /** Free-text reason — theatre for Northwind document-portal immersion. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
