import { AliProductInfoDTO } from 'src/aliexpress/dto/product-info.dto';

import { Product } from '../dto/products.dto';
import { DProduct } from '../entities/dynamic-product.entity';

export const mapAliProduct = (
  p: AliProductInfoDTO,
  { id, aliProductId, subdomainName, config }: DProduct,
): Product => {
  const ptr = p.aliexpress_ds_product_get_response.result;

  return {
    id,
    subdomainName,
    aliProductId,
    name: ptr.ae_item_base_info_dto.subject,
    logistics: {
      deliveryTime: ptr.logistics_info_dto.delivery_time,
      shipTo: ptr.logistics_info_dto.ship_to_country,
    },
    images: ptr.ae_multimedia_info_dto.image_urls.split(';'),
    feedback: {
      reviewsCount: parseInt(ptr.ae_item_base_info_dto.evaluation_count),
      salesCount: ptr.ae_item_base_info_dto.sales_count,
      rating: parseFloat(ptr.ae_item_base_info_dto.avg_evaluation_rating),
    },
    specifications: ptr.ae_item_properties.ae_item_property.map(p => [p.attr_name, p.attr_value]),
    descriptionHtml: ptr.ae_item_base_info_dto.detail,
    scus: ptr.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.map((dto, idx) => {
      const {
        sku_property_id: propertyId,
        property_value_id: propertyValueId,
        sku_property_name: propertyName,
        property_value_definition_name: propertyValueName,
        sku_image: image,
      } = dto.ae_sku_property_dtos.ae_sku_property_d_t_o[0];

      let dcPrice: number;

      return {
        id: idx + 1,
        image,
        aliScuId: dto.sku_id,
        propertyId,
        propertyValueId,
        propertyName,
        propertyValueName,
        availableStock: dto.sku_available_stock,
        priceInfo: {
          currency: dto.currency_code,
          price: dto.sku_price,
          offerPrice: dto.offer_sale_price,
          offerBulkPrice: dto.offer_bulk_sale_price,

          dsPrice: (dcPrice = +dto.sku_price * config.priceMult),
          dsOfferPrice: +(dcPrice * config.discountMult).toFixed(2),
        },
      };
    }),
  };
};
