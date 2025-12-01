import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { ClsService } from 'nestjs-cls';
import { AliexpressService } from 'src/aliexpress/services/aliexpress.service';
import { In, Repository } from 'typeorm';

import { Product } from '../dto/products.dto';
import { DProduct } from '../entities/dynamic-product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly cls: ClsService,

    @InjectRepository(DProduct)
    readonly dProductsRepo: Repository<DProduct>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly aliService: AliexpressService,
  ) {}

  getDProductsByIds(ids: number[]) {
    return this.dProductsRepo.findBy({ id: In(ids) });
  }

  private get productsByViewerParams() {
    const key = [
      this.cls.get('subdomain.name'),
      this.cls.get('params.country'),
      this.cls.get('params.currency'),
      this.cls.get('params.language'),
    ].join('_');

    return {
      get: () => this.cacheManager.get<Product[]>(key),
      set: (products: Product[]) => this.cacheManager.set(key, products),
    };
  }

  async getProductsBySubdomainFromAli() {
    const promises = this.cls
      .get('subdomain.dProducts')
      .map(dp => this.aliService.getProductsByViewerParams(dp));

    const products = await Promise.all(promises);
    return products.filter(p => p != null);
  }

  async getProductsDynamic() {
    let products = await this.productsByViewerParams.get();

    if (products) return products;

    products = await this.getProductsBySubdomainFromAli();
    return this.productsByViewerParams.set(products);
  }
}
