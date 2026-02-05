import {
  orderTrackingExp1,
  orderTrackingExp2,
  orderTrackingExp3,
} from '../examples/order-tracking';
import { AliCommonResponseDTO } from './common.dto';

export interface AliOrderTrackingRequestDTO {
  method: 'aliexpress.ds.order.tracking.get';
  ae_order_id: number;
  language: string;
}

export type AliOrderTrackingResponseDTO = AliCommonResponseDTO<
  'aliexpress_ds_order_tracking_get_response',
  typeof orderTrackingExp1 & typeof orderTrackingExp2 & typeof orderTrackingExp3
>;
