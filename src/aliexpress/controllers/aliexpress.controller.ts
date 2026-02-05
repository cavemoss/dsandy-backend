import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { handleError } from 'lib/utils';
import { PrivateApiGuard } from 'src/auth/guards/private-api.guard';
import { LoggerService } from 'src/logger/logger.service';

import { AliexpressService } from '../services/aliexpress.service';

@Controller('aliexpress')
export class AliexpressController {
  constructor(
    private readonly service: AliexpressService,
    private readonly logger: LoggerService,
  ) {}

  // admin: https://api-sg.aliexpress.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=https%3A%2F%2Fdsandy.cloudpub.ru%2Faliexpress%2Fauth-callback&client_id=521226
  // support: https://api-sg.aliexpress.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=https%3A%2F%2Fdsandy.cloudpub.ru%2Faliexpress%2Fauth-callback&client_id=526966

  @Get('auth-callback')
  getFirstAccessToken(@Query('code') code: string) {
    return this.service.getFirstAccessToken(code);
  }

  @Get('order-tracking/:aliOrderId')
  @UseGuards(PrivateApiGuard)
  orderTracking(
    @Param('aliOrderId') aliOrderId: string,

    @Query('lang') lang?: string,
  ) {
    return this.service
      .orderTracking(+aliOrderId, lang)
      .then(res => res ?? 'Order Pending')

      .catch(error => {
        handleError(this.logger, error, {
          ALI_FAIL: 'Order tracking request failed',
        });
      });
  }
}
