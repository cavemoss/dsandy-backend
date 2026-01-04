import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { AliGetProductReviewsDTO } from 'src/aliexpress/dto/get-reviews.dto';

import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get('dynamic')
  getProductsDynamic() {
    return this.service.getProductsDynamic();
  }

  @Get('reviews')
  getProductReviews(@Query(ValidationPipe) query: AliGetProductReviewsDTO) {
    return this.service.getProductReviews(query);
  }
}
