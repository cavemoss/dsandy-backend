import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(@Inject('STRIPE_CLIENT') private stripe: Stripe) {}

  async createPaymentIntent(amount: number, currency: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount, // Amount in cents (e.g., 1000 = $10.00)
      currency,
      automatic_payment_methods: { enabled: true }, // Enables multiple payment methods
    });
    return { clientSecret: paymentIntent.client_secret };
  }
}
