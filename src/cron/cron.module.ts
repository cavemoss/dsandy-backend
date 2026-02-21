import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AliexpressModule } from 'src/aliexpress/aliexpress.module';
import { OrdersModule } from 'src/orders/orders.module';
import { StripeModule } from 'src/stripe/stripe.module';

import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), OrdersModule, AliexpressModule, StripeModule],
  providers: [CronService],
})
export class CronModule {}
