import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AliexpressModule } from 'src/aliexpress/aliexpress.module';
import { OrdersModule } from 'src/orders/orders.module';
import { TelegramModule } from 'src/telegram/telegram.module';

import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), OrdersModule, TelegramModule, AliexpressModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
