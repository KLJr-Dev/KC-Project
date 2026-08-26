import {
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class PreviewDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false, require_protocol: true })
  @MaxLength(2048)
  url!: string;
}
