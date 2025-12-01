import Stripe from 'stripe';

export interface StripePaymentIndentMetadata extends Stripe.MetadataParam {
  orderId: number;
  tenantId: number;
}

export interface StripeCreatePaymentIntentDTO {
  amount: number;
  currency: string;
  metadata: StripePaymentIndentMetadata;
}
