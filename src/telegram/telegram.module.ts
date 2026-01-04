import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';

import { TelegramController } from './controllers/telegram.controller';
import { TelegramRef } from './services/telegram.ref';
import { TelegramService } from './services/telegram.service';
import { TelegramUpdate } from './services/telegram.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.telegram.settings,
    }),
  ],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramUpdate, TelegramRef],
  exports: [TelegramService, TelegramRef],
})
export class TelegramModule {}
