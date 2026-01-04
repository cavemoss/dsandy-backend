import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';

import { CacheService } from './services/cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.redis.settings,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisModule {}
