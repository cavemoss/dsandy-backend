import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ali_access_tokens')
export class AliAccessToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  refreshToken: string;

  @Column()
  accessToken: string;

  @Column('bigint')
  expireTime: number;
}
