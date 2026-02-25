import { dsDeliveryFreightExp1 } from '../examples/ds-delivery-freight';
import { AliCommonResponseDTO } from './common.dto';

export interface AliDeliveryFreightRequestDTO {
  method: 'aliexpress.ds.freight.query';
  queryDeliveryReq: {
    shipToCountry: string;
    language: string;
    locale: string;
    currency: string;
    productId: number;
    selectedSkuId: string;
    quantity: number;
  };
}

export type AliDeliveryFreightDTO = AliCommonResponseDTO<
  'aliexpress_ds_freight_query_response',
  typeof dsDeliveryFreightExp1
>;
