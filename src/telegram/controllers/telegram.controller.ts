import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { PrivateApiGuard } from 'src/auth/guards/private-api.guard';

import { TelegramService } from '../services/telegram.service';

@Controller('telegram')
@UseGuards(PrivateApiGuard)
export class TelegramController {
  constructor(private readonly service: TelegramService) {}

  @Post('test')
  testMsg(@Query('msg') msg: string, @Query('parseMode') parseMode: string) {
    return this.service.testMsg(msg, parseMode);
  }
}
