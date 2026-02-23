'use client';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleError, httpException, indexByKey } from 'lib/utils';
import { LoggerService } from 'src/logger/logger.service';
import { DProduct } from 'src/products/entities/dynamic-product.entity';
import { ProductsService } from 'src/products/services/products.service';
import { CacheService } from 'src/redis/services/cache.service';
import { DeepPartial, Repository } from 'typeorm';

import {
  AdminCreateTenantDTO,
  AdminSaveDProductCategoriesDTO,
  AdminSaveDProductsDTO,
} from '../dto/admin.dto';
import { Subdomain, SubdomainConfig } from '../entities/subdomain.entity';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly logger: LoggerService,

    @InjectRepository(Tenant)
    readonly tenantsRepo: Repository<Tenant>,

    @InjectRepository(Subdomain)
    readonly subdomainsRepo: Repository<Subdomain>,

    private readonly productsService: ProductsService,
    private readonly cacheService: CacheService,
  ) {}

  async createTenant(dto: AdminCreateTenantDTO) {
    const subdomainConfig: SubdomainConfig = {
      storeName: dto.subdomain.name,
      description: dto.subdomain.description,
      landingPage: '/page/catalog',
      countries: ['US', 'CA'],
      logo: {
        fontBased: {},
      },
      policies: {
        freeShippingCap: 20,
        returnDays: 30,
      },
      service: dto.service,
    };

    const subdomain = this.subdomainsRepo.create({
      name: dto.subdomain.uniqueName,
      config: subdomainConfig,
    });

    const tenant = this.tenantsRepo.create({
      email: dto.email,
      name: dto.name,
      password: dto.password,
      subdomains: [subdomain],
    });

    return this.tenantsRepo.save(tenant);
  }

  getTenantCredentials(email: string) {
    return this.tenantsRepo.findOne({
      where: { email },
      select: ['password', 'email', 'id'],
    });
  }

  async validateTenant({ email }: Tenant) {
    const tenant = await this.tenantsRepo.findOneBy({ email });

    if (!tenant) {
      throw new HttpException('Invalid JWT Access Token', HttpStatus.UNAUTHORIZED);
    }

    return tenant;
  }

  async getSubdomain(name: string) {
    try {
      return await this.subdomainsRepo.findOneByOrFail({ name });
    } catch (error) {
      throw httpException(this.logger, `Unknown subdomain ${name}`, {
        error: error as object,
      });
    }
  }

  async saveDProductCategories(
    subdomainName: string,
    { dProductCategories }: AdminSaveDProductCategoriesDTO,
  ) {
    const subdomain = await this.getSubdomain(subdomainName);

    try {
      Object.assign(subdomain, { dProductCategories });
      return this.subdomainsRepo.save(subdomain);
    } catch (error) {
      handleError(this.logger, error);
    }
  }

  async saveDProducts(subdomainName: string, { dProducts }: AdminSaveDProductsDTO) {
    const subdomain = await this.getSubdomain(subdomainName);

    try {
      const prevDProducts = indexByKey(subdomain.dProducts, 'aliProductId');

      dProducts.forEach(dto => {
        const ptr = dto as DeepPartial<DProduct>;

        ptr.categories = dto.categoryIds?.map(id => ({ id }));
        ptr.id = prevDProducts[dto.aliProductId]?.id;
      });

      void this.cacheService.clearCache();

      subdomain.dProducts = this.productsService.dProductsRepo.create(dProducts);
      return this.subdomainsRepo.save(subdomain);
    } catch (error) {
      handleError(this.logger, error);
    }
  }
}
