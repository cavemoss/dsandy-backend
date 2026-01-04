import { Body, Controller, Get, Headers, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetSubdomain } from 'src/middleware/get-subdomain.decorator';

import { PlaceOrderBodyDTO, UpdateOrderInfoBodyDTO } from '../dto/orders.dto';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  place(
    @GetSubdomain() subdomain: string,
    @Headers('x-customer-id') customerId: string,
    @Body() body: PlaceOrderBodyDTO,
  ) {
    return this.service.place(subdomain, +customerId || null, body);
  }

  @Patch()
  update(@Body() body: UpdateOrderInfoBodyDTO) {
    return this.service.updateOrderInfo(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  get(@Headers('x-customer-id') customerId: string) {
    return this.service.getByCustomer(+customerId);
  }

  @Get('anon')
  getAnon(@Query('ids') orderIds: string) {
    return this.service.getAnon(orderIds.split(';').map(Number));
  }
}
