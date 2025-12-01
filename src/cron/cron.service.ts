import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AliexpressService } from 'src/aliexpress/services/aliexpress.service';
import { OrdersService } from 'src/orders/services/orders.service';
import { TelegramService } from 'src/telegram/services/telegram.service';

@Injectable()
export class CronService {
  constructor(
    private readonly aliexpressService: AliexpressService,
    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async everyDay() {
    await this.aliexpressService.refreshAccessToken();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async every5Min() {
    await this.ordersService.deletePendingOrders();

    await this.ordersService.getUnpaidOrders().then(orders => {
      orders.forEach(({ id: orderId }) => {
        void this.telegramService.sendUnpaidOrderMessage(orderId);
      });
    });
  }
}
