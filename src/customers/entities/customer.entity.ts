import { Subdomain } from 'src/admin/entities/subdomain.entity';
import { encryptPassword } from 'src/auth/lib/auth.utils';
import { Order } from 'src/orders/entities/order.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export interface CustomerInfoDTO {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CustomerPreferencesDTO {
  currency: string;
  country: string;
  language: string;
}

@Entity('customers')
@Unique(['subdomainName', 'email'])
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  subdomainName: string;

  @Column('varchar')
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column('json')
  info: CustomerInfoDTO;

  @Column('json')
  preferences: CustomerPreferencesDTO;

  @OneToMany(() => Order, o => o.customer, { onDelete: 'RESTRICT' })
  orders?: Order;

  @ManyToOne(() => Subdomain, s => s.customers)
  @JoinColumn({ name: 'subdomain_name', foreignKeyConstraintName: 'fk_customers_subdomain_name' })
  subdomain: Subdomain;

  @BeforeInsert()
  protected async before() {
    this.password = await encryptPassword(this.password);
  }
}
