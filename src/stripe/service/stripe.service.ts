import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminService } from 'src/admin/services/admin.service';
import { OrderStatusEnum } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/services/orders.service';
import { TelegramService } from 'src/telegram/services/telegram.service';
import Stripe from 'stripe';

import { StripeCreatePaymentIntentDTO } from '../dto/stripe.dto';

@Injectable()
export class StripeService {
  private readonly webhookSecret: string;

  constructor(
    readonly configService: ConfigService,
    @Inject('STRIPE_CLIENT') readonly stripe: Stripe,

    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
    private readonly adminService: AdminService,
  ) {
    this.webhookSecret = configService.get('STRIPE_WEBHOOK_SECRET')!;
  }

  async createPaymentIntent(options: StripeCreatePaymentIntentDTO) {
    const response = await this.stripe.paymentIntents.create({
      automatic_payment_methods: { enabled: true },
      ...options,
    });

    return { clientSecret: response.client_secret };
  }

  async updatePaymentIntent(clientSecret: string, options: StripeCreatePaymentIntentDTO) {
    const paymentIntentId = clientSecret.split('_secret_')[0];
    await this.stripe.paymentIntents.update(paymentIntentId, options);
  }

  async retrievePaymentIntent(clientSecret: string) {
    const paymentIntentId = clientSecret.split('_secret_')[0];
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    const { metadata } = paymentIntent;

    const order = await this.ordersService.ordersRepo.findOneBy({ id: +metadata.orderId });

    if (order && order.status > 0) {
      throw new HttpException('Order already payed', HttpStatus.BAD_REQUEST);
    }

    return paymentIntent;
  }

  async handleWebhook(rowReqBody: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(rowReqBody, signature, this.webhookSecret);
    const paymentIntent = <Stripe.PaymentIntent>event.data.object;

    const { metadata } = paymentIntent;

    const orderId = +metadata.orderId;
    const orderExists = await this.ordersService.ordersRepo.existsBy({ id: orderId });

    if (!orderExists) {
      throw new HttpException('Handle webhook error', HttpStatus.BAD_REQUEST, {
        cause: `Order ${orderId} does't exist`,
      });
    }

    const tenant = await this.adminService.tenantsRepo.findOneByOrFail({ id: +metadata.tenantId });

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.ordersService.updateOrderStatus(orderId, OrderStatusEnum.PAYED);
        await this.ordersService.placeOrderAtAliexpress(orderId);
        await this.telegramService.onNewOrder(orderId, tenant.tgChatId);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { message: 'received' };
  }
}
