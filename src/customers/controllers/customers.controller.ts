import { Body, Controller, Get, Headers, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetCustomer } from 'src/middleware/get-customer.decorator';
import { GetSubdomain } from 'src/middleware/get-subdomain.decorator';

import { CreateCustomerDTO } from '../dto/customers.dto';
import { Customer } from '../entities/customer.entity';
import { CustomersService } from '../services/customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Post()
  create(@GetSubdomain() subdomain: string, @Body() body: CreateCustomerDTO) {
    return this.service.create(subdomain, body);
  }

  @Patch()
  patch(
    @GetSubdomain() subdomain: string,
    @Headers('x-customer-id') customerId: string,
    @Body() body: Partial<Customer>,
  ) {
    return this.service.patch(+customerId, body);
  }

  @Get('by-jwt-token')
  @UseGuards(JwtAuthGuard)
  get(@GetSubdomain() subdomain: string, @GetCustomer() customer: Customer) {
    return this.service.validateCustomerBySubdomain(subdomain, customer);
  }
}
