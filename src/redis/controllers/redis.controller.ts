import { Controller, Post, UseGuards } from '@nestjs/common';
import { PrivateApiGuard } from 'src/auth/guards/private-api.guard';

import { CacheService } from '../services/cache.service';

@Controller('redis')
@UseGuards(PrivateApiGuard)
export class RedisController {
  constructor(private readonly cacheService: CacheService) {}

  @Post('clear-cache')
  clearCache() {
    return this.cacheService.clearCache();
  }
}
