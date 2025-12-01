import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { PrivateApiGuard } from 'src/auth/guards/private-api.guard';

import { AliexpressService } from './services/aliexpress.service';

@Controller('aliexpress')
@UseGuards(PrivateApiGuard)
export class AliexpressController {
  constructor(private readonly service: AliexpressService) {}

  @Post('get-first-access-token')
  getFirstAccessToken(@Query('code') code: string) {
    return this.service.getFirstAccessToken(code);
  }
}
