import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cdn_favicon')
export class CDNFavicon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  subdomainName: string;

  @Column({ type: 'bytea' })
  data: Buffer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
