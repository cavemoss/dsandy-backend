// stripe.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './service/stripe.service';
import { StripeController } from './controller/stripe.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get('STRIPE_SECRET_KEY')!, {
          apiVersion: '2025-07-30.basil',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [StripeService],
})
export class StripeModule {}
