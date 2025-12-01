import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AliexpressModule } from 'src/aliexpress/aliexpress.module';
import { ProductsModule } from 'src/products/products.module';

import { OrdersController } from './controllers/orders.controller';
import { Order } from './entities/order.entity';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), ProductsModule, AliexpressModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
