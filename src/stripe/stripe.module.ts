import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersModule } from 'src/orders/orders.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import Stripe from 'stripe';

import { StripeController } from './controller/stripe.controller';
import { StripeService } from './service/stripe.service';

@Module({
  imports: [ConfigModule, OrdersModule, TelegramModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    {
      inject: [ConfigService],
      provide: 'STRIPE_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Stripe(config.get('STRIPE_SECRET_KEY')!, {
          apiVersion: '2025-07-30.basil',
        });
      },
    },
  ],
})
export class StripeModule {}
