import { AliProductReviewsDTO } from 'src/aliexpress/dto/get-reviews.dto';
import { AliProductInfoDTO } from 'src/aliexpress/dto/product-info.dto';

import { Product, ProductReviews } from '../dto/products.dto';
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
      const id = idx + 1;

      const {
        sku_property_id: propertyId,
        property_value_id: propertyValueId,
        sku_property_name: propertyName,
        property_value_definition_name: propertyValueName,
        sku_image: image,
      } = dto.ae_sku_property_dtos.ae_sku_property_d_t_o[0];

      const priceMult = config.priceMult[id] ?? 1;
      const discountMult = config.discountMult[id] ?? 1;

      const dsPrice = +(parseFloat(dto.sku_price) * priceMult).toFixed(2);
      const dsOfferPrice = +(dsPrice * discountMult).toFixed(2);

      const discount = 1 - discountMult;
      const dsDiscount = discount > 0 ? (discount * 100).toFixed(0) + '%' : null;

      return {
        id,
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

          dsPrice,
          dsOfferPrice,
          dsDiscount,
        },
      };
    }),
  };
};

export const mapAliProductReviews = (data: AliProductReviewsDTO['data']): ProductReviews => {
  const { productEvaluationStatistic: ptr } = data;

  return {
    overview: {
      count: data.totalNum,
      rating: ptr.evarageStar,
      stats: {
        1: ptr.oneStarRate,
        2: ptr.twoStarRate,
        3: ptr.threeStarRate,
        4: ptr.fourStarRate,
        5: ptr.fiveStarRate,
      },
    },
    list: data.evaViewList.map(el => {
      const name = el.buyerName?.toLocaleLowerCase().includes('aliexpress')
        ? 'Anonimous Buyer'
        : el.buyerName;

      return {
        date: el.evalDate,
        name,
        rating: el.buyerEval / 20,
        text: el.buyerTranslationFeedback,
        thumbnails: el.thumbnails,
        images: el.images,
      };
    }),
  };
};
