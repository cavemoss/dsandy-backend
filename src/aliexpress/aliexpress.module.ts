import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AliexpressController } from './controllers/aliexpress.controller';
import { AliAccessToken } from './entities/access-token.entity';
import { AliexpressService } from './services/aliexpress.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AliAccessToken])],
  controllers: [AliexpressController],
  providers: [AliexpressService],
  exports: [AliexpressService],
})
export class AliexpressModule {}
