import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Customer } from 'src/customers/entities/customer.entity';

export const GetCustomer = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<Request>()['customer'] as Customer;
});
