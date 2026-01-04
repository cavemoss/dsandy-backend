import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { TelegramModule } from 'src/telegram/telegram.module';

import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.winston,
    }),
    TelegramModule,
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
