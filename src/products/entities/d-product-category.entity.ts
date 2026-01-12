import { Subdomain } from 'src/admin/entities/subdomain.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DProduct } from './dynamic-product.entity';

@Entity('d_product_category')
export class DProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  subdomainName: string;

  @Column('varchar')
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @ManyToMany(() => DProduct, o => o.categories)
  dProducts?: DProduct[];

  @ManyToOne(() => Subdomain, s => s.dProductCategories, { orphanedRowAction: 'delete' })
  @JoinColumn({
    name: 'subdomain_name',
    foreignKeyConstraintName: 'fk_d_product_categories_subdomain_name',
  })
  subdomain?: Subdomain;
}
