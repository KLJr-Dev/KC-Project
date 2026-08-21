import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryColumn()
  id!: string;

  @Column()
  userId!: string;

  @Column()
  tokenHash!: string;

  @Column()
  expiresAt!: string;

  @Column({ default: false })
  revoked!: boolean;

  @Column()
  createdAt!: string;
}
