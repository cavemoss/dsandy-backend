import { Controller, Get } from '@nestjs/common';

import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/dynamic')
  getProductsDynamic() {
    return this.productsService.getProductsDynamic();
  }
}
