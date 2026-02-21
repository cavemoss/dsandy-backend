import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PrivateApiGuard } from 'src/auth/guards/private-api.guard';
import { OrdersService } from 'src/orders/services/orders.service';

@Controller('admin/manual')
@UseGuards(PrivateApiGuard)
export class AdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('set-order-shipped/:orderId')
  setOrderShipped(@Param('orderId') orderId: string) {
    return this.ordersService.setOrderShipped(+orderId);
  }
}
