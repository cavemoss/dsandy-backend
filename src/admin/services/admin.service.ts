'use client';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { objectByKey } from 'lib/utils';
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
      console.debug(error);
      throw new HttpException(`Unknown subdomain ${name}`, HttpStatus.BAD_REQUEST);
    }
  }

  async saveDProductCategories(
    subdomainName: string,
    { dProductCategories }: AdminSaveDProductCategoriesDTO,
  ) {
    const subdomain = await this.getSubdomain(subdomainName);
    Object.assign(subdomain, { dProductCategories });
    return this.subdomainsRepo.save(subdomain);
  }

  async saveDProducts(subdomainName: string, { dProducts }: AdminSaveDProductsDTO) {
    const subdomain = await this.getSubdomain(subdomainName);
    const prevDProducts = objectByKey(subdomain.dProducts, 'aliProductId');

    dProducts.forEach(dto => {
      const ptr = dto as DeepPartial<DProduct>;

      ptr.categories = dto.categoryIds?.map(id => ({ id }));
      ptr.id = prevDProducts[dto.aliProductId]?.id;
    });

    void this.cacheService.clearCache();

    subdomain.dProducts = this.productsService.dProductsRepo.create(dProducts);
    return this.subdomainsRepo.save(subdomain);
  }
}
