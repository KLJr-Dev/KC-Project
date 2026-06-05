/**
 * v0.5.0 — Input Validation Pipeline: UploadFileDto
 *
 * Optional metadata sent alongside multipart file upload.
 * The actual file comes via @UploadedFile() (Multer), not this DTO.
 *
 * v0.5.0 adds validators:
 * - description: @IsString, @IsOptional (NO max length — CWE-400 unbounded)
 *
 * VULN (Intentional):
 *   - CWE-400 (Uncontrolled Resource Consumption): description field unbounded
 *     DoS via large payloads (e.g., 1GB description string)
 */
import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsString({ message: 'description must be a string' })
  @IsOptional()
  description?: string;
}
