import { Module } from '@nestjs/common';
import { AdminService } from './service/admin.service';
import { ScraperService } from './service/scraper.service';
import { AdminController } from './controller/admin.controller';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [AdminController],
  providers: [AdminService, ScraperService],
})
export class AdminModule {}
