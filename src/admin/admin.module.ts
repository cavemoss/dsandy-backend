import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from 'src/orders/orders.module';
import { ProductsModule } from 'src/products/products.module';

import { AdminController } from './controllers/admin.controller';
import { Subdomain } from './entities/subdomain.entity';
import { Tenant } from './entities/tenant.entity';
import { AdminService } from './services/admin.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Subdomain, Tenant]), ProductsModule, OrdersModule],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
