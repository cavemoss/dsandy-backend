import {
  aliOrderCreatePayResponseExp1,
  aliOrderCreatePayResponseExp2,
} from '../examples/order-create-pay';
import { AliCommonResponseDTO } from './common.dto';

export interface AliPlaceOrderRequestDTO {
  method: 'aliexpress.ds.order.create';
  param_place_order_request4_open_api_d_t_o: {
    logistics_address: AliPlaceOrderLogisticsAddressDTO;
    product_items: AliPlaceOrderProductItemDTO[];
  };
}

export interface AliPlaceOrderLogisticsAddressDTO {
  address: string;
  address2?: string;
  country: string;
  city: string;
  province: string;
  zip?: string;
  full_name?: string;
  contact_person?: string;
  phone_country?: string;
  mobile_no?: string;
}

export interface AliPlaceOrderProductItemDTO {
  product_count: number;
  product_id: number;
  sku_attr?: string;
  logistics_service_name?: string;
  order_memo?: string;
}

export type AliPlaceOrderResponseDTO = AliCommonResponseDTO<
  'aliexpress_ds_order_create_response',
  typeof aliOrderCreatePayResponseExp1 & typeof aliOrderCreatePayResponseExp2
>;
