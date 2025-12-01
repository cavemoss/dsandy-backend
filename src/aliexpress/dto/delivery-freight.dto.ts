import { dsDeliveryFreightExp1 } from '../examples/ds-delivery-freight';
import { AliCommonResponseDTO } from './common.dto';

export interface AliDeliveryFreightRequestDTO {
  method: 'aliexpress.ds.freight.query';
  queryDeliveryReq: {
    cityCode: string;
    currency: string;
    language: string;
    locale: string;
    productId: number;
    provinceCode: string;
    quantity: number;
    selectedSkuId: string;
    shipToCountry: string;
  };
}

export type AliDeliveryFreightDTO = AliCommonResponseDTO<
  'aliexpress_ds_freight_query_response',
  typeof dsDeliveryFreightExp1
>;
