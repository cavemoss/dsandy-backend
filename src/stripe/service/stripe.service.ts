import { Injectable } from '@nestjs/common';
import { httpException, httpResponse } from 'lib/utils';
import { AdminService } from 'src/admin/services/admin.service';
import { ConfigService } from 'src/config/config.service';
import { EmailService } from 'src/email/services/email.service';
import { LoggerService } from 'src/logger/logger.service';
import { OrderStatusEnum } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/services/orders.service';
import { TelegramService } from 'src/telegram/services/telegram.service';
import Stripe from 'stripe';

import { StripeCreatePaymentIntentDTO } from '../dto/stripe.dto';
import { getPaymentIntentId, PAYMENT_TIMEOUT } from '../lib/utils';

@Injectable()
export class StripeService {
  private readonly webhookSecret: string;
  private readonly stripe: Stripe;

  constructor(
    private readonly logger: LoggerService,
    protected readonly config: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
  ) {
    this.stripe = config.stripe.client;
    this.webhookSecret = config.stripe.webhookSecret;
  }

  async createPaymentIntent(options: StripeCreatePaymentIntentDTO) {
    const result = await this.stripe.paymentIntents.create({
      automatic_payment_methods: {
        enabled: true,
      },
      ...options,
    });

    setTimeout(() => {
      void this.cancelAbandonedPayment(result.id);
    }, PAYMENT_TIMEOUT);

    return {
      clientSecret: result.client_secret,
      paymentIntentId: result.id,
    };
  }

  async retrievePaymentIntent(clientSecret: string) {
    const paymentIntentId = getPaymentIntentId(this.logger, clientSecret);
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async updatePaymentIntent(clientSecret: string, options: StripeCreatePaymentIntentDTO) {
    const paymentIntentId = getPaymentIntentId(this.logger, clientSecret);
    await this.stripe.paymentIntents.update(paymentIntentId, options);
  }

  async cancelAbandonedPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    const { metadata, status } = paymentIntent;

    if (status == 'processing' || status == 'succeeded') return;

    await this.stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: 'abandoned',
    });

    await this.ordersService.deleteOrderIfPending(+metadata.orderId);
  }

  async handleWebhook(rowReqBody: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(rowReqBody, signature, this.webhookSecret);
    const paymentIntent = <Stripe.PaymentIntent>event.data.object;

    const { metadata } = paymentIntent;

    const orderId = +metadata.orderId;
    const orderExists = await this.ordersService.repo.existsBy({ id: orderId });

    if (!orderExists) {
      throw httpException(this.logger, `Handle webhook error: Order ${orderId} not found`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.onPaymentIntentSucceeded(orderId, metadata);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return httpResponse('received');
  }

  private async onPaymentIntentSucceeded(orderId: number, metadata: Stripe.Metadata) {
    await this.ordersService.updateOrderStatus(orderId, OrderStatusEnum.PAYED);
    await this.ordersService.placeOrderAtAliexpress(orderId);

    const order = await this.ordersService.repo.findOneByOrFail({
      id: orderId,
    });

    const tenant = await this.adminService.tenantsRepo.findOneByOrFail({
      id: +metadata.tenantId,
    });

    await this.telegramService.onNewOrder(order, tenant.tgChatId);
    await this.emailService.onNewOrder(order);
  }
}
