import { aliProductInfoExp1 } from '../examples/ali-product-info';
import { AliCommonResponseDTO } from './common.dto';

export interface GetProductInfoQuery {
  shipToCountry: string;
  productId: number;
  currency: string;
  language: string;
}

export interface AliProductInfoRequestDTO {
  method: 'aliexpress.ds.product.get';
  ship_to_country: string;
  product_id: number;
  target_currency: string;
  target_language: string;
  remove_personal_benefit: false;
  biz_model: 'biz_model';
}

export type AliProductInfoDTO = AliCommonResponseDTO<
  'aliexpress_ds_product_get_response',
  typeof aliProductInfoExp1
>;
