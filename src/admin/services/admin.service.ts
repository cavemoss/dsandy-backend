import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { random } from 'lodash';
import { DProduct } from 'src/products/entities/dynamic-product.entity';
import { ProductsService } from 'src/products/services/products.service';
import { Repository } from 'typeorm';

import { AdminCreateTenantDTO, AdminSaveDProductsDTO } from '../dto/admin.dto';
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
  ) {}

  async createTenant(dto: AdminCreateTenantDTO) {
    const subdomainConfig: SubdomainConfig = {
      storeName: dto.subdomain.name,
      autoCalculateDiscountMult: true,
      countries: ['US', 'CA'],
      logo: { fontBased: {} },
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

  async saveDProducts(subdomainName: string, { dProducts }: AdminSaveDProductsDTO) {
    const subdomain = await this.getSubdomain(subdomainName);

    dProducts.forEach((dProduct: DProduct) => {
      const { id } =
        subdomain.dProducts.find(({ aliProductId }) => {
          return aliProductId === dProduct.aliProductId;
        }) ?? {};

      if (id) dProduct.id = id;
    });

    subdomain.dProducts = this.productsService.dProductsRepo.create(dProducts);
    return this.subdomainsRepo.save(subdomain);
  }
}
