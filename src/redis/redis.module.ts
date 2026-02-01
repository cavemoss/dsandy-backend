import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';

import { RedisController } from './controllers/redis.controller';
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
  controllers: [RedisController],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisModule {}
