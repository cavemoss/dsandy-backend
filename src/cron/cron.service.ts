import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { handleError } from 'lib/utils';
import { AliexpressService } from 'src/aliexpress/services/aliexpress.service';
import { LoggerService } from 'src/logger/logger.service';
import { OrdersService } from 'src/orders/services/orders.service';
import { TelegramService } from 'src/telegram/services/telegram.service';

@Injectable()
export class CronService {
  constructor(
    private readonly logger: LoggerService,
    private readonly aliexpressService: AliexpressService,
    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async everyDay() {
    try {
      await this.aliexpressService.refreshAccessToken();
    } catch (e) {
      handleError(this.logger, e as Error, {
        ALI_REFRESH_TOKEN_ERROR: 'Aliexpress refresh token error in cron',
      });
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async every5Min() {
    await this.ordersService.deletePendingOrders();
  }

  @Cron('0 */20 * * * *')
  async every20Min() {
    await this.ordersService.checkUnpaidOrders().then(orders => {
      orders.forEach(({ id: orderId }) => {
        void this.telegramService.sendUnpaidOrderMessage(orderId);
      });
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async everyHour() {
    await this.ordersService.updateOrderTrackingAll();
  }
}
