/**
 * v0.3.0 -- File Upload
 *
 * Optional metadata sent alongside the multipart file upload.
 * The actual file comes via @UploadedFile() (Multer), not this DTO.
 */
export class UploadFileDto {
  description?: string;
}
