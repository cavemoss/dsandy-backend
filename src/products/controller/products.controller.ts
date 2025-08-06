import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from '../service/products.service';
import { ProductsGetQueryDto } from '../dto/products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  async get(@Query() query: ProductsGetQueryDto) {
    return this.service.getBySubdomain(query.subdomain);
  }
}
