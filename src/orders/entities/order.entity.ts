import { Subdomain } from 'src/admin/entities/subdomain.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { DProduct } from 'src/products/entities/dynamic-product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatusEnum {
  PENDING,
  CUSTOMER_PAYED,
  PLACED_AT_ALI,
  TO_BE_SHIPPED,
  SHIPPED,
  COMPLEAT,
  REFUND_REQUESTED,
}

export interface OrderShippingInfoDTO {
  address: string;
  address2?: string;
  country: string;
  city: string;
  province: string;
  zipCode: string;
  message?: string;
}

export interface OrderContactInfoDTO {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export interface OrderPaymentInfoDTO {
  currency: string;
  amount: number;
}

export interface OrderItemDTO {
  dProductId: number;
  skuAttr: string;
  quantity: number;
}

export interface OrderMetadata {
  profit: number;
  products: {
    [id: number]: {
      name: string;
      variants: {
        properties: string[];
        quantity: number;
      }[];
    };
  };
}

export interface OrderTrackingDTO {
  stages: {
    name: string;
    description: string;
    timestamp: number;
  }[];
  carrier: string;
  deliveryDays: number;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  subdomainName: string;

  @Column({
    type: 'int',
    nullable: true,
    default: null,
  })
  customerId: number | null;

  @Column({
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  status: OrderStatusEnum;

  @Column('json')
  shippingInfo: OrderShippingInfoDTO;

  @Column('json')
  contactInfo: OrderContactInfoDTO;

  @Column('json')
  paymentInfo: OrderPaymentInfoDTO;

  @Column('json')
  orderItems: OrderItemDTO[];

  @Column('json')
  metadata: OrderMetadata;

  @Column({
    type: 'json',
    nullable: true,
    default: null,
  })
  trackingData: OrderTrackingDTO | null;

  @Column({
    type: 'bigint',
    nullable: true,
    default: null,
  })
  aliOrderId: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToMany(() => DProduct, p => p.orders, { cascade: ['remove'], eager: true })
  @JoinTable({ name: 'orders_dynamic_products' })
  dProducts: DProduct[];

  @ManyToOne(() => Customer, c => c.orders, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id', foreignKeyConstraintName: 'fk_orders_customer_id' })
  customer: Customer | null;

  @ManyToOne(() => Subdomain, s => s.orders)
  @JoinColumn({ name: 'subdomain_name', foreignKeyConstraintName: 'fk_orders_subdomain_name' })
  subdomain: Subdomain;
}
