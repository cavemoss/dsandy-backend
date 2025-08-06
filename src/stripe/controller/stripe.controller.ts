import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from '../service/stripe.service';
import { StripeCreatePaymentIntentBody } from '../dto/stripe.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: StripeCreatePaymentIntentBody) {
    return this.stripeService.createPaymentIntent(body.amount, body.currency);
  }
}
