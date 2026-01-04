import { Controller, Get, Query } from '@nestjs/common';

import { AliexpressService } from '../services/aliexpress.service';

@Controller('aliexpress')
export class AliexpressController {
  constructor(private readonly service: AliexpressService) {}

  // https://api-sg.aliexpress.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=https%3A%2F%2Fdsandy.cloudpub.ru%2Faliexpress%2Fauth-callback&client_id=521226

  @Get('auth-callback')
  getFirstAccessToken(@Query('code') code: string) {
    return this.service.getFirstAccessToken(code);
  }
}
