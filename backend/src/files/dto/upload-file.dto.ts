/**
 * Optional metadata with multipart upload (v2.1.0).
 * File bytes come via @UploadedFile() (Multer), not this DTO.
 */
import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsString({ message: 'description must be a string' })
  @IsOptional()
  description?: string;
}
