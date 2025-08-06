import { SubdomainEnum } from 'lib/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as ProductJson from '../dto/product-json.namespace';
import { SupplierEnum } from 'src/admin/dto/scraper-service.dto';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', enum: SubdomainEnum })
  subdomain: SubdomainEnum;

  @Column({ type: 'smallint', enum: SupplierEnum })
  supplier: SupplierEnum;

  @Column({ type: 'varchar', length: 36 })
  scrapeUid: string;

  @Column({ type: 'bigint', nullable: true })
  aliProductId: number;

  @Column({ type: 'boolean' })
  inStock: boolean;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  descriptionHtml: string;

  @Column({ type: 'json' })
  gallery: ProductJson.GalleryItem[];

  @Column({ type: 'json' })
  specifications: ProductJson.Specification[];

  @Column({ type: 'json' })
  variants: ProductJson.Variant[];

  @Column({ type: 'json' })
  variantsSize: ProductJson.VariantSize[];

  @Column({ type: 'json' })
  feedbackInfo: ProductJson.FeedbackInfo;

  @Column({ type: 'json' })
  deliveryInfo: ProductJson.DeliveryInfo;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
