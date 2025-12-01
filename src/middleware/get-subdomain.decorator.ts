import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetSubdomain = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<Request>()['subdomain'] as string;
});
