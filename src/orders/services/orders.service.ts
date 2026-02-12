import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { handleError } from 'lib/utils';
import { AliexpressService } from 'src/aliexpress/services/aliexpress.service';
import { LoggerService } from 'src/logger/logger.service';
import { ProductsService } from 'src/products/services/products.service';
import { In, IsNull, Not, Repository } from 'typeorm';

import { PlaceOrderBodyDTO, UpdateOrderInfoBodyDTO } from '../dto/orders.dto';
import { Order, OrderStatusEnum, OrderTrackingDTO } from '../entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly logger: LoggerService,

    @InjectRepository(Order)
    readonly repo: Repository<Order>,

    private readonly productsService: ProductsService,
    private readonly aliexpressService: AliexpressService,
  ) {}

  async place(
    subdomainName: string,
    customerId: number | null,
    { contactInfo, shippingInfo, orderItems, paymentInfo, metadata }: PlaceOrderBodyDTO,
  ) {
    const dProducts = await this.productsService.getDProductsByIds(
      orderItems.map(item => item.dProductId),
    );

    const order = this.repo.create({
      subdomainName,
      customerId,
      contactInfo,
      shippingInfo,
      paymentInfo,
      orderItems,
      dProducts,
      metadata,
    });

    return this.repo.save(order);
  }

  async deletePendingOrders() {
    const now = dayjs();

    const orders = await this.repo.find({
      select: ['id', 'createdAt'],
      where: { status: OrderStatusEnum.PENDING },
    });

    const orderIds = orders
      .filter(order => dayjs(order.createdAt).add(20, 'minutes').isBefore(now))
      .map(({ id }) => id);

    if (orderIds.length) {
      await this.repo.delete(orderIds);
    }
  }

  async placeOrderAtAliexpress(orderId: number) {
    try {
      const order = await this.repo.findOneByOrFail({ id: orderId });

      const result = await this.aliexpressService.orderCreatePay(order);
      const aliOrderId = result.order_list.number[0];

      await this.repo.update(orderId, {
        aliOrderId,
        status: OrderStatusEnum.PLACED_AT_ALI,
      });
    } catch (e) {
      handleError(this.logger, e as Error, {
        NO_ORDER_ITEMS: 'No order items',
        ALI_PLACE_ORDER_FAILED: 'Aliexpress place order request failed',
        ALI_PLACE_ORDER_NO_PROVINCE: 'Failed to parse province',
        ALI_PLACE_ORDER_NO_PHONE: 'Failed to parse phone number',
        ALI_REFRESH_TOKEN_ERROR: 'Failed to refresh access token',
        ALI_METHOD_CALL_FAILED: 'Aliexpress method call failed',
      });
    }
  }

  async deleteOrderIfPending(orderId: number) {
    const mustDelete = await this.repo.existsBy({
      id: orderId,
      status: OrderStatusEnum.PENDING,
    });

    if (mustDelete) {
      await this.repo.delete(orderId);
    }
  }

  async checkUnpaidOrders() {
    const unpaidOrders = await this.repo.findBy({ status: OrderStatusEnum.PLACED_AT_ALI });

    this.logger.info('Checking unpaid orders', { unpaidOrders });

    const stillUnpaidOrders: Order[] = [];

    for (const order of unpaidOrders) {
      await this.updateUnpaidOrderStatus(order).then(flag => {
        if (!flag) stillUnpaidOrders.push(order);
      });
    }

    return stillUnpaidOrders;
  }

  async updateOrderTrackingAll() {
    const orders = await this.repo.findBy({ status: OrderStatusEnum.TO_BE_SHIPPED });

    this.logger.info('Updating tracking info for all orders');

    for (const order of orders) {
      await this.updateOrderTracking(order);
    }
  }

  async updateUnpaidOrderStatus(order: Order) {
    try {
      if (!order.aliOrderId) {
        throw new Error('NO_ALI_ORDER_ID', {
          cause: { order },
        });
      }

      const trackingData = await this.aliexpressService.orderTracking(order.aliOrderId);

      if (trackingData) {
        await this.updateOrderStatus(order.id, OrderStatusEnum.TO_BE_SHIPPED);
        await this.repo.update(order.id, { trackingData });

        this.logger.info(`Order ${order.id} confirmed!`);
        return true;
      }

      this.logger.warn(`Order ${order.id} is still unpaid at Aliexpress!`);
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          ALI_FAIL: 'Order tracking failed while trying to update unpaid order status',
          NO_ALI_ORDER_ID: `Order ${order.id} has no aliOrderId`,
        },
        false,
      );
    }
  }

  async updateOrderTracking(order: Order) {
    try {
      if (!order.aliOrderId) {
        throw new Error('NO_ALI_ORDER_ID', {
          cause: { order },
        });
      }

      const trackingData = await this.aliexpressService.orderTracking(order.aliOrderId);

      if (trackingData) {
        await this.repo.update(order.id, { trackingData });
      }
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          ALI_FAIL: `Order tracking for ${order.aliOrderId} failed in cron`,
          NO_ALI_ORDER_ID: `Order ${order.id} has no aliOrderId`,
        },
        false,
      );
    }
  }

  updateOrderStatus(orderId: number, status: OrderStatusEnum) {
    return this.repo.update(orderId, { status });
  }

  updateOrderInfo({ orderId, ...dto }: UpdateOrderInfoBodyDTO) {
    return this.repo.update(orderId, dto);
  }

  getByCustomer(customerId: number) {
    return this.repo.findBy({ customerId, status: Not(OrderStatusEnum.PENDING) });
  }

  getAnon(ids: number[]) {
    return this.repo.findBy({
      id: In(ids),
      status: Not(OrderStatusEnum.PENDING),
      customerId: IsNull(),
    });
  }
}
