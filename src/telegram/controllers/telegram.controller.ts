import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { PrivateApiGuard } from 'src/auth/guards/private-api.guard';

import { TelegramService } from '../services/telegram.service';

@Controller('telegram')
@UseGuards(PrivateApiGuard)
export class TelegramController {
  constructor(private readonly service: TelegramService) {}

  @Post('test-msg')
  testMsg(@Query('msg') msg: string) {
    return this.service.testMsg(msg);
  }
}
