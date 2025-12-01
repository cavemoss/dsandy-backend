import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { AliexpressService } from 'src/aliexpress/services/aliexpress.service';
import { ProductsService } from 'src/products/services/products.service';
import { Repository } from 'typeorm';

import { PlaceOrderBodyDTO, UpdateOrderInfoBodyDTO } from '../dto/orders.dto';
import { Order, OrderStatusEnum } from '../entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    readonly ordersRepo: Repository<Order>,

    private readonly productsService: ProductsService,
    private readonly aliexpressService: AliexpressService,
  ) {}

  async place(
    subdomainName: string,
    customerId: number | null,
    { contactInfo, shippingInfo, orderItems, paymentInfo }: PlaceOrderBodyDTO,
  ) {
    const dProducts = await this.productsService.getDProductsByIds(
      orderItems.map(item => item.dProductId),
    );

    let order = this.ordersRepo.create({
      subdomainName,
      customerId,
      contactInfo,
      shippingInfo,
      paymentInfo,
      orderItems,
      dProducts,
    });

    order = await this.ordersRepo.save(order);

    const _20_MIN = 1000 * 60 * 10;

    setTimeout(() => {
      void this.ordersRepo.findOneBy({ id: order.id }).then(order => {
        if (order?.id && order?.status === OrderStatusEnum.PENDING) {
          void this.ordersRepo.delete({ id: order.id });
        }
      });
    }, _20_MIN);

    return order;
  }

  async deletePendingOrders() {
    const now = dayjs();

    const orders = await this.ordersRepo.find({
      select: ['id', 'createdAt'],
      where: { status: OrderStatusEnum.PENDING },
    });

    const orderIds = orders
      .filter(order => dayjs(order.createdAt).add(20, 'minutes').isBefore(now))
      .map(order => order.id);

    await this.ordersRepo.delete(orderIds);
  }

  async placeOrderAtAliexpress(orderId: number) {
    const order = await this.ordersRepo.findOneByOrFail({ id: orderId });

    const result = await this.aliexpressService.orderCreatePay(order);
    const aliOrderId = result.order_list.number[0];

    return this.ordersRepo.update(orderId, { aliOrderId, status: OrderStatusEnum.PLACED });
  }

  getUnpaidOrders() {
    return this.ordersRepo.findBy({ status: OrderStatusEnum.PLACED });
  }

  updateOrderStatus(orderId: number, status: OrderStatusEnum) {
    return this.ordersRepo.update(orderId, { status });
  }

  updateOrderInfo({ orderId, ...dto }: UpdateOrderInfoBodyDTO) {
    return this.ordersRepo.update(orderId, dto);
  }

  getByCustomer(customerId: number) {
    return this.ordersRepo.findBy({ customerId });
  }
}
