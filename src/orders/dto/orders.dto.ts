import {
  OrderContactInfoDTO,
  OrderItemDTO,
  OrderMetadata,
  OrderPaymentInfoDTO,
  OrderShippingInfoDTO,
} from '../entities/order.entity';

export interface PlaceOrderBodyDTO {
  contactInfo: OrderContactInfoDTO;
  shippingInfo: OrderShippingInfoDTO;
  orderItems: OrderItemDTO[];
  paymentInfo: OrderPaymentInfoDTO;
  metadata: OrderMetadata;
}

export interface UpdateOrderInfoBodyDTO {
  orderId: number;
  contactInfo: OrderContactInfoDTO;
  shippingInfo: OrderShippingInfoDTO;
}
