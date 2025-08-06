import { Controller, Get, Query } from '@nestjs/common';
import { ScraperService } from '../service/scraper.service';
import { BrowserEnum, SupplierEnum } from '../dto/scraper-service.dto';
import { SubdomainEnum } from 'lib/types';

@Controller('admin')
export class AdminController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get()
  async scrape(@Query('productId') productId: string) {
    return this.scraperService.scrape({
      supplier: SupplierEnum.ALIEXPRESS,
      browser: BrowserEnum.FIREFOX,
      subdomain: SubdomainEnum.TEST,
      productId,
    });
  }
}
