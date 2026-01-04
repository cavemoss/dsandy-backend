import { Customer } from 'src/customers/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';
import { DProduct } from 'src/products/entities/dynamic-product.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { Tenant } from './tenant.entity';

export interface SubdomainConfig {
  storeName: string;
  logo: {
    src?: string;
    fontBased?: {
      font?: string;
      color?: string;
      bold?: boolean;
      italic?: boolean;
    };
  };
  countries: string[];
  autoCalculateDiscountMult: boolean;
}

@Entity('subdomains')
export class Subdomain {
  @PrimaryColumn({ type: 'varchar', unique: true })
  name: string;

  @Column('int')
  tenantId: number;

  @Column('json')
  config: SubdomainConfig;

  @ManyToOne(() => Tenant, t => t.subdomains)
  @JoinColumn({ name: 'tenant_id', foreignKeyConstraintName: 'fk_subdomains_tenant_id' })
  tenant: Tenant;

  @OneToMany(() => DProduct, p => p.subdomain, { onDelete: 'CASCADE', eager: true, cascade: true })
  dProducts: DProduct[];

  @OneToMany(() => Order, p => p.subdomain, { onDelete: 'RESTRICT', eager: true })
  orders: Order[];

  @OneToMany(() => Customer, p => p.subdomain, { onDelete: 'CASCADE' })
  customers: Customer[];

  @BeforeInsert()
  protected before() {
    this.name = this.name.toLowerCase();
  }
}
