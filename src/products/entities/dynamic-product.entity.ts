import { Subdomain } from 'src/admin/entities/subdomain.entity';
import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { DProductCategory } from './d-product-category.entity';

export interface DProductConfig {
  title: string | null;
  priceMult: { [scuId: number]: number };
  discountMult: { [scuId: number]: number };
}

@Entity('dynamic_products')
@Unique(['id', 'aliProductId'])
export class DProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subdomainName: string;

  @Column('bigint')
  aliProductId: number;

  @Column('json')
  config: DProductConfig;

  @ManyToMany(() => Order, o => o.dProducts)
  orders?: Order[];

  @ManyToMany(() => DProductCategory, p => p.dProducts, { cascade: true, eager: true })
  @JoinTable({ name: 'dynamic_products_d_product_categories' })
  categories?: DProductCategory[];

  @ManyToOne(() => Subdomain, s => s.dProducts, { orphanedRowAction: 'delete' })
  @JoinColumn({
    name: 'subdomain_name',
    foreignKeyConstraintName: 'fk_dynamic_products_subdomain_name',
  })
  subdomain?: Subdomain;
}
