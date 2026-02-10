import { Injectable } from '@nestjs/common';
import { handleError, httpException, httpResponse } from 'lib/utils';
import { AdminService } from 'src/admin/services/admin.service';
import { ConfigService } from 'src/config/config.service';
import { MailerService } from 'src/email/services/mailer.service';
import { LoggerService } from 'src/logger/logger.service';
import { OrderStatusEnum } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/services/orders.service';
import { TelegramService } from 'src/telegram/services/telegram.service';
import Stripe from 'stripe';

import {
  StripeCreateConfirmIntentDTO,
  StripeCreatePaymentIntentDTO,
  StripePaymentIndentMetadata,
} from '../dto/stripe.dto';
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
    private readonly emailService: MailerService,
  ) {
    this.stripe = config.stripe.client;
    this.webhookSecret = config.stripe.webhookSecret;
  }

  async createConfirmIntent(dto: StripeCreateConfirmIntentDTO) {
    await this.finalizeOrder(dto.metadata);

    try {
      const result = await this.stripe.paymentIntents.create({
        automatic_payment_methods: { enabled: true },
        return_url: dto.returnUrl,
        amount: dto.amount,
        currency: dto.currency,
        metadata: dto.metadata,
        confirm: true,
        confirmation_token: dto.confirmationTokenId,
      });

      return {
        clientSecret: result.client_secret,
        paymentIntentId: result.id,
        status: result.status,
      };
    } catch (error) {
      handleError(this.logger, error);
    }
  }

  private async finalizeOrder(metadata: StripePaymentIndentMetadata) {
    const { orderId, tenantId } = metadata;
    const orderExists = await this.ordersService.repo.existsBy({ id: orderId });

    if (!orderExists) {
      throw httpException(this.logger, `Order ${orderId} not found`, { metadata }, 410);
    }

    await this.ordersService.updateOrderStatus(orderId, OrderStatusEnum.CUSTOMER_PAYED);
    //await this.ordersService.placeOrderAtAliexpress(orderId);

    const order = await this.ordersService.repo.findOneByOrFail({ id: orderId });
    const tenant = await this.adminService.tenantsRepo.findOneByOrFail({ id: tenantId });

    await this.telegramService.onNewOrder(order, tenant.tgChatId);
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
      status: result.status,
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

    this.logger.info('Abandoned payment canceled', { paymentIntent });
  }

  async handleWebhook(rowReqBody: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(rowReqBody, signature, this.webhookSecret);
    const paymentIntent = <Stripe.PaymentIntent>event.data.object;

    const { metadata } = paymentIntent;

    const orderId = +metadata.orderId;
    const orderExists = await this.ordersService.repo.existsBy({ id: orderId });

    if (!orderExists) {
      throw httpException(this.logger, `Handle webhook error: Order ${orderId} not found`, {}, 410);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        break;
        await this.onPaymentIntentSucceeded(orderId, metadata);

      default:
        this.logger.warn(`Unhandled event type ${event.type}`, { event });
    }

    return httpResponse('received');
  }

  private async onPaymentIntentSucceeded(orderId: number, metadata: Stripe.Metadata) {
    await this.ordersService.updateOrderStatus(orderId, OrderStatusEnum.CUSTOMER_PAYED);
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
