import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AliexpressModule } from 'src/aliexpress/aliexpress.module';

import { ProductsController } from './controllers/products.controller';
import { DProductCategory } from './entities/d-product-category.entity';
import { DProduct } from './entities/dynamic-product.entity';
import { ProductsService } from './services/products.service';

@Module({
  imports: [AliexpressModule, TypeOrmModule.forFeature([DProduct, DProductCategory])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
