import { Injectable } from '@nestjs/common';

import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramRef {
  constructor(private readonly telegramService: TelegramService) {}
}
