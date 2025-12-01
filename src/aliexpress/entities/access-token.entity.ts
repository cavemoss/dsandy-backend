import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ali_access_tokens')
export class AliAccessToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  refreshToken: string;

  @Column({ type: 'varchar' })
  accessToken: string;

  @Column({ type: 'bigint' })
  expireTime: number;
}
