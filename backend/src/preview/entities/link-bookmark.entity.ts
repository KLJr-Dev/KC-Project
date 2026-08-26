import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('link_bookmark')
export class LinkBookmarkEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'varchar', length: 2048 })
  url!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  title!: string | null;

  @Column()
  createdAt!: string;
}
