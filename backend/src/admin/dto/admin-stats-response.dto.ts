import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsResponseDto {
  @ApiProperty()
  userCount!: number;

  @ApiProperty()
  fileCount!: number;

  @ApiProperty()
  shareCount!: number;

  @ApiProperty()
  storageBytesEstimate!: number;
}
