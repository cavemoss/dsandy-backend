import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { OrdersModule } from 'src/orders/orders.module';
import { session } from 'telegraf';

import { TelegramController } from './controllers/telegram.controller';
import { TelegramService } from './services/telegram.service';
import { TelegramUpdate } from './services/telegram.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        token: config.get('TELEGRAM_BOT_TOKEN')!,
        middlewares: [session()],
      }),
      inject: [ConfigService],
    }),
    OrdersModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramUpdate],
  exports: [TelegramService],
})
export class TelegramModule {}
