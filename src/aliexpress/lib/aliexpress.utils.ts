import { OrderTrackingDTO } from 'src/orders/entities/order.entity';

import { AliDeliveryFreightDTO } from '../dto/delivery-freight.dto';
import { AliOrderTrackingResponseDTO } from '../dto/order-tracking';
import { AliProductInfoDTO } from '../dto/product-info.dto';

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
    carrier: ptr.carrier_name,
    trackingNumber: null,
    deliveryDays: 10,
  };
};

export function verifyAliProductInfo(dto: AliProductInfoDTO) {
  const { rsp_code, rsp_msg } = dto.aliexpress_ds_product_get_response;

  if (rsp_code !== 200) {
    throw new Error('ALI_GET_PRODUCT_FAIL', { cause: rsp_msg });
  }

  const ptr = dto.aliexpress_ds_product_get_response.result;

  const ptr2 = ptr.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o;

  if (!ptr2.length) {
    throw new Error('ALI_NO_SCUS');
  }

  const scuLayers = ptr2[0].ae_sku_property_dtos.ae_sku_property_d_t_o.length;

  if (scuLayers < 1) {
    throw new Error('ALI_SCU_COMBINATIONS_ERROR');
  }

  for (let i = 1; i < ptr2.length; i++) {
    const ptr3 = ptr2[i].ae_sku_property_dtos.ae_sku_property_d_t_o;

    if (!ptr3 || !Array.isArray(ptr3) || ptr3.length !== scuLayers) {
      throw new Error('ALI_SCU_COMBINATIONS_ERROR', { cause: ptr2 });
    }
  }
}

export function verifyAliDeliveryLogisticsInfo(dto: AliDeliveryFreightDTO) {
  const { result } = dto.aliexpress_ds_freight_query_response;

  if (result.code !== 200) {
    throw new Error('ALI_GET_LOGISTICS_FAIL', { cause: result.msg });
  }

  const deliveryDays = +result?.delivery_options?.delivery_option_d_t_o?.[0]?.max_delivery_days;

  if (typeof deliveryDays != 'number') {
    throw new Error('ALI_LOGISTICS_INFO_MALFORMED', { cause: result });
  }
}
