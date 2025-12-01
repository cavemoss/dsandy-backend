import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Subdomain } from './subdomain.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bool', default: false, select: false })
  isAdmin: boolean;

  @Column('varchar')
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'bigint', nullable: true, default: null, unique: true })
  tgChatId: number | null;

  @OneToMany(() => Subdomain, s => s.tenant, { eager: true, cascade: ['insert'] })
  subdomains: Subdomain[];

  @BeforeInsert()
  protected async before() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
}
