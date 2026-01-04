import { clamp } from 'lodash';
import { Subdomain } from 'src/admin/entities/subdomain.entity';
import { Order } from 'src/orders/entities/order.entity';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export interface DProductConfig {
  priceMult: Record<number, number>;
  discountMult: Record<number, number>;
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

  @BeforeInsert()
  @BeforeUpdate()
  @AfterLoad()
  protected verifyConfig() {}
}
