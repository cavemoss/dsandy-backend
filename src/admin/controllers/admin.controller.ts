import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetSubdomain } from 'src/middleware/get-subdomain.decorator';
import { GetTenant } from 'src/middleware/get-tenant.decorator';

import {
  AdminCreateTenantDTO,
  AdminSaveDProductCategoriesDTO,
  AdminSaveDProductsDTO,
} from '../dto/admin.dto';
import { Tenant } from '../entities/tenant.entity';
import { AdminService } from '../services/admin.service';

@Controller('admin')
export class AdminController {
  constructor(public readonly service: AdminService) {}

  @Get('subdomain')
  getSubdomain(@GetSubdomain() subdomain: string) {
    return this.service.getSubdomain(subdomain);
  }

  @Post('create-tenant')
  createTenant(@Body() body: AdminCreateTenantDTO) {
    return this.service.createTenant(body);
  }

  @Get('by-jwt-token')
  @UseGuards(JwtAuthGuard)
  getByJwtToken(@GetTenant() tenant: Tenant) {
    return this.service.validateTenant(tenant);
  }

  @Post('save-product-categories')
  saveProductCategories(
    @Headers('x-subdomain-name') subdomain: string,
    @Body() body: AdminSaveDProductCategoriesDTO,
  ) {
    return this.service.saveDProductCategories(subdomain, body);
  }

  @Post('save-ali-products')
  saveAliProduct(
    @Headers('x-subdomain-name') subdomain: string,
    @Body() body: AdminSaveDProductsDTO,
  ) {
    return this.service.saveDProducts(subdomain, body);
  }
}
