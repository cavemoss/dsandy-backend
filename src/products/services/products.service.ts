import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleError } from 'lib/utils';
import { ClsService } from 'nestjs-cls';
import { AliGetProductReviewsDTO } from 'src/aliexpress/dto/get-reviews.dto';
import { AliexpressService } from 'src/aliexpress/services/aliexpress.service';
import { LoggerService } from 'src/logger/logger.service';
import { CacheService } from 'src/redis/services/cache.service';
import { In, Repository } from 'typeorm';

import { Product } from '../dto/products.dto';
import { DProduct } from '../entities/dynamic-product.entity';
import { mapAliProductReviews } from '../lib/products.utils';

@Injectable()
export class ProductsService {
  constructor(
    private readonly logger: LoggerService,
    private readonly cls: ClsService,

    @InjectRepository(DProduct)
    readonly dProductsRepo: Repository<DProduct>,

    private readonly aliService: AliexpressService,
    private readonly cacheService: CacheService,
  ) {}

  getDProductsByIds(ids: number[]) {
    return this.dProductsRepo.findBy({ id: In(ids) });
  }

  private async getProductsBySubdomainFromAli() {
    const result: Product[] = [];

    for (const dProduct of this.cls.get('subdomain.dProducts')) {
      const product = await this.aliService.getProductsByViewerParams(dProduct);
      if (product) result.push(product);
    }

    return result;
  }

  async getProductsDynamic() {
    let products = await this.cacheService.productsByViewerParams.get();

    if (products) return products;

    products = await this.getProductsBySubdomainFromAli();
    return this.cacheService.productsByViewerParams.set(products);
  }

  async getProductReviews(query: AliGetProductReviewsDTO) {
    try {
      const result = await this.aliService.getProductReviews(query);
      return mapAliProductReviews(result.data);
    } catch (e) {
      handleError(this.logger, e as Error, {
        ALI_FAIL: `Failed to fetch reviews for product ${query.aliProductId}`,
      });
    }
  }
}
