import { AliProductReviewsDTO } from 'src/aliexpress/dto/get-reviews.dto';
import { AliProductInfoDTO } from 'src/aliexpress/dto/product-info.dto';

import { Product, ProductReviews } from '../dto/products.dto';
import { DProduct } from '../entities/dynamic-product.entity';

export const mapAliProduct = (
  p: AliProductInfoDTO,
  { id, aliProductId, subdomainName, config, categories }: DProduct,
): Product => {
  const ptr = p.aliexpress_ds_product_get_response.result;

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

  return {
    id,
    subdomainName,
    aliProductId,
    title: config.title ?? null,
    aliName: ptr.ae_item_base_info_dto.subject,
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
    categoryIds: categories?.map(c => c.id) ?? [],
    scuLayers,
    scus: ptr.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.map((dto, index) => {
      const ptr4 = dto.ae_sku_property_dtos.ae_sku_property_d_t_o;

      const combinations = ptr4.slice(1).map(dto => ({
        propertyId: dto.sku_property_id,
        propertyName: dto.sku_property_name,
        propertyValueId: dto.property_value_id,
        propertyValueName: dto.property_value_definition_name || dto.sku_property_value,
      }));

      const combinationString = combinations
        .sort((a, b) => b.propertyValueName.localeCompare(a.propertyValueName))
        .map(el => el.propertyValueId)
        .join();

      const {
        sku_property_id: propertyId,
        sku_property_name: propertyName,
        property_value_id: propertyValueId,
        property_value_definition_name: propertyValueName,
        sku_image: image,
      } = ptr4[0];

      const scuId = index + 1;

      const priceMult = config.priceMult[scuId] ?? config.discountMult.general ?? 1;
      const discountMult = config.discountMult[scuId] ?? config.discountMult.general ?? 1;

      const dsOfferPrice = +(parseFloat(dto.sku_price) * priceMult).toFixed(2);
      const dsPrice = +(dsOfferPrice * discountMult).toFixed(2);
      const dsDiscount = discountMult > 1 ? (discountMult * 100 - 100).toFixed(0) + '%' : null;

      return {
        id: scuId,

        propertyId,
        propertyValueId,
        propertyName,
        propertyValueName,

        combinations,
        combinationString,

        priceInfo: {
          currency: dto.currency_code,
          price: dto.sku_price,
          offerPrice: dto.offer_sale_price,
          offerBulkPrice: dto.offer_bulk_sale_price,
          dsPrice,
          dsOfferPrice,
          dsDiscount,
        },
        availableStock: dto.sku_available_stock,
        image,
      };
    }),
  };
};

export const mapAliProductReviews = (data: AliProductReviewsDTO['data']): ProductReviews => {
  const { productEvaluationStatistic: ptr } = data;

  return {
    pages: {
      current: data.currentPage,
      total: data.totalPage,
      size: data.pageSize,
    },
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
        ? 'A***r'
        : el.buyerName;

      return {
        date: el.evalDate,
        name,
        attr: el.skuInfo.replace(/:/g, ': '),
        rating: el.buyerEval / 20,
        text: el.buyerTranslationFeedback,
        thumbnails: el.thumbnails,
        images: el.images,
      };
    }),
  };
};
