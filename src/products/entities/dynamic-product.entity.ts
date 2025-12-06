import { Subdomain } from 'src/admin/entities/subdomain.entity';
import { Order } from 'src/orders/entities/order.entity';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export interface DProductConfig {
  priceMult: number;
  discountMult: number;
}

@Entity('dynamic_products')
@Unique(['id', 'aliProductId'])
export class DProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  subdomainName: string;

  @Column('bigint')
  aliProductId: number;

  @Column('json')
  config: DProductConfig;

  @ManyToMany(() => Order, o => o.dProducts)
  orders?: Order[];

  @ManyToOne(() => Subdomain, s => s.dProducts, { orphanedRowAction: 'delete' })
  @JoinColumn({
    name: 'subdomain_name',
    foreignKeyConstraintName: 'fk_dynamic_products_subdomain_name',
  })
  subdomain?: Subdomain;

  @AfterLoad()
  protected afterLoad() {
    this.config.discountMult ??= 0.8;
    this.config.priceMult ??= 1.2;
  }
}
