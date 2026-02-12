import { OrderTrackingDTO } from 'src/orders/entities/order.entity';

import { AliOrderTrackingResponseDTO } from '../dto/order-tracking';

export const mapOrderTrackingData = (dto: AliOrderTrackingResponseDTO): OrderTrackingDTO => {
  const ptr =
    dto.aliexpress_ds_order_tracking_get_response.result.data.tracking_detail_line_list
      .tracking_detail[0];

  return {
    stages: ptr.detail_node_list.detail_node.map(dto => ({
      name: dto.tracking_name,
      description: dto.tracking_detail_desc,
      timestamp: dto.time_stamp,
    })),
    isCompleat: false,
    carrier: ptr.carrier_name,
    deliveryDays: 10,
  };
};
