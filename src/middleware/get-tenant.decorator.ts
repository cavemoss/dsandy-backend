import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Tenant } from 'src/admin/entities/tenant.entity';

export const GetTenant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<Request>()['tenant'] as Tenant;
});
