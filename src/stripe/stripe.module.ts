import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { OrdersModule } from 'src/orders/orders.module';
import { TelegramModule } from 'src/telegram/telegram.module';

import { StripeController } from './controller/stripe.controller';
import { StripeService } from './service/stripe.service';

@Module({
  imports: [OrdersModule, TelegramModule, EmailModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
