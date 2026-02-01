import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ClsService } from 'nestjs-cls';
import { AliAccessToken } from 'src/aliexpress/entities/access-token.entity';
import { Product } from 'src/products/dto/products.dto';

@Injectable()
export class CacheService {
  constructor(
    private readonly cls: ClsService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  get productsByViewerParams() {
    const key = [
      this.cls.get('subdomain.name'),
      this.cls.get('params.country'),
      this.cls.get('params.currency'),
      this.cls.get('params.language'),
    ].join('_');

    return {
      get: () => this.cache.get<Product[]>(key),
      set: (products: Product[]) => this.cache.set(key, products),
    };
  }

  get aliexpressAccessToken() {
    const KEY = 'ali_access_token';

    return {
      get: () => this.cache.get<AliAccessToken>(KEY),
      set: (aat: AliAccessToken) => this.cache.set(KEY, aat),
    };
  }

  clearCache() {
    return this.cache.clear();
  }
}
